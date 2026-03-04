# Water Impact Calculator App

An educational application that calculates and visualizes how much water is consumed by your AI usage, showing the environmental impact of AI language models, image generation, and coding assistance.

## Features

✅ **Connect OpenAI Account** - Securely authenticate with your OpenAI account  
✅ **Water Usage Calculation** - Calculates water consumption based on tokens and model type  
✅ **Environmental Context** - Shows water usage in relatable terms (showers, bottles, pools)  
✅ **Energy Tracking** - Displays kWh energy consumption  
✅ **Data Center Map** - Visualizes nearby data centers and their cooling technologies  
✅ **Model Insights** - See which models you use most and their water intensity  

## Architecture

```
Frontend (React)
    ↓
Flask Backend (Python)
    ↓
SQLite Database
```

### Water Calculation Methodology

Water consumption is calculated as:
1. **Tokens Used** → **Energy (kWh)** using model-specific energy consumption rates
2. **Energy** → **Water (Liters)** using data center water intensity (0.3-0.5 gal/kWh)
3. **Contextual Comparison** - Shows equivalent to showers, bottles, Olympic pools

**Energy Per Token (for 1M tokens):**
- GPT-4: 0.0003 kWh
- GPT-4 Turbo: 0.00025 kWh
- GPT-3.5 Turbo: 0.00015 kWh

**Water Intensity:** 
- Typical data centers: 0.35-0.45 gallons per kWh
- Modern efficient centers: 0.30-0.35 gal/kWh

---

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- OpenAI API key (from https://platform.openai.com/account/api-keys)

### Step 1: Backend Setup

1. **Clone/download the project**
   ```bash
   cd water-calculator
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file**
   ```bash
   cp .env.example .env
   ```

5. **Edit .env with your values**
   ```
   SECRET_KEY=your-random-secret-key-here
   FLASK_ENV=development
   OPENAI_CLIENT_ID=your_client_id
   OPENAI_CLIENT_SECRET=your_client_secret
   ```

6. **Run the backend**
   ```bash
   python app.py
   ```

   Backend will start at: `http://localhost:5000`

### Step 2: Frontend Setup

1. **Create React app** (in a separate directory)
   ```bash
   npx create-react-app water-calculator-frontend
   cd water-calculator-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install recharts lucide-react
   ```

3. **Create .env file**
   ```bash
   echo "REACT_APP_API_BASE_URL=http://localhost:5000" > .env
   ```

4. **Replace src/App.jsx** with the provided `frontend.jsx` content

5. **Run the frontend**
   ```bash
   npm start
   ```

   Frontend will start at: `http://localhost:3000`

---

## How to Use

### 1. Get Your OpenAI API Key

- Go to: https://platform.openai.com/account/api-keys
- Click "Create new secret key"
- Copy the key (you won't see it again)

### 2. Login to the App

1. Open `http://localhost:3000`
2. Enter your OpenAI email
3. Paste your API key
4. Click "Connect OpenAI Account"

### 3. View Your Water Impact

- **Dashboard**: See total tokens, requests, and primary model
- **Water Usage**: View total liters and gallons consumed
- **Context Cards**: Compare to showers, bottles, Olympic pools
- **Data Centers**: See which facilities likely processed your requests
- **Location Services**: Enable to see nearest data centers to you

---

## Data Sources & Methodology

### Water Intensity Values

Based on publicly available data:
- **Google Data Centers**: ~0.35 gal/kWh (highly efficient)
- **AWS/Microsoft**: ~0.40 gal/kWh (modern cooling)
- **Industry Average**: ~0.45 gal/kWh

Sources:
- Google Environmental Report 2023
- Microsoft Sustainability Report 2023
- The Green Grid PUE/WUE standards
- ASHRAE cooling guidelines

### Energy Consumption Estimates

Token-to-energy conversion based on:
- Published model FLOPS (floating-point operations)
- Training vs. inference energy costs
- Batch processing efficiency improvements

**Note:** These are estimates. Actual consumption varies by:
- Data center location and cooling tech
- Time of day (renewable energy availability)
- Model optimization (quantization, distillation)
- Hardware efficiency (GPU/TPU type)

---

## API Endpoints

### Authentication
- `POST /api/auth/openai/callback` - Authenticate with email/API key

### User Data
- `POST /api/user/usage` - Fetch user's OpenAI usage data
- `GET /api/user/summary/<user_id>` - Get water usage summary

### Data Centers
- `GET /api/datacenters` - Get all data centers
- `POST /api/datacenters/nearest` - Get nearest to user's location

### System
- `GET /api/health` - Health check

---

## Database Schema

### users
```sql
id, email, openai_token, created_at, last_sync
```

### usage_data
```sql
id, user_id, date, tokens_used, requests, model, task_type
```

### data_centers
```sql
id, name, city, region, country, latitude, longitude, 
cooling_tech, water_intensity, status
```

---

## Customization

### Add More Data Centers

Edit `app.py` in the `init_data_centers()` function:

```python
data_centers = [
    ('DC-Name', 'City', 'Region', 'Country', lat, lon, 'Cooling Type', water_intensity, 'active'),
    # Add more...
]
```

### Adjust Energy Consumption

Edit `WaterCalculator.ENERGY_PER_TOKEN` in `app.py`:

```python
ENERGY_PER_TOKEN = {
    'gpt-4': 0.0003,  # Modify values here
    'gpt-4-turbo': 0.00025,
    'gpt-3.5-turbo': 0.00015,
}
```

### Change Water Intensity

Default is 0.40 gal/kWh. For more efficient centers, use lower values:

```python
def calculate_water_usage(..., data_center_water_intensity=0.40):
```

---

## Deployment

### Deploy Backend

**Option 1: Render**
```bash
# Create render.yaml
# Push to GitHub
# Connect in Render dashboard
```

**Option 2: Railway**
```bash
# Install Railway CLI
railway init
railway up
```

**Option 3: Heroku**
```bash
heroku create app-name
git push heroku main
```

### Deploy Frontend

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel
# Follow prompts
```

**Netlify**
```bash
npm run build
# Deploy build/ folder to Netlify
```

---

## Important Notes

⚠️ **Security**
- Never commit `.env` files with real keys
- Rotate API keys regularly
- Use environment variables in production
- Store API keys securely (use services like 1Password, HashiCorp Vault)

⚠️ **Educational Purpose**
- Water consumption is **estimated**, not exact
- Actual consumption depends on many factors
- Use as awareness tool, not for definitive accounting

⚠️ **Privacy**
- Don't store user data longer than necessary
- Comply with OpenAI's Terms of Service
- Have clear privacy policy

---

## Troubleshooting

### "Failed to fetch usage data"
- Check your OpenAI API key is valid
- Ensure the account has usage data (not brand new)
- Try creating a test message in ChatGPT first

### "CORS error"
- Make sure backend is running on port 5000
- Check `REACT_APP_API_BASE_URL` in frontend .env

### "Location not working"
- App needs HTTPS in production (geolocation requires secure context)
- Check browser permissions for location

### Database errors
- Delete `water_calc.db` and restart backend to reinitialize
- Check Python version compatibility

---

## Future Enhancements

🚀 Add support for:
- Google Gemini API
- Anthropic Claude API
- Image generation tracking (DALL-E, Midjourney)
- Historical trends and graphs
- Export reports (PDF, CSV)
- Carbon footprint estimation
- Comparison with other users (anonymized)
- AI usage optimization tips

---

## Contributing

This is an educational project. Feel free to:
- Improve water calculation accuracy
- Add more data centers
- Enhance visualizations
- Fix bugs
- Improve documentation

---

## License

MIT License - Use freely for educational purposes

---

## Disclaimer

This calculator provides **estimates** for educational awareness. Actual water consumption may vary significantly based on:
- Specific data center location and technology
- Time of request (energy grid mix)
- Model optimization and batching
- Hardware efficiency

Use as an **educational tool** to understand AI's environmental impact, not for precise accounting.

---

## Support & Questions

- Check the troubleshooting section
- Review API error messages carefully
- Ensure all prerequisites are installed
- Verify backend and frontend are both running

---

Made with ❤️ for environmental awareness | Water Impact Calculator
