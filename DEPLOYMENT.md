# 🚀 Deployment Guide

## Option 1: Vercel + PlanetScale (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free)
- PlanetScale account (free tier available)

### Step 1: Setup Database (PlanetScale)

1. **Create PlanetScale Account**
   - Go to https://planetscale.com
   - Sign up for free account
   - Create new database: `your-app-name`

2. **Get Connection Details**
   - Go to your database dashboard
   - Click "Connect" → "Create password"
   - Copy the connection details:
     ```
     Host: aws.connect.psdb.cloud
     Username: your-username
     Password: pscale_pw_xxxxxxxxxx
     Database: your-database-name
     Port: 3306
     ```

3. **Import Database Schema**
   - Use PlanetScale CLI or MySQL Workbench
   - Import your `database/schema.sql` file

### Step 2: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   DB_HOST=aws.connect.psdb.cloud
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=pscale_pw_xxxxxxxxxx
   DB_PORT=3306
   ```

4. **Deploy**
   - Vercel will automatically deploy
   - Your app will be live at: `https://your-app.vercel.app`

### Step 3: Update CORS (After Deployment)
Update `backend/main.py` with your actual domain:
```python
allow_origins=[
    "http://localhost:5173",
    "https://your-app.vercel.app",  # Your actual Vercel URL
    "https://yourdomain.com",       # Your custom domain (if any)
],
```

---

## Option 2: Railway (All-in-One)

### Step 1: Setup Railway
1. Go to https://railway.app
2. Connect your GitHub repository
3. Railway will detect both frontend and backend

### Step 2: Configure Services
1. **Backend Service**:
   - Root directory: `/backend`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Frontend Service**:
   - Root directory: `/frontend`
   - Build command: `npm run build`
   - Start command: `npm run preview`

3. **Database Service**:
   - Add MySQL database from Railway marketplace
   - Copy connection details to backend environment variables

### Step 3: Environment Variables
Set in Railway dashboard:
```
DB_HOST=your-railway-mysql-host
DB_NAME=railway
DB_USER=root
DB_PASSWORD=your-railway-password
DB_PORT=3306
```

---

## Option 3: DigitalOcean App Platform

### Step 1: Create App
1. Go to DigitalOcean App Platform
2. Connect your GitHub repository

### Step 2: Configure Components
1. **Web Service (Backend)**:
   - Source: `/backend`
   - Run command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Static Site (Frontend)**:
   - Source: `/frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Database**:
   - Add managed MySQL database
   - Copy connection details

### Step 3: Environment Variables
```
DB_HOST=your-do-db-host
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=your-do-password
DB_PORT=25060
```

---

## Testing Your Deployment

1. **Health Check**: Visit `https://your-domain.com/api/health`
2. **Frontend**: Visit `https://your-domain.com`
3. **API Docs**: Visit `https://your-domain.com/api/docs`

## Custom Domain (Optional)

1. **Buy Domain**: From any registrar (Namecheap, GoDaddy, etc.)
2. **Configure DNS**: Point to your hosting provider
3. **SSL Certificate**: Most providers offer free SSL

## Estimated Costs

- **Vercel + PlanetScale**: $0/month (free tiers)
- **Railway**: $5/month
- **DigitalOcean**: $12/month
- **Custom Domain**: $10-15/year

## Support

If you need help with deployment, contact your development team or hosting provider support.
