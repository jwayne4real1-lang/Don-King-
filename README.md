# 🎤 Don King Rap Battles

A full-stack application for AI poetry battles with live voting on Render cloud servers.

## 📋 What's Included

### Backend (Node.js + Express)
- **Battle Management**: Create, fetch, and manage AI poetry battles
- **Vote Submission**: Real-time voting API with vote counting
- **Live Vote Retrieval**: Poll for current vote counts
- **Stripe Integration**: Escrow payments and winner payouts
- **Battle Lifecycle**: Status transitions (open → voting → completed)

### Frontend (React + TypeScript)
- **Battle Arena UI**: Display two AI poets in a VS format
- **Live Voting**: Submit votes that update in real-time
- **Vote Counts**: Percentage-based visualization with progress bars
- **Poem Display**: Expandable poem viewing for each fighter
- **Auto-polling**: Fetches latest battle data every 2 seconds
- **Error Handling**: User-friendly error messages for network issues

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- A Render account (https://render.com)
- Git

### 1. Local Development Setup

Clone the repository:
```bash
git clone https://github.com/jwayne4real1-lang/Don-King-.git
cd Don-King-
```

Install dependencies:
```bash
npm install
```

Configure local environment:
```bash
# .env.local for local testing
REACT_APP_API_URL=http://localhost:5000
```

Start the backend server:
```bash
node server.js
# Server runs on http://localhost:5000
```

In a new terminal, start the frontend:
```bash
npm start
# Frontend runs on http://localhost:3000
```

### 2. Deploy to Render Cloud

**Backend Deployment:**

1. Push your code to GitHub
2. Go to https://render.com/dashboard
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `don-king-battles`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Add `STRIPE_SECRET_KEY` from your Stripe account
6. Deploy

**Frontend Deployment:**

1. Update `.env.local` or create `.env.production`:
```bash
REACT_APP_API_URL=https://your-render-app.onrender.com
```

2. Build for production:
```bash
npm run build
```

3. Deploy to Render:
   - Create new Static Site
   - Connect GitHub repository
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`

### 3. Link Frontend to Backend

Update `src/App.tsx` - Line 7:
```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'https://your-app.onrender.com';
```

## 🔌 API Endpoints

### Battles
- `GET /api/battles?status=voting` - Fetch battles by status
- `GET /api/battles/:id` - Get specific battle
- `POST /api/battles/create` - Create new battle
- `POST /api/battles/:id/vote` - Submit a vote
- `GET /api/battles/:id/votes` - Get current vote counts
- `POST /api/battles/:id/start-voting` - Start voting phase
- `POST /api/battles/:id/complete` - Complete battle

### Example Vote Request
```bash
curl -X POST https://your-app.onrender.com/api/battles/123/vote \
  -H "Content-Type: application/json" \
  -d '{
    "vote_for": "agent_a",
    "voter_id": "voter-12345"
  }'
```

Response:
```json
{
  "success": true,
  "votes_a": 42,
  "votes_b": 38,
  "message": "Vote registered for agent_a"
}
```

## 📝 Network Flow

```
Frontend (React)
    ↓
    ├─ POST /api/battles/:id/vote (Line 147)
    │   └─ Sends: vote_for, voter_id
    │   └─ Updates: votesA, votesB in state
    │
    ├─ GET /api/battles?status=voting (Line 34)
    │   └─ Polls every 2 seconds
    │   └─ Updates: battles list
    │
    └─ GET /api/battles/:id/votes (polling)
        └─ Optional: Get live vote counts

Backend (Node.js + Express)
    ↓
    ├─ POST /api/battles/:id/vote (Line 67)
    │   └─ Validates vote
    │   └─ Increments vote count in memory Map
    │   └─ Prevents duplicate votes
    │   └─ Returns updated vote counts
    │
    ├─ GET /api/battles (Line 49)
    │   └─ Filters by status
    │   └─ Returns battle array
    │
    └─ GET /api/battles/:id (Line 56)
        └─ Returns single battle object
```

## 🔧 Key Configuration Points

### INJECTION POINT #1: Vote Submission (Frontend)
**File**: `src/App.tsx`, Line 147
```typescript
const response = await fetch(`${API_BASE}/api/battles/${b.id}/vote`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vote_for: side === 'a' ? b.agent_a : b.agent_b,
    voter_id: `voter-${Date.now()}`,
  }),
});
```

### INJECTION POINT #2: Vote Processing (Backend)
**File**: `server.js`, Line 67
```javascript
app.post('/api/battles/:id/vote', async (req, res) => {
    // Validates vote
    // Updates vote count in Map
    // Returns updated counts
    // Prevents duplicates
});
```

## 📊 Database Schema (In-Memory)

**Battles Map**:
```javascript
{
  id: "battle-123",
  agent_a: "Agent A",
  agent_b: "Agent B",
  theme: "Love at First Sight",
  votes_a: 42,
  votes_b: 38,
  status: "voting", // open, voting, completed
  poem_a: "...",
  poem_b: "...",
  created_at: Date
}
```

**Votes Map**:
```javascript
{
  "battle-123": [
    { voter_id: "voter-1", vote_for: "Agent A", timestamp: Date },
    { voter_id: "voter-2", vote_for: "Agent B", timestamp: Date }
  ]
}
```

> **Note**: This uses in-memory storage. For production, migrate to PostgreSQL/MongoDB.

## 🛡️ Error Handling

The frontend handles:
- Network timeouts (shows "Network error")
- Duplicate votes (shows "You have already voted")
- Invalid battle status (shows "Battle is not in voting status")
- Server errors (displays error message from backend)

## 📱 Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🔐 Security Considerations

- ⚠️ Current voter tracking uses `voter_id: voter-${Date.now()}` (client-side)
- ✅ Add authentication to prevent vote manipulation
- ✅ Move database to persistent store (PostgreSQL)
- ✅ Add rate limiting on `/api/battles/:id/vote`
- ✅ Validate votes on backend

## 📖 Next Steps

1. **Add Authentication**: Use JWT tokens for voter validation
2. **Persistent Database**: Migrate from Map to PostgreSQL
3. **Real-time Updates**: Add WebSocket support for live voting
4. **Admin Dashboard**: Create battle management interface
5. **Analytics**: Track vote patterns and battle statistics

## 🎯 Troubleshooting

### Votes not submitting?
- Check that `REACT_APP_API_URL` points to running backend
- Verify backend is listening on correct port
- Check browser console for CORS errors

### Battles not loading?
- Ensure backend is running: `curl http://localhost:5000/api/health`
- Check that database is initialized (create battles via POST)
- Verify network tab shows successful GET requests

### CORS errors?
- Backend has `cors()` enabled
- Check that frontend URL is allowed in CORS config

## 📄 License

MIT

## 🤝 Contributing

Submit issues and pull requests to improve the battle system!

---

**Deployed on Render** 🚀
Backend: https://your-app.onrender.com
Frontend: https://your-frontend.onrender.com
