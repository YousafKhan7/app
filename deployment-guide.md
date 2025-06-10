# 🚀 Deployment Guide for Full Stack App

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL

## 🎯 Recommended Hosting: Vercel + Railway

### Why This Combo?
- ✅ **Free frontend hosting** (Vercel)
- ✅ **Easy Python deployment** (Railway)
- ✅ **Managed PostgreSQL** (Railway)
- ✅ **Automatic deployments** from Git
- ✅ **HTTPS included**
- 💰 **Cost**: ~$5/month total

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Backend for Production

1. **Create requirements.txt**:
```bash
cd backend
pip freeze > requirements.txt
```

2. **Add Railway configuration** (`railway.toml`):
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
```

3. **Update CORS for production** in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local dev
        "https://your-app.vercel.app",  # Production frontend
        "https://*.vercel.app",   # Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 2: Deploy Backend to Railway

1. **Sign up**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your repository
3. **Create new project**: Select your backend folder
4. **Add PostgreSQL**: Click "Add Service" → "Database" → "PostgreSQL"
5. **Set environment variables**:
   - Railway auto-provides database credentials
   - Add any custom env vars you need

### Step 3: Prepare Frontend for Production

1. **Update API base URL** in frontend:
```typescript
// frontend/src/services/apiService.ts
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend.railway.app'  // Production
  : 'http://localhost:8000';            // Development
```

2. **Build optimization** in `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
```

### Step 4: Deploy Frontend to Vercel

1. **Sign up**: Go to [vercel.com](https://vercel.com)
2. **Import project**: Connect your GitHub repo
3. **Configure build**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Set environment variables**:
   - `VITE_API_URL`: Your Railway backend URL

### Step 5: Database Migration

1. **Connect to Railway PostgreSQL**:
```bash
# Get connection string from Railway dashboard
psql "postgresql://username:password@host:port/database"
```

2. **Run your migration script**:
```bash
python run_migration.py
```

---

## 🔧 Alternative: Traditional VPS Hosting

If you prefer Hostinger/BlueHost, you'll need a VPS plan:

### Requirements:
- **VPS with Ubuntu/CentOS** ($10-20/month)
- **Root access** for Python installation
- **Manual server management**

### Setup Process:
1. **Install Python 3.9+**
2. **Install PostgreSQL**
3. **Configure Nginx** as reverse proxy
4. **Set up SSL certificates**
5. **Configure systemd** for auto-restart

---

## 💰 Cost Comparison

| Option | Frontend | Backend | Database | Total/Month |
|--------|----------|---------|----------|-------------|
| **Vercel + Railway** | Free | $5 | Included | **$5** |
| **Netlify + Render** | Free | $7 | Included | **$7** |
| **DigitalOcean** | Included | Included | Included | **$12** |
| **Hostinger VPS** | Included | Included | Manual | **$15-25** |

---

## 🎯 Recommendation

**Start with Vercel + Railway** because:
- ✅ Easiest deployment
- ✅ Automatic scaling
- ✅ Built-in monitoring
- ✅ Git-based deployments
- ✅ Free SSL certificates
- ✅ Great developer experience

You can always migrate later if needed!
