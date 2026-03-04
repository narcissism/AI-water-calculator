# Production Deployment Guide

Guide to deploy your Water Impact Calculator to production.

---

## Option 1: Vercel + Railway (Recommended)

### Setup

**Vercel** - Hosts the React frontend  
**Railway** - Hosts the Python backend

### Backend Deployment (Railway)

1. **Prepare your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Sign up at railway.app**

3. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

4. **Login**
   ```bash
   railway login
   ```

5. **Initialize project**
   ```bash
   railway init
   ```
   - Choose Python 3.9+
   - Name your app (e.g., "water-calc-backend")

6. **Create railway.json**
   ```json
   {
     "buildCommand": "pip install -r requirements.txt",
     "startCommand": "gunicorn app:app",
     "envs": {
       "SECRET_KEY": "your-random-secret-here",
       "FLASK_ENV": "production"
     }
   }
   ```

7. **Add production dependencies to requirements.txt**
   ```
   Flask==2.3.0
   Flask-CORS==4.0.0
   python-dotenv==1.0.0
   requests==2.31.0
   gunicorn==21.2.0
   ```

8. **Push to Railway**
   ```bash
   git push railway main
   ```

9. **Get your backend URL from Railway dashboard** (something like: `https://water-calc-backend-production.up.railway.app`)

10. **Set environment variables in Railway dashboard**
    - `SECRET_KEY=your-random-key`
    - `FLASK_ENV=production`

### Frontend Deployment (Vercel)

1. **Push your React code to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/water-calculator-frontend
   git push -u origin main
   ```

2. **Sign up at vercel.com**

3. **Import your GitHub repo**
   - Click "Import Project"
   - Select your repo
   - Configure environment variables

4. **Add environment variable**
   - Key: `REACT_APP_API_BASE_URL`
   - Value: `https://water-calc-backend-production.up.railway.app`

5. **Deploy**
   - Vercel will automatically deploy on push

✅ **Your app is live!**

---

## Option 2: Heroku (Easier but paid)

### Backend on Heroku

1. **Install Heroku CLI** from heroku.com

2. **Login**
   ```bash
   heroku login
   ```

3. **Create app**
   ```bash
   heroku create your-app-name
   ```

4. **Update requirements.txt to include gunicorn**
   ```
   Flask==2.3.0
   Flask-CORS==4.0.0
   python-dotenv==1.0.0
   requests==2.31.0
   gunicorn==21.2.0
   ```

5. **Create Procfile**
   ```
   web: gunicorn app:app
   ```

6. **Set environment variables**
   ```bash
   heroku config:set SECRET_KEY=your-random-key
   heroku config:set FLASK_ENV=production
   ```

7. **Deploy**
   ```bash
   git push heroku main
   ```

8. **Get URL**
   ```bash
   heroku info
   ```

### Frontend on Netlify

1. **Create production build**
   ```bash
   npm run build
   ```

2. **Sign up at netlify.com**

3. **Create new site**
   - Drag and drop the `build` folder

4. **Set environment variable in Netlify dashboard**
   - `REACT_APP_API_BASE_URL=your-heroku-url`

✅ **Your app is live!**

---

## Option 3: Docker + AWS / Google Cloud

### Create Docker setup

**Dockerfile (backend)**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV FLASK_ENV=production
ENV SECRET_KEY=your-secret

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=your-secret-key
```

Deploy with:
```bash
docker-compose up
```

---

## Environment Variables Checklist

✅ Backend needs:
- `SECRET_KEY` - Random string for sessions
- `FLASK_ENV=production`
- `OPENAI_CLIENT_ID` (optional, if using OAuth)
- `OPENAI_CLIENT_SECRET` (optional, if using OAuth)

✅ Frontend needs:
- `REACT_APP_API_BASE_URL` - Your backend URL

---

## Database Migration

### For Production

1. **Use PostgreSQL instead of SQLite**

   Update requirements.txt:
   ```
   Flask==2.3.0
   Flask-CORS==4.0.0
   python-dotenv==1.0.0
   requests==2.31.0
   gunicorn==21.2.0
   psycopg2-binary==2.9.0
   SQLAlchemy==2.0.0
   ```

2. **Update app.py to use PostgreSQL**
   ```python
   import os
   from sqlalchemy import create_engine
   
   DATABASE_URL = os.getenv('DATABASE_URL')
   engine = create_engine(DATABASE_URL)
   ```

3. **Create database on your hosting provider**
   - Railway provides PostgreSQL easily
   - Just add "PostgreSQL" in Railway dashboard

---

## Security Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to random string
- [ ] Set `FLASK_ENV=production`
- [ ] Use HTTPS only (Vercel/Heroku automatic)
- [ ] Enable CORS only for your frontend domain
- [ ] Don't commit `.env` files to git
- [ ] Use secrets management for API keys
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS headers properly:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourdomain.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

- [ ] Add rate limiting to API
- [ ] Monitor error logs
- [ ] Set up backup strategy
- [ ] Review Terms of Service compliance

---

## Performance Optimization

### Backend
- Cache data center information
- Add database indexing
- Use connection pooling
- Compress API responses

### Frontend
- Enable Gzip compression
- Optimize bundle size
- Lazy load components
- Use CDN for assets

---

## Monitoring & Logging

### Railway
- Dashboard shows logs in real-time
- CPU/Memory usage metrics
- Deployment history

### Vercel
- Analytics dashboard
- Real-time logs
- Error tracking

### Manual Monitoring
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"User {user_id} synced data")
logger.error(f"Failed to fetch OpenAI data: {error}")
```

---

## Troubleshooting Production

### Backend won't start
```bash
# Check logs
heroku logs --tail
# or Railway/Vercel dashboard logs

# Common issues:
# - Missing dependencies in requirements.txt
# - Wrong Python version
# - PORT environment variable not set
```

### CORS errors
- Check `REACT_APP_API_BASE_URL` matches backend URL
- Verify CORS headers in Flask app
- Check browser console for exact error

### Data not syncing
- Verify API key is correct
- Check backend logs for OpenAI API errors
- Ensure user has usage data (not brand new account)

### Slow performance
- Check database queries
- Monitor API response times
- Enable caching
- Use CDN for static assets

---

## Custom Domain

### Vercel
1. Go to project settings
2. Click "Domains"
3. Add custom domain
4. Update DNS records

### Railway/Heroku
1. Add domain in dashboard
2. Update DNS CNAME record
3. Enable SSL

---

## Scaling Up

As you grow:

1. **Database**: Switch to PostgreSQL
2. **Caching**: Add Redis for data center cache
3. **API Rate Limiting**: Prevent abuse
4. **Background Jobs**: Use Celery for heavy tasks
5. **CDN**: Serve frontend from CloudFlare/Cloudflare
6. **Monitoring**: Set up error tracking (Sentry)

---

## Rollback Plan

If something goes wrong:

```bash
# Heroku
heroku releases
heroku rollback v123

# Railway
# Use dashboard to select previous deployment

# Git
git revert <commit-hash>
git push
```

---

## Cost Estimates

**Free Tier:**
- Vercel: Free for frontend
- Railway: $5/month credit (usually free)
- Total: ~$0

**Paid Tiers:**
- Vercel: $20/month (Pro)
- Railway: $7/month minimum
- Total: ~$27/month

---

## Support & Resources

- Railway docs: railway.app/docs
- Vercel docs: vercel.com/docs
- Flask production: flask.palletsprojects.com/deploying/
- React deployment: create-react-app.dev/deployment

---

Congratulations on deploying! 🚀
