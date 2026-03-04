# Render Deployment Guide (Simpler & More Reliable)

Render is more straightforward than Railway and works better for Python apps.

---

## Why Render Instead of Railway?

- ✅ Simpler configuration (no Dockerfile needed)
- ✅ Clearer error messages
- ✅ Works reliably first time
- ✅ Still completely free
- ✅ Same auto-deploy from GitHub

---

## Step 1: Make Sure Files Are in GitHub

Your repo should have:
```
water-calculator/
├── app.py ✅
├── requirements.txt ✅ (with gunicorn)
├── .env.example
├── README.md
└── frontend/
    └── App.jsx
```

That's it! You don't need Dockerfile, Procfile, or railway.json for Render.

---

## Step 2: Update requirements.txt (If Not Done)

Make sure your `requirements.txt` has:
```
Flask==2.3.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
requests==2.31.0
openai==1.3.0
gunicorn==21.2.0
```

In GitHub:
1. Click on `requirements.txt`
2. Click pencil icon (edit)
3. Paste the above
4. Click "Commit changes"

---

## Step 3: Deploy Backend on Render

1. Go to **render.com** (create free account if needed)
2. Click **"Dashboard"** (top left)
3. Click **"New +"** (top right)
4. Click **"Web Service"**
5. Click **"Connect account"** (GitHub)
6. Authorize Render to access GitHub
7. Find your `water-calculator` repo
8. Click **"Connect"** next to it
9. Fill in the form with **exactly** these values:

```
Name: water-calc-backend
Runtime: Python 3.9
Root Directory: (leave blank)
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

10. Scroll down to **Plan**
11. Select the **"Free"** tier
12. Click **"Create Web Service"**

**Wait 5-10 minutes** while it deploys...

You'll see:
- "Building..." (blue)
- "Build successful" (green)
- "Deploying..." (blue)
- "Deployed" (green) ✅

13. Copy the URL it gives you (looks like: `https://water-calc-backend.onrender.com`)
14. Save this URL - you need it for the frontend!

---

## Step 4: Add Environment Variables to Render

1. In Render, go to your service
2. Click **"Environment"** (left sidebar)
3. Click **"Add Environment Variable"**
4. Add:
   - **Key:** `SECRET_KEY`
   - **Value:** `dev-secret-key-prod-12345` (any random string)
5. Click **"Add Environment Variable"** again
6. Add:
   - **Key:** `FLASK_ENV`
   - **Value:** `production`
7. Click **"Save"**

Render will auto-redeploy with these variables ✅

---

## Step 5: Deploy Frontend on Vercel

1. Go to **vercel.com** (create free account if needed)
2. Click **"Add New"** (top right)
3. Click **"Project"**
4. Click **"Import Git Repository"**
5. Find your `water-calculator` repo
6. Click **"Import"**
7. Fill in settings:
   - **Framework Preset:** React
   - **Root Directory:** ./ (or blank)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

8. Click **"Environment Variables"** (expand it)
9. Add:
   - **Name:** `REACT_APP_API_BASE_URL`
   - **Value:** `https://water-calc-backend.onrender.com` (from Step 3)

10. Click **"Deploy"**

**Wait 3-5 minutes...**

You'll see:
- "Building..." (blue)
- "Deployment successful" (green) ✅

11. Copy your Vercel URL (looks like: `https://water-calculator.vercel.app`)

---

## Step 6: Test It!

1. Open your Vercel URL: `https://water-calculator.vercel.app`
2. You should see the login page
3. Enter your OpenAI email
4. Enter your OpenAI API key (from https://platform.openai.com/account/api-keys)
5. Click **"Connect OpenAI Account"**
6. Wait 10 seconds...
7. You should see your water impact dashboard! 💧

---

## If Something Goes Wrong

### "Build failed on Render"

Go to **Render dashboard** → your service → **Logs** tab

Look for error messages. Common fixes:

**Error: "No module named 'flask'"**
- Make sure `requirements.txt` is in your repo root
- Make sure it has `Flask==2.3.0`

**Error: "gunicorn not found"**
- Make sure `requirements.txt` has `gunicorn==21.2.0`
- Commit the change to GitHub

**Error: "ModuleNotFoundError"**
- Check your `app.py` is in repo root
- Check spelling of filenames

### "Frontend won't load backend"

1. Check your `REACT_APP_API_BASE_URL` in Vercel
2. Make sure it's your Render URL (with `https://`)
3. Make sure there's no trailing slash: `https://water-calc-backend.onrender.com` ✅ (not `.../`)

### "Render is sleeping/slow"

On free tier, Render sleeps after 15 minutes. When you visit:
- First request takes 30 seconds (waking up)
- After that: instant

**To keep it awake (optional):**
1. Go to **uptimerobot.com**
2. Create free account
3. Add monitor for your Render URL
4. Set to ping every 5 minutes
5. Render stays awake 24/7

---

## Understanding Render's Free Tier

**What you get:**
- ✅ One free Web Service
- ✅ Unlimited bandwidth
- ✅ Auto-deploy from GitHub
- ✅ Auto-redeploy on push
- ✅ Free SSL/HTTPS

**Limitations:**
- ⚠️ Service spins down after 15 min of inactivity
- ⚠️ First request after sleeping takes ~30 seconds
- ⚠️ Only 750 hours/month (about 31 days)

**For your use case:** Perfect! The 30-second wake-up is fine.

---

## Your Final Setup

```
GitHub (your code)
    ↓ auto-deploys
Render (backend running)
    ↓ 
Vercel (frontend running)
    ↓
Live App! 🚀
```

Every time you push to GitHub:
- Render auto-deploys backend
- Vercel auto-deploys frontend
- No manual steps needed!

---

## File Checklist for Render

You need in GitHub:
- ✅ `app.py`
- ✅ `requirements.txt` (with gunicorn)
- ✅ `.env.example`
- ✅ `frontend/App.jsx`

You DON'T need:
- ❌ Dockerfile
- ❌ Procfile
- ❌ railway.json

Render figures it out automatically!

---

## Next Steps

1. **Update `requirements.txt`** (if not done)
2. **Go to render.com** → Create free account
3. **Connect GitHub** (authorize)
4. **Create Web Service** (fill form exactly as shown)
5. **Wait 10 minutes** for deploy
6. **Copy Render URL**
7. **Go to vercel.com** → Create free account
8. **Import your repo**
9. **Add REACT_APP_API_BASE_URL environment variable**
10. **Deploy**
11. **Test!** Open Vercel URL and login

Total time: ~20 minutes
Cost: $0/month
Result: Live app! 🎉

---

## Support

If you get stuck:
1. Check Render logs (Logs tab)
2. Check Vercel logs (Deployments tab)
3. Make sure both are green ✅
4. Try visiting the Render URL directly in browser (should see error or JSON)
5. Try refreshing after 30 seconds (Render might be waking up)

You've got this! 🚀
