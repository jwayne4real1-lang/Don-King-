// server.js - Complete Render Cloud Server with Battle Voting System
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// In-memory database (replace with PostgreSQL/MongoDB in production)
const battles = new Map();
const votes = new Map();

// Initialize a battle (called before voting opens)
app.post('/api/battles/create', async (req, res) => {
    const { battleId, agent_a, agent_b, theme, avatar_a, avatar_b, name_a, name_b } = req.body;
    try {
        battles.set(battleId, {
            id: battleId,
            agent_a,
            agent_b,
            theme,
            avatar_a: avatar_a || '🤖',
            avatar_b: avatar_b || '🤖',
            name_a,
            name_b,
            votes_a: 0,
            votes_b: 0,
            status: 'open', // open -> voting -> completed
            poem_a: '',
            poem_b: '',
            created_at: new Date(),
        });
        votes.set(battleId, []);
        res.status(201).json({ success: true, battle: battles.get(battleId) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all battles
app.get('/api/battles', async (req, res) => {
    try {
        const status = req.query.status || 'voting'; // Filter by status: voting, open, completed
        const filteredBattles = Array.from(battles.values()).filter(b => b.status === status);
        res.json({ battles: filteredBattles });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific battle
app.get('/api/battles/:id', async (req, res) => {
    try {
        const battle = battles.get(req.params.id);
        if (!battle) return res.status(404).json({ error: 'Battle not found' });
        res.json(battle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// INJECTION POINT #1: Vote Submission - Submit a vote for a battle
app.post('/api/battles/:id/vote', async (req, res) => {
    const { vote_for, voter_id } = req.body;
    const battleId = req.params.id;
    
    try {
        const battle = battles.get(battleId);
        if (!battle) return res.status(404).json({ error: 'Battle not found' });
        if (battle.status !== 'voting') return res.status(400).json({ error: 'Battle is not in voting status' });

        // Prevent duplicate votes from same voter (in production, use user auth)
        const battleVotes = votes.get(battleId) || [];
        if (voter_id && battleVotes.some(v => v.voter_id === voter_id)) {
            return res.status(400).json({ error: 'You have already voted in this battle' });
        }

        // Record the vote
        if (vote_for === battle.agent_a) {
            battle.votes_a += 1;
        } else if (vote_for === battle.agent_b) {
            battle.votes_b += 1;
        } else {
            return res.status(400).json({ error: 'Invalid vote target' });
        }

        // Track voter
        if (voter_id) {
            battleVotes.push({ voter_id, vote_for, timestamp: new Date() });
            votes.set(battleId, battleVotes);
        }

        // Respond with updated vote counts
        res.status(200).json({
            success: true,
            votes_a: battle.votes_a,
            votes_b: battle.votes_b,
            message: `Vote registered for ${vote_for}`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// INJECTION POINT #2: Get Current Vote Counts - Fetch live vote counts
app.get('/api/battles/:id/votes', async (req, res) => {
    try {
        const battle = battles.get(req.params.id);
        if (!battle) return res.status(404).json({ error: 'Battle not found' });
        
        res.json({
            votes_a: battle.votes_a,
            votes_b: battle.votes_b,
            total_votes: battle.votes_a + battle.votes_b,
            status: battle.status
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Transition battle status (open -> voting)
app.post('/api/battles/:id/start-voting', async (req, res) => {
    try {
        const battle = battles.get(req.params.id);
        if (!battle) return res.status(404).json({ error: 'Battle not found' });
        battle.status = 'voting';
        res.json({ success: true, status: battle.status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Complete a battle (voting -> completed)
app.post('/api/battles/:id/complete', async (req, res) => {
    const { poem_a, poem_b } = req.body;
    try {
        const battle = battles.get(req.params.id);
        if (!battle) return res.status(404).json({ error: 'Battle not found' });
        
        battle.status = 'completed';
        battle.poem_a = poem_a || '';
        battle.poem_b = poem_b || '';
        
        res.json({
            success: true,
            winner: battle.votes_a > battle.votes_b ? battle.agent_a : battle.agent_b,
            battle
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// A. Escrow Entry Split Route (existing)
app.post('/api/matchmaking/escrow', async (req, res) => {
    const { battleId, fighterA_CustId, fighterB_CustId } = req.body;
    try {
        const amountCents = 1000; // $10.00 entry fee
        await stripe.paymentIntents.create({ 
            amount: amountCents, 
            currency: 'usd', 
            customer: fighterA_CustId, 
            confirm: true, 
            off_session: true 
        });
        await stripe.paymentIntents.create({ 
            amount: amountCents, 
            currency: 'usd', 
            customer: fighterB_CustId, 
            confirm: true, 
            off_session: true 
        });
        res.status(200).json({ success: true, message: "Escrow entry pool locked." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// B. Resolution Winner Route (existing)
app.post('/api/battles/payout', async (req, res) => {
    const { winnerStripeExpressId, battleId } = req.body;
    try {
        const payout = await stripe.transfers.create({
            amount: 1400, // Winner gets $14.00 payout
            currency: 'usd',
            destination: winnerStripeExpressId,
            description: `Don King Rap Battles - Fight Winnings ID: ${battleId}`
        });
        res.status(200).json({ success: true, retainedPromoterFee: 6.00, transactionId: payout.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Don King Battles - Render Cloud' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Fight Promotion Engine Server Online on port ${PORT}`));
