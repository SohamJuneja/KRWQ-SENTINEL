# KRWQ Sentinel - Deployment Guide

## 🚀 Quick Deploy

### Frontend (Vercel)

1. **Push to GitHub** (already done ✅)
   ```bash
   git push origin master
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import `SohamJuneja/KRWQ-SENTINEL`
   - **Root Directory:** Leave as root
   - **Framework Preset:** Vite
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** Leave empty or `npm install --prefix frontend`

3. **Add Environment Variable:**
   - In Vercel project settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com` (get this after backend deployment)

### Backend (Render)

1. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub: `SohamJuneja/KRWQ-SENTINEL`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

2. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (Render will auto-assign, but set this anyway)
   - `GOOGLE_API_KEY` = `your_actual_google_api_key`

3. **Copy Backend URL:**
   - After deployment, copy the URL (e.g., `https://krwq-sentinel-backend.onrender.com`)
   - Go back to Vercel and update `VITE_API_URL` with this URL
   - Redeploy frontend on Vercel

---

## 🔧 Alternative: Railway (All-in-One)

If you prefer deploying both frontend and backend together:

1. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `SohamJuneja/KRWQ-SENTINEL`

2. **Setup Backend Service:**
   - Railway auto-detects Node.js
   - **Root Directory:** `backend`
   - **Start Command:** `npm install && npm start`
   - Add environment variable: `GOOGLE_API_KEY`

3. **Setup Frontend Service:**
   - Create another service in same project
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview` (Vite preview server)
   - Add environment variable: `VITE_API_URL` = backend service URL

---

## 📋 Post-Deployment Checklist

- [ ] Backend is running (test: `https://your-backend.onrender.com/api/tips/stats`)
- [ ] Frontend can connect to backend (check browser console for CORS errors)
- [ ] Google API key is working (submit a test tip)
- [ ] Demo trade button works
- [ ] Leaderboard and stats are loading

---

## 🐛 Common Issues

### CORS Errors
The backend already has `cors()` enabled. If you still get CORS errors:
- Ensure `VITE_API_URL` is set correctly in Vercel
- Redeploy frontend after changing environment variables

### Backend Cold Start
Render free tier sleeps after 15 minutes of inactivity:
- First request may take 30-50 seconds
- Consider upgrading to paid tier or use Railway

### Build Fails
- **Frontend:** Ensure `vite` is in dependencies (already added)
- **Backend:** Ensure `typescript` is in devDependencies for build step

---

## 💰 Costs

- **Vercel:** Free tier (100GB bandwidth, unlimited builds)
- **Render:** Free tier (750 hours/month, sleeps after 15 min)
- **Railway:** $5/month credit (both services, no sleep)

**Recommended:** Vercel (frontend) + Render (backend) = **FREE**
