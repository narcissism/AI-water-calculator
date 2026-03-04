# Water Impact Calculator - Project Summary

## 🎯 What You're Getting

A complete, full-stack web application that calculates and visualizes how much water is consumed by your AI API usage. Built with you to be deployed and used by the world.

---

## 📦 Files Included

### Backend (Python/Flask)
- **app.py** - Main backend application with all logic
- **requirements.txt** - Python dependencies
- **.env.example** - Environment template

### Frontend (React)
- **frontend.jsx** - Complete React application (drop into any React project)

### Documentation
- **README.md** - Full documentation (100+ lines)
- **QUICKSTART.md** - Get running in 10 minutes
- **DEPLOYMENT.md** - Deploy to production

---

## 🚀 Quick Start (Really 10 Minutes)

### Terminal 1: Backend
```bash
# Create folder
mkdir water-calculator && cd water-calculator

# Python setup
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows

# Install & run
pip install -r requirements.txt
python app.py
```
✅ Backend ready at `http://localhost:5000`

### Terminal 2: Frontend
```bash
# New terminal, new folder
npx create-react-app water-calculator-frontend
cd water-calculator-frontend
npm install recharts lucide-react

# Replace src/App.jsx with frontend.jsx
npm start
```
✅ Frontend ready at `http://localhost:3000`

### Browser
1. Open `http://localhost:3000`
2. Enter your OpenAI email
3. Paste your API key from https://platform.openai.com/account/api-keys
4. **See your water impact!** 💧

---

## ✨ Features Built

### ✅ OpenAI Authentication
- Secure login with email + API key
- Session management
- User data storage

### ✅ Water Calculation Engine
- Converts tokens → energy (kWh) → water (liters)
- Model-specific energy consumption (GPT-4, GPT-3.5)
- Task-type multipliers (text, code generation)
- Real water intensity data from data centers

### ✅ Dashboard
- Total tokens used (with millions formatting)
- Total requests count
- Primary model identification
- Energy consumption (kWh)
- Water usage (liters & gallons)

### ✅ Water Context Visualization
- 📊 Bar chart showing water usage
- 🚿 Equivalent showers
- 🍾 Equivalent water bottles
- 🏊 Equivalent Olympic pools

### ✅ Data Center Map
- Visual map showing your location (blue dot) vs data centers (green dots)
- Distance calculation to nearest centers
- Top 6 nearest data centers listed
- Cooling technology info
- Water intensity metrics

### ✅ Educational Focus
- Clear explanations of water usage
- Context cards explaining why this matters
- Disclaimers about estimation uncertainty
- Persuasive design encouraging mindful AI use

---

## 🧮 How the Calculation Works

```
Your OpenAI API Usage
         ↓
Fetch tokens + model + requests
         ↓
Determine which model (GPT-4, GPT-3.5, etc)
         ↓
Convert to energy: tokens × energy_per_token
         ↓
Convert to water: energy × water_intensity
         ↓
Display in liters (also gallons, showers, bottles)
```

**Real Example:**
- 1,000,000 tokens with GPT-3.5-turbo
- = 0.15 kWh energy
- × 0.40 gal/kWh (data center intensity)
- = 0.06 gallons
- = **0.23 liters**
- = **0.0017 Olympic pools** 🏊

---

## 🗄️ Database

SQLite database with 3 tables:

```
users (email, api_key, created_at)
    ↓
usage_data (tokens, requests, model, task_type)
    ↓
data_centers (location, cooling_tech, water_intensity)
```

Auto-initializes when you first run the backend. No setup needed!

---

## 🌍 Data Centers Included

8 major data center regions pre-loaded:
- US East (Virginia)
- US West (California)
- US Central (Texas)
- EU West (Ireland)
- EU Central (Frankfurt)
- APAC (Singapore, Tokyo)
- Canada (Toronto)

**Easy to add more** - just edit `init_data_centers()` in app.py

---

## 🔐 Security Notes

**Development Mode:**
- Run locally with SECRET_KEY=anything
- Debug mode enabled
- SQLite database

**Before Deploying to Production:**
1. Change SECRET_KEY to random string
2. Set FLASK_ENV=production
3. Move to PostgreSQL database
4. Enable HTTPS
5. Use environment variables for secrets
6. Review CORS settings

See **DEPLOYMENT.md** for production checklist.

---

## 📊 What You Can Customize

### Energy Consumption Per Token
Edit in `app.py`:
```python
ENERGY_PER_TOKEN = {
    'gpt-4': 0.0003,           # ← Adjust these
    'gpt-4-turbo': 0.00025,
    'gpt-3.5-turbo': 0.00015,
}
```

### Task Type Multipliers
```python
TASK_MULTIPLIERS = {
    'text_generation': 1.0,    # ← Adjust these
    'code_generation': 1.2,
    'chat': 0.95,
}
```

### Water Intensity
```python
# In calculate_water_usage function
data_center_water_intensity=0.40  # gal/kWh
# Lower = more efficient cooling
# 0.35 = very efficient
# 0.45 = standard
# 0.50+ = older centers
```

### Data Centers
```python
# In init_data_centers() function
data_centers = [
    (name, city, region, country, lat, lon, cooling, water_intensity, status),
    # Add as many as you want!
]
```

---

## 🎨 Frontend Customization

The React app uses Tailwind CSS with custom colors. Easy to change:

**Color scheme in frontend.jsx:**
- Blue: `#3b82f6` - Primary brand
- Green: `#10b981` - Data centers
- Yellow: `#f59e0b` - Energy/accent
- Purple: `#a855f7` - Settings

Change to your brand colors!

---

## 🚀 Next Steps

### Phase 1: Get It Running (Today)
1. Follow QUICKSTART.md
2. Test with your OpenAI account
3. See your water impact

### Phase 2: Customize (This Week)
1. Add more data centers
2. Adjust energy/water values with better research
3. Customize colors and branding
4. Test with friends/colleagues

### Phase 3: Deploy (Next Week)
1. Follow DEPLOYMENT.md
2. Use Vercel + Railway (easiest, free)
3. Share your deployed link
4. Collect feedback

### Phase 4: Scale (Ongoing)
1. Add Google Gemini API support
2. Add Claude API support
3. Add image generation tracking
4. Track historical trends
5. Export reports

---

## 📚 API Endpoints Reference

```
POST /api/auth/openai/callback
→ Authenticate user with email + API key

POST /api/user/usage
→ Fetch & store user's OpenAI usage data

GET /api/user/summary/<user_id>
→ Get water usage summary for user

GET /api/datacenters
→ Get all data centers

POST /api/datacenters/nearest
→ Get nearest data centers to user location {lat, lon}

GET /api/health
→ Health check
```

---

## 🔧 Tech Stack

**Backend:**
- Python 3.8+
- Flask (lightweight web framework)
- SQLite (database)
- Requests (HTTP library)

**Frontend:**
- React 18 (UI framework)
- Recharts (data visualization)
- Lucide React (icons)
- Tailwind CSS (styling)

**Deployment Options:**
- Vercel (frontend)
- Railway (backend)
- Heroku
- AWS/Google Cloud
- Docker

---

## 📖 Key Files Explained

### app.py (500 lines)
- Flask app initialization
- Database setup (init_db, init_data_centers)
- WaterCalculator class with all calculations
- 6 API routes for auth, data, summaries
- Haversine distance calculation for nearest centers

### frontend.jsx (600 lines)
- React component with useState hooks
- Login form with validation
- Dashboard layout
- Data visualization with Recharts
- SVG-based data center map
- Responsive grid layout

### README.md (300 lines)
- Complete architecture explanation
- Setup instructions (backend + frontend)
- API documentation
- Water calculation methodology
- Sources and citations
- Customization guide
- Troubleshooting

### QUICKSTART.md (100 lines)
- 4-step setup process
- Gets you running in 10 minutes
- Minimal explanations
- Clear file structure

### DEPLOYMENT.md (250 lines)
- 3 deployment options
- Environment variable setup
- Security checklist
- Database migration
- Monitoring & logging
- Troubleshooting

---

## 💡 Ideas for Enhancement

**Short Term:**
- [ ] Add usage trends graph (daily/weekly/monthly)
- [ ] Export water report as PDF
- [ ] Compare model water usage
- [ ] Carbon footprint estimation

**Medium Term:**
- [ ] Google Gemini API support
- [ ] Anthropic Claude API support
- [ ] Image generation tracking (DALL-E usage)
- [ ] Cost vs water comparison

**Long Term:**
- [ ] Community leaderboard (anonymous)
- [ ] AI optimization tips
- [ ] Integration with Slack for alerts
- [ ] Browser extension for ChatGPT tracking

---

## ❓ FAQ

**Q: Is the water calculation accurate?**
A: No, it's an estimate for educational purposes. Real consumption varies by data center location, time of day, hardware efficiency, and many other factors. Use as awareness tool, not for precise accounting.

**Q: Why does it need my API key?**
A: To fetch your actual usage data from OpenAI's API. Keys are stored locally in development and should be secured in production.

**Q: Can I deploy this myself?**
A: Yes! See DEPLOYMENT.md for 3 different hosting options. Easiest: Vercel (frontend) + Railway (backend) = free or ~$7/month.

**Q: What if I don't have OpenAI usage?**
A: Create a test message in ChatGPT first, wait a few hours for it to appear in your usage data.

**Q: Can I add other AI APIs?**
A: Yes! The app is built to support multiple providers. Add them in the authentication and usage-fetching logic.

**Q: What about privacy?**
A: The app is designed to run locally. Your API key only goes to OpenAI and your backend. No tracking, no ads.

---

## 📞 Support

**If something doesn't work:**

1. **Check console** - Browser (F12) and terminal for error messages
2. **Verify setup** - Make sure both backend and frontend are running
3. **Read QUICKSTART** - Follow exactly, step by step
4. **Read README** - Full troubleshooting section
5. **Check API key** - Must be valid and have usage data

---

## 📄 License

MIT License - Use, modify, distribute freely. Perfect for educational projects!

---

## 🙏 Credits

Built with:
- Flask (web framework)
- React (UI)
- Recharts (visualization)
- Real data from Google, Microsoft, AWS sustainability reports

---

## 🌱 Final Thoughts

This app is designed to **educate and persuade** users about AI's environmental impact. It's not meant for precise accounting, but rather for awareness.

Every person who sees their water usage might:
- ✓ Use AI more thoughtfully
- ✓ Ask providers for efficiency reports
- ✓ Support sustainable AI practices
- ✓ Make informed choices about models

**That's the real impact.** 💧

---

**You now have everything you need to build, customize, and deploy a real AI environmental impact calculator.**

Good luck! 🚀

Questions? Start with README.md → QUICKSTART.md → DEPLOYMENT.md
