# 🚀 Deployment Guide - Don King Battles

## Quick Deploy to Render

### Step 1: Connect GitHub Repository
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select **`jwayne4real1-lang/Don-King-`** repository

### Step 2: Configure Deployment
Render will auto-detect `render.yaml`. Confirm these settings:

- **Name**: `don-king-battles`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: Free (upgradeable)

### Step 3: Add Environment Variables

In Render dashboard, add:

```
STRIPE_SECRET_KEY = sk_test_your_key_from_stripe
NODE_ENV = production
PORT = 5000
```

### Step 4: Deploy!

Click **"Create Web Service"** and Render will:
1. Clone your GitHub repo
2. Run `npm install`
3. Start server with `node server.js`
4. Assign a live URL like `https://don-king-battles.onrender.com`

---

## ✅ Verify Deployment

Test your live backend:

```bash
curl https://don-king-battles.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","server":"Don King Battles - Render Cloud"}
```

---

## 🔗 Connect Frontend

Update your frontend `.env.local`:

```bash
REACT_APP_API_URL=https://don-king-battles.onrender.com
```

Redeploy frontend, and it will now connect to your live backend! 🎉

---

## 📊 Monitor Your Deployment

- **Logs**: Render dashboard shows real-time server logs
- **Health Check**: Automatic pings to `/api/health` every 30 seconds
- **Auto-restart**: Server restarts if it crashes
- **Free tier limits**: 750 free hours/month (auto-pauses after 15 min inactivity)

---

## 🛠️ Troubleshooting

### Server won't start?
- Check logs in Render dashboard
- Verify `STRIPE_SECRET_KEY` env var is set
- Ensure `package.json` has correct `main: server.js`

### Votes not working?
- Test backend: `curl https://don-king-battles.onrender.com/api/battles`
- Check frontend `.env.local` points to correct URL
- Verify CORS is enabled (already configured in `server.js`)

### Build fails?
- Check `npm install` succeeds locally first
- Verify `package.json` dependencies are correct
- Check Node version compatibility (Node 18.x required)

---

## 📈 Next Steps

1. **Add Database**: Replace in-memory Map with PostgreSQL
2. **Scale Up**: Upgrade to paid Render plan for always-on server
3. **Add Auth**: Implement JWT for voter validation
4. **WebSockets**: Real-time voting without polling
5. **Analytics**: Track battle statistics and trends
