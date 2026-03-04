# Deployment Guide - DildarNagar Platform

This guide explains how to deploy the DildarNagar application to production.

## 🏗️ Architecture

- **Frontend**: Vercel (Static hosting + CDN) - FREE ✅
- **Backend**: Railway (Python FastAPI) - FREE ($5 credit/month) ✅
- **Database**: Supabase PostgreSQL (Already configured) - FREE ✅

**Total Cost: $0/month** 🎉

---

## ⚡ Quick Start (Recommended Setup with Supabase)

This project is already configured to use **Supabase** as the database. You don't need to create a new database - just use your existing Supabase connection!

---

## 📊 About Your Supabase Database

Your project is **already configured** with Supabase PostgreSQL:

### Current Setup:
- **Database**: Supabase PostgreSQL
- **Host**: `db.gkqancfzuoemckdpemgx.supabase.co`
- **Database Name**: `postgres`
- **Connection**: Already in `.env` file

### What's in Your Database:
- ✅ Users table (authentication)
- ✅ Listings table (business listings)
- ✅ News table (community news)
- ✅ Events table (local events)
- ✅ Jobs table (job postings)

### Supabase Benefits:
- **Free Tier**: 500MB database, 2GB storage
- **Dashboard**: Manage data at [supabase.com/dashboard](https://supabase.com/dashboard)
- **Backups**: Automatic daily backups
- **Security**: Built-in Row Level Security (RLS)
- **Already Populated**: All your test data is already there!

**You don't need to create or migrate anything - just use it!** ✅

---

## 1. Deploy Backend to Railway (with Supabase Database)

### Step 1: Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Click **"Login with GitHub"**
3. Authorize Railway to access your GitHub account
4. No credit card required for free tier ($5 credit/month)

### Step 2: Create New Project from GitHub
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `nextginfosoft/DildarNagar` from your repositories
4. Railway will automatically detect it's a Python project

### Step 3: Configure Root Directory
1. After project creation, click on the service
2. Go to **Settings** tab
3. Find **Root Directory** setting
4. Set it to: `backend`
5. Click **Save**

### Step 4: Add Environment Variables (Use Your Supabase Database)
1. Go to **Variables** tab
2. Click **"+ New Variable"**
3. Add these variables one by one:

```env
# Database - Use your existing Supabase connection
DATABASE_URL=postgresql+asyncpg://postgres:dildarnagar%402026@db.gkqancfzuoemckdpemgx.supabase.co:5432/postgres

# JWT Settings
JWT_SECRET=dildarnagar-super-secret-2025-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# App Settings
APP_ENV=production
APP_NAME=Dildarnagar.in

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Optional - Razorpay (if using payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
```

**Important Notes:**
- ✅ Use your **existing Supabase DATABASE_URL** (already in your `.env` file)
- ✅ All your data (listings, users, news, events, jobs) is already in Supabase
- ✅ No need to create a new database or migrate data
- ⚠️ Update `FRONTEND_URL` after deploying frontend to Vercel

### Step 5: Configure Start Command
1. Still in **Settings** tab
2. Scroll to **Deploy** section
3. Find **Start Command**
4. Enter: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Save**

### Step 6: Deploy
1. Railway will automatically start deploying
2. Watch the **Deployments** tab for progress
3. Wait for "Success" status (usually 2-3 minutes)
4. Click **Deployments** → **View Logs** to see progress

### Step 7: Get Your Backend URL
1. Go to **Settings** tab
2. Scroll to **Domains** section
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://dildarnagar-production-abc123.up.railway.app`)
5. **Save this URL** - you'll need it for frontend configuration

**✅ Backend Deployed!** Your FastAPI app is now live and connected to Supabase.

---

## 2. Deploy Frontend to Vercel

### Step 1: Sign up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free tier available)

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import `nextginfosoft/DildarNagar`
3. Vercel will detect the project

### Step 3: Configure Build Settings
- **Framework Preset**: Other
- **Root Directory**: `./` (leave as is)
- **Build Command**: (leave empty - static site)
- **Output Directory**: `frontend`

### Step 4: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   API_BASE_URL=https://your-backend.railway.app/api
   ```

### Step 5: Update Frontend API URL
Before deploying, update `frontend/assets/js/api.js`:
```javascript
const API_BASE = window.API_BASE || 
                'https://your-backend.railway.app/api';
```

Replace `your-backend.railway.app` with your actual Railway backend URL.

### Step 6: Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy
3. Your site will be live at `https://your-project.vercel.app`

---

## 3. Alternative: Deploy Backend to Render

### Step 1: Sign up for Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click **"New"** → **"Web Service"**
2. Connect `nextginfosoft/DildarNagar`
3. Configure:
   - **Name**: dildarnagar-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables
Add the same variables as Railway (see above)

### Step 4: Add PostgreSQL Database
1. Click **"New"** → **"PostgreSQL"**
2. Copy the **Internal Connection String**
3. Update `DATABASE_URL` in web service environment variables

---

## 4. Alternative: Deploy Everything to Heroku

### Step 1: Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

### Step 2: Create Heroku App
```bash
cd e:\AI-PROJECT\DildarNagar
heroku create dildarnagar-backend
heroku addons:create heroku-postgresql:mini
```

### Step 3: Create Procfile
Create `backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 4: Deploy
```bash
cd backend
git init
git add .
git commit -m "Deploy to Heroku"
heroku git:remote -a dildarnagar-backend
git push heroku main
```

### Step 5: Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set APP_ENV=production
heroku config:set FRONTEND_URL=https://yourdomain.vercel.app
```

---

## 5. Domain Configuration

### Custom Domain on Vercel:
1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `dildarnagar.in`)
3. Update DNS records at your registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

### Custom Domain on Railway:
1. Go to Railway project → **Settings** → **Domains**
2. Add custom domain
3. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-app.up.railway.app
   ```

---

## 6. Environment-Specific Configuration

### Production Checklist:
- [ ] Update `DATABASE_URL` to production database
- [ ] Change `APP_ENV` to `production`
- [ ] Use strong `JWT_SECRET` (generate with `openssl rand -hex 32`)
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update API base URL in `frontend/assets/js/api.js`
- [ ] Enable CORS for production domain in `backend/main.py`
- [ ] Set up SSL certificates (automatic on Vercel/Railway)
- [ ] Configure database backups

### Update CORS in backend/main.py:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourdomain.vercel.app",  # Add production URL
        "https://www.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 7. Cost Estimate

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Vercel** | 100GB bandwidth/month | $20/month (Pro) |
| **Railway** | $5 credit/month | $5-20/month |
| **Render** | 750 hours/month free | $7-25/month |
| **Heroku** | None (discontinued) | $7/month minimum |
| **Supabase PG** | 500MB database free | $25/month (Pro) |

**Recommended**: Vercel (free) + Railway (free $5 credit) = **$0-5/month**

---

## 8. Monitoring & Maintenance

### Set up monitoring:
- **Railway**: Built-in metrics (CPU, memory, requests)
- **Vercel**: Analytics dashboard
- **Uptime monitoring**: Use uptimerobot.com (free)

### Database backups:
- Railway: Automatic daily backups
- Supabase: Point-in-time recovery
- Manual: Use `pg_dump` scheduled via cron

---

## Quick Deploy Commands

```bash
# Commit deployment configuration
cd e:\AI-PROJECT\DildarNagar
git add vercel.json DEPLOYMENT.md frontend/assets/js/api.js
git commit -m "Add Vercel deployment configuration"
git push origin main

# Then go to vercel.com and railway.app to deploy via UI
```

---

## Support

For deployment issues:
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)

---

**Maintained by NextG Infosoft Technology**  
Last Updated: March 2026
