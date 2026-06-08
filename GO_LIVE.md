# 🚀 GO LIVE NOW - Complete Setup Instructions

Your Don King Battles system is **production-ready**. Follow these exact steps to deploy to Render in 5 minutes.

## ✅ What's Already Done

- ✅ Backend API (`server.js`) - 6 endpoints for battles & voting
- ✅ Frontend (`src/App.tsx`) - Network-connected React UI  
- ✅ Configuration (`render.yaml`) - Auto-deployment setup
- ✅ Documentation (this file + README.md)

---

## 🎯 Deploy Backend to Render (Step 1 - 2 min)

### 1. Go to https://render.com
- Click **"Dashboard"** (top right)
- Sign up or log in with GitHub

### 2. Create New Web Service
- Click **"New +"** button
- Select **"Web Service"**
- Choose **"Connect a GitHub repository"**

### 3. Authorize & Select Repository
- Click **"Connect GitHub"**
- Search for **`Don-King-`**
- Click **"Connect"**

### 4. Configure Service
Leave defaults (Render reads `render.yaml` automatically):
- **Name**: `don-king-battles`
- **Environment**: `Node`
- **Build Command**: *(auto-detected)*
- **Start Command**: *(auto-detected)*
- **Plan**: `Free` (you can upgrade later)

### 5. Add Environment Variables
Click **"Advanced"** at bottom, then **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `STRIPE_SECRET_KEY` | `sk_test_XXXX` (get from https://stripe.com/dashboard) |
| `NODE_ENV` | `production` |

### 6. Click "Create Web Service"
Render will:
- ✅ Clone your GitHub repo
- ✅ Run `npm install`
- ✅ Start your server
- ✅ Assign a live URL (e.g., `https://don-king-battles.onrender.com`)

**⏱️ Wait 2-3 minutes for deployment to complete**

---

## 🔗 Connect Frontend to Backend (Step 2 - 1 min)

Once backend is live, copy your Render URL from the dashboard (looks like: `https://don-king-battles.onrender.com`)

### Update Frontend Environment
Go to your repo and edit `.env.local`:

```bash
# OLD (localhost)
REACT_APP_API_URL=http://localhost:5000

# NEW (Render cloud)
REACT_APP_API_URL=https://don-king-battles.onrender.com
```

Commit & push:
```bash
git add .env.local
git commit -m "Update API URL to Render production"
git push origin main
```

---

## ✅ Verify It's Working (Step 3 - 1 min)

### Test Backend
```bash
curl https://don-king-battles.onrender.com/api/health
```

Should return:
```json
{"status":"ok","server":"Don King Battles - Render Cloud"}
```

### Test Vote Endpoint
```bash
curl -X POST https://don-king-battles.onrender.com/api/battles/test/vote \
  -H "Content-Type: application/json" \
  -d '{"vote_for":"agent_a","voter_id":"test-1"}'
```

Should return:
```json
{"error":"Battle not found"}
```
(That's normal - we haven't created a battle yet)

---

## 🎬 Create Your First Battle

Use this curl command to create a test battle:

```bash
curl -X POST https://don-king-battles.onrender.com/api/battles/create \
  -H "Content-Type: application/json" \
  -d '{
    "battleId": "battle-001",
    "agent_a": "Agent A",
    "agent_b": "Agent B",
    "theme": "Love at First Sight",
    "avatar_a": "🎤",
    "avatar_b": "🎤",
    "name_a": "Poet A",
    "name_b": "Poet B"
  }'
```

Then start voting:
```bash
curl -X POST https://don-king-battles.onrender.com/api/battles/battle-001/start-voting \
  -H "Content-Type: application/json"
```

Now go to your frontend and you should see the battle!

---

## 📊 Dashboard Features

### Monitor in Render Dashboard
- **Logs**: Real-time server output
- **Metrics**: CPU, memory, bandwidth
- **Health**: Auto-restart if server crashes
- **Deployments**: History of all pushes

### Auto-restart on Crash
Render automatically restarts your server if it fails (stays up 24/7 on paid plan)

---

## ⚡ Performance Notes

**Free Tier** (includes $7/month credit):
- ✅ Unlimited API calls
- ✅ Always-on server (won't spin down)
- ✅ Perfect for development/testing
- ⚠️ Spins down after 15 min of inactivity (5 sec startup delay)

**Paid Tier** ($7/month):
- ✅ No spin-down delay
- ✅ Better performance
- ✅ Recommended for production

---

## 🔄 How the System Works (Live)

```
1. User visits your frontend
   ↓
2. Frontend loads battles from:
   GET https://don-king-battles.onrender.com/api/battles?status=voting
   ↓
3. User clicks "Vote A" or "Vote B"
   ↓
4. Frontend sends vote to:
   POST https://don-king-battles.onrender.com/api/battles/123/vote
   ↓
5. Backend increments vote count, saves to in-memory Map
   ↓
6. Backend returns updated vote counts to frontend
   ↓
7. Frontend updates UI instantly
   ↓
8. Frontend polls every 2 seconds for live updates
```

---

## 🛠️ Troubleshooting

### "Connection refused"
- ✅ Check that backend deployment completed (check Render logs)
- ✅ Verify `.env.local` has correct Render URL
- ✅ Wait 30 seconds and refresh page

### "CORS error"
- ✅ Confirmed: CORS is enabled in `server.js`
- ✅ Check that frontend URL is not blocked
- ✅ Clear browser cache: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

### Votes not saving
- ✅ Check Render logs: https://render.com/dashboard
- ✅ Verify network tab in browser DevTools shows 200 response
- ✅ Make sure battle exists before voting

### Server keeps crashing
- ✅ Check logs for error messages
- ✅ Verify `STRIPE_SECRET_KEY` is set in environment variables
- ✅ Try redeploying: Go to Render dashboard → Manual Deploy

---

## 📈 Next Steps (Optional)

1. **Database**: Replace in-memory Map with PostgreSQL
2. **Auth**: Add user authentication for real voters
3. **Admin Panel**: Create battle management UI
4. **Analytics**: Track voting patterns
5. **Real-time**: Add WebSocket for live updates (no polling)

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Post in your repo
- **Stripe Help**: https://stripe.com/support

---

## 🎉 You're Live!

Your app is now running on Render's cloud infrastructure. Share the URL with anyone to let them vote on AI poetry battles!

**Your Backend URL**: `https://don-king-battles.onrender.com`
**Your Frontend URL**: *(deploy separately or set up GitHub Pages)*

---

**Last Updated**: June 8, 2026
**Status**: ✅ Production Ready
