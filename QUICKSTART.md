# Quick Start Guide - Water Impact Calculator

Get the app running in 10 minutes!

## What You'll Need

1. **OpenAI API Key** - Get free from https://platform.openai.com/account/api-keys
2. **Python 3.8+** - Download from python.org
3. **Node.js 14+** - Download from nodejs.org
4. **A code editor** - VS Code recommended

---

## Step-by-Step (10 minutes)

### Step 1: Get Your OpenAI API Key (1 min)

1. Go to https://platform.openai.com/account/api-keys
2. Login with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (you won't see it again!)
5. Save it somewhere safe

---

### Step 2: Setup Backend (3 min)

1. **Create a folder for the project**
   ```bash
   mkdir water-calculator
   cd water-calculator
   ```

2. **Create a Python virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate it**
   - **Mac/Linux**: `source venv/bin/activate`
   - **Windows**: `venv\Scripts\activate`

4. **Create requirements.txt file** with this content:
   ```
   Flask==2.3.0
   Flask-CORS==4.0.0
   python-dotenv==1.0.0
   requests==2.31.0
   ```

5. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Create app.py** - Copy the full `app.py` file from this project

7. **Create .env file** with:
   ```
   SECRET_KEY=dev-secret-key
   FLASK_ENV=development
   ```

8. **Run the backend**
   ```bash
   python app.py
   ```

✅ **Backend is running** at http://localhost:5000

---

### Step 3: Setup Frontend (3 min)

**In a NEW terminal window** (keep backend running):

1. **Create React app**
   ```bash
   npx create-react-app water-calculator-frontend
   cd water-calculator-frontend
   ```

2. **Install libraries**
   ```bash
   npm install recharts lucide-react
   ```

3. **Create .env file** in the React app folder:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

4. **Replace src/App.jsx** with the `frontend.jsx` code from this project

5. **Start the frontend**
   ```bash
   npm start
   ```

✅ **Frontend is running** at http://localhost:3000

---

### Step 4: Try It Out! (3 min)

1. **Open** http://localhost:3000
2. **Enter your OpenAI email**
3. **Paste your API key** from Step 1
4. **Click "Connect OpenAI Account"**
5. **See your water impact!** 💧

---

## What You'll See

✅ Total tokens used  
✅ Total API requests  
✅ Primary model (GPT-4, GPT-3.5, etc)  
✅ **Water used in liters and gallons**  
✅ Water context (showers, bottles, pools)  
✅ Energy consumption in kWh  
✅ Nearby data centers on a map  
✅ Data center cooling technologies  

---

## Troubleshooting

### "Failed to connect"
- Make sure backend is running: `python app.py` in first terminal
- Check that frontend is running: `npm start` in second terminal
- Verify your API key is correct

### "Module not found"
- Make sure you installed dependencies: `pip install -r requirements.txt` and `npm install`

### "Port 5000 already in use"
- Close other apps using port 5000, or change Flask port in app.py
- `app.run(debug=True, port=5001)`

### "CORS error in browser"
- Restart backend and frontend
- Clear browser cache (Ctrl+Shift+Delete)

---

## File Structure

```
water-calculator/
├── venv/                          # Python environment
├── app.py                         # Backend Flask app
├── requirements.txt               # Python dependencies
├── .env                          # Environment variables
├── README.md                     # Full documentation
│
└── water-calculator-frontend/    # React app folder
    ├── src/
    │   └── App.jsx              # Replace with frontend.jsx
    ├── package.json
    ├── .env
    └── public/
```

---

## Next Steps

Once you have it working:

1. **Deploy it live** (see README.md for deployment options)
2. **Add more models** - Edit ENERGY_PER_TOKEN in app.py
3. **Add more data centers** - Edit init_data_centers() in app.py
4. **Customize styling** - Edit colors/fonts in frontend.jsx
5. **Share with others** - Help educate about AI's environmental impact!

---

## How the Calculation Works

```
Your API Usage
    ↓
Tokens Used + Model Type
    ↓
Energy Consumption (kWh)
    ↓
Data Center Water Intensity
    ↓
Water Used (Liters) 💧
```

**Example:**
- You used 1 Million tokens with GPT-3.5
- That's ~0.15 kWh of energy
- With 0.40 gal/kWh water intensity
- = 0.06 gallons = 0.23 liters

---

## Need Help?

1. **Check the full README.md** for detailed setup
2. **Verify all prerequisites are installed** (Python, Node.js)
3. **Make sure both backend and frontend are running**
4. **Check console for error messages** (in terminal and browser)

---

## Made with ❤️ for environmental awareness

Happy calculating! 🌍💧
