# 🚀 Supabase + Vercel Deployment Guide

## 📋 Prerequisites
- GitHub account
- Supabase account (free)
- Vercel account (free)

## 🗄️ Step 1: Setup Supabase Database

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Create new project:
   - **Name**: `your-app-name`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users

### 1.2 Get Database Connection Details
1. Go to **Settings** → **Database**
2. Copy the connection details:
   ```
   Host: db.your-project-ref.supabase.co
   Database: postgres
   Port: 5432
   User: postgres
   Password: [your-password]
   ```

### 1.3 Import Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `database/schema_postgresql.sql`
3. Paste and run the SQL script
4. Verify tables are created in **Table Editor**

## 🔧 Step 2: Install Dependencies Locally

### 2.1 Install PostgreSQL Driver
```bash
# Navigate to backend directory
cd backend

# Install new dependencies
pip install psycopg2-binary

# Or install all dependencies
pip install -r requirements.txt
```

### 2.2 Test Local Connection (Optional)
1. Copy `backend/.env.local` to `backend/.env`
2. Update with your Supabase credentials:
   ```env
   DB_HOST=db.your-project-ref.supabase.co
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your-supabase-password
   DB_PORT=5432
   ```
3. Test locally:
   ```bash
   cd backend
   python main.py
   ```
4. Visit http://localhost:8000/health

## 🚀 Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Convert to PostgreSQL for Supabase"
git push origin main
```

### 3.2 Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration

### 3.3 Set Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:
```
DB_HOST=db.your-project-ref.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_PORT=5432
```

### 3.4 Deploy
- Click "Deploy"
- Your app will be live at: `https://your-app.vercel.app`

## ✅ Step 4: Test Your Deployment

### 4.1 Test API
- Health check: `https://your-app.vercel.app/api/health`
- API docs: `https://your-app.vercel.app/api/docs`

### 4.2 Test Frontend
- Dashboard: `https://your-app.vercel.app`
- All settings pages should work

## 🔧 Step 5: Update CORS (After Deployment)

Update `backend/main.py` with your actual Vercel URL:
```python
allow_origins=[
    "http://localhost:5173",
    "https://your-app.vercel.app",  # Replace with actual URL
    "https://yourdomain.com",       # Custom domain if any
],
```

## 📊 What Changed from MySQL

### Database Schema Changes:
- `INT AUTO_INCREMENT` → `SERIAL`
- `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE`
- Added triggers for `updated_at` columns

### Backend Changes:
- `mysql-connector-python` → `psycopg2-binary`
- `mysql.connector.connect()` → `psycopg2.connect()`
- `cursor(dictionary=True)` → `cursor(cursor_factory=RealDictCursor)`
- Added helper function for cleaner query execution

### No Frontend Changes:
- All frontend code remains exactly the same
- API endpoints unchanged
- Error handling unchanged

## 💰 Cost Breakdown

### Supabase Free Tier:
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

### Vercel Free Tier:
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ Automatic SSL

**Total Cost: $0/month** 🎉

## 🆘 Troubleshooting

### Common Issues:

1. **Connection Error**:
   - Check Supabase credentials
   - Verify database is running
   - Check firewall settings

2. **Import Error**:
   - Install psycopg2-binary: `pip install psycopg2-binary`
   - Use binary version for easier installation

3. **CORS Error**:
   - Update allowed origins in main.py
   - Redeploy after changes

4. **Database Schema Error**:
   - Run the PostgreSQL schema file
   - Check for syntax errors in SQL

## 🎯 Next Steps

1. **Custom Domain** (Optional):
   - Buy domain from any registrar
   - Configure DNS in Vercel
   - Free SSL included

2. **Monitoring**:
   - Use Supabase dashboard for database monitoring
   - Use Vercel analytics for app performance

3. **Backups**:
   - Supabase provides automatic backups
   - Consider additional backup strategy for production

Your app is now live with PostgreSQL and Supabase! 🚀
