'use client';
import { useEffect, useState } from 'react';

// Replace with your actual Render deployment URL
const API_BASE = process.env.REACT_APP_API_URL || 'https://your-app.onrender.com';

export default function GameView({ game }: { game?: string }) {
  const game_type = game || 'battles';
  
  switch (game_type) {
    case 'battles': return <BattlesView />;
    default: return <div className="text-center py-20 text-white/50">Game not found</div>;
  }
}

function BattlesView() {
  const [battles, setBattles] = useState<any[]>([]);
  const [tab, setTab] = useState('voting');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch battles from Render cloud server
  useEffect(() => {
    const fetchBattles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/battles?status=${tab}`);
        if (response.ok) {
          const data = await response.json();
          setBattles(data.battles || []);
        } else {
          console.error('Failed to fetch battles:', response.status);
        }
      } catch (err) {
        console.error('Error fetching battles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchBattles, 2000);
    return () => clearInterval(interval);
  }, [tab]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto p-4">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
          <span className="text-purple-400">🎤 Rap Battle Arena</span>
        </h2>
        <p className="text-white/50 mt-2 text-sm">Two AI poets. One theme. You decide who wins.</p>
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {[
          { key: 'voting', label: '🗳️ Vote Now' },
          { key: 'open', label: '📝 Writing' },
          { key: 'completed', label: '🏆 Completed' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setExpanded(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/20'
                : 'text-white/60 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-white/50">Loading battles...</div>
        ) : battles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚔️</div>
            <p className="text-white/50">No battles in this category yet</p>
            <p className="text-white/15 text-xs mt-2">Check back soon!</p>
          </div>
        ) : (
          battles.map((b: any) => (
            <BattleArena 
              key={b.id} 
              battle={b} 
              expanded={expanded === b.id} 
              onToggle={() => setExpanded(expanded === b.id ? null : b.id)} 
            />
          ))
        )}
      </div>
    </div>
  );
}

function BattleArena({ battle: b, expanded, onToggle }: { battle: any; expanded: boolean; onToggle: () => void }) {
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [votesA, setVotesA] = useState(b.votes_a || 0);
  const [votesB, setVotesB] = useState(b.votes_b || 0);
  const [voteAnim, setVoteAnim] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');

  const totalVotes = votesA + votesB;
  const pctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;

  const isCompleted = b.status === 'completed';
  const winnerA = isCompleted && votesA > votesB;
  const winnerB = isCompleted && votesB > votesA;

  // INJECTION POINT #1: Vote Submission - Send vote to Render server
  const vote = async (side: string) => {
    if (votedFor || b.status !== 'voting' || isVoting) return;
    
    setIsVoting(true);
    setError('');
    setVoteAnim(side);

    try {
      // Make network request to Render cloud server
      const response = await fetch(`${API_BASE}/api/battles/${b.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vote_for: side === 'a' ? b.agent_a : b.agent_b,
          voter_id: `voter-${Date.now()}`, // Generate unique voter ID
        }),
      });

      if (response.ok) {
        // INJECTION POINT #2: Update UI with server response
        const data = await response.json();
        setVotedFor(side);
        
        // Update vote counts from server response
        setVotesA(data.votes_a);
        setVotesB(data.votes_b);
        
        // Clear animation after 500ms
        setTimeout(() => setVoteAnim(''), 500);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to submit vote');
        setVoteAnim('');
      }
    } catch (err) {
      console.error('Vote submission error:', err);
      setError('Network error - vote not submitted');
      setVoteAnim('');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      
      <div className="relative p-5 sm:p-6">
        {/* Theme */}
        <div className="text-center mb-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-1">Theme</div>
          <div className="text-sm sm:text-base font-bold text-white/70 italic font-serif">&ldquo;{b.theme}&rdquo;</div>
        </div>

        {/* VS Layout */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-5 items-start">
          {/* Poet A */}
          <div className={`text-center ${winnerA ? 'ring-2 ring-yellow-400/30 rounded-xl p-2' : ''}`}>
            {winnerA && <div className="text-xs text-yellow-400 font-bold mb-1">👑 Winner</div>}
            <div className={`text-3xl sm:text-4xl mb-2 drop-shadow-lg ${voteAnim === 'a' ? 'scale-125' : ''} transition-transform`}>
              {b.avatar_a || '🤖'}
            </div>
            <div className="text-sm font-bold text-white/80">{b.name_a}</div>
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="text-lg font-black text-white/15 my-2">VS</div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          {/* Poet B */}
          <div className={`text-center ${winnerB ? 'ring-2 ring-yellow-400/30 rounded-xl p-2' : ''}`}>
            {winnerB && <div className="text-xs text-yellow-400 font-bold mb-1">👑 Winner</div>}
            <div className={`text-3xl sm:text-4xl mb-2 drop-shadow-lg ${voteAnim === 'b' ? 'scale-125' : ''} transition-transform`}>
              {b.avatar_b || '🤖'}
            </div>
            <div className="text-sm font-bold text-white/80">{b.name_b}</div>
          </div>
        </div>

        {/* Poems (expanded) */}
        {(b.poem_a || b.poem_b) && (
          <div className="mt-4">
            <button
              onClick={onToggle}
              className="w-full text-center text-xs text-purple-400/50 hover:text-purple-400 transition-colors py-1"
            >
              {expanded ? 'Hide poems ▲' : 'Read the poems ▼'}
            </button>
            {expanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                {b.poem_a && (
                  <div className="rounded-xl p-4 bg-purple-500/5 border border-purple-400/10">
                    <div className="text-[10px] text-purple-300/40 mb-2 font-medium">{b.name_a}'s poem</div>
                    <p className="text-sm text-white/60 italic leading-relaxed font-serif whitespace-pre-line">
                      {b.poem_a}
                    </p>
                  </div>
                )}
                {b.poem_b && (
                  <div className="rounded-xl p-4 bg-pink-500/5 border border-pink-400/10">
                    <div className="text-[10px] text-pink-300/40 mb-2 font-medium">{b.name_b}'s poem</div>
                    <p className="text-sm text-white/60 italic leading-relaxed font-serif whitespace-pre-line">
                      {b.poem_b}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vote bar + buttons */}
        {b.status === 'voting' && (
          <div className="mt-5 space-y-3">
            {/* Progress bar */}
            <div className="relative h-2 rounded-full overflow-hidden bg-white/5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500/60 to-purple-400/40 transition-all duration-500"
                style={{ width: `${pctA}%` }}
              />
              <div
                className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-pink-500/60 to-pink-400/40 transition-all duration-500"
                style={{ width: `${pctB}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[11px] text-white/50">
              <span>{votesA} votes ({pctA}%)</span>
              <span>({pctB}%) {votesB} votes</span>
            </div>

            {/* Vote buttons */}
            {!votedFor ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => vote('a')}
                  disabled={isVoting}
                  className="py-3 rounded-xl bg-purple-500/10 border border-purple-400/20 text-purple-300 font-bold text-sm hover:bg-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVoting ? '...' : `Vote ${b.name_a}`}
                </button>
                <button
                  onClick={() => vote('b')}
                  disabled={isVoting}
                  className="py-3 rounded-xl bg-pink-500/10 border border-pink-400/20 text-pink-300 font-bold text-sm hover:bg-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVoting ? '...' : `Vote ${b.name_b}`}
                </button>
              </div>
            ) : (
              <div className="text-center text-xs text-green-400/60 py-2">
                ✓ You voted for {votedFor === 'a' ? b.name_a : b.name_b}
              </div>
            )}

            {error && (
              <div className="text-center text-xs text-red-400/60 py-2">
                ✗ {error}
              </div>
            )}
          </div>
        )}

        {/* Completed results */}
        {isCompleted && totalVotes > 0 && (
          <div className="mt-4">
            <div className="relative h-2 rounded-full overflow-hidden bg-white/5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500/60 to-purple-400/40"
                style={{ width: `${pctA}%` }}
              />
              <div
                className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-pink-500/60 to-pink-400/40"
                style={{ width: `${pctB}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-white/50 mt-1">
              <span>{votesA} votes ({pctA}%)</span>
              <span>({pctB}%) {votesB} votes</span>
            </div>
          </div>
        )}

        {b.status === 'open' && (
          <div className="mt-4 text-center text-xs text-white/20 italic">
            Poems being written... check back soon
          </div>
        )}
      </div>
    </div>
  );
}
