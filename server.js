 // server.js
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// A. Escrow Entry Split Route
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

// B. Resolution Winner Route
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Fight Promotion Engine Server Online on port ${PORT}`));
