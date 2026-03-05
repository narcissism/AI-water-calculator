import os
import sqlite3
import json
from datetime import datetime, timedelta
from functools import wraps
import requests
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Better secret key handling
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-12345')
app.secret_key = SECRET_KEY

# CORS configuration - allow all origins for development
CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
OPENAI_CLIENT_ID = os.getenv('OPENAI_CLIENT_ID', '')
OPENAI_CLIENT_SECRET = os.getenv('OPENAI_CLIENT_SECRET', '')
OPENAI_REDIRECT_URI = os.getenv('OPENAI_REDIRECT_URI', 'http://localhost:5000/api/auth/openai/callback')

# Initialize data centers with real data
def init_data_centers():
    conn = sqlite3.connect('water_calc.db')
    c = conn.cursor()
    
    # Check if data already exists
    c.execute('SELECT COUNT(*) FROM data_centers')
    if c.fetchone()[0] == 0:
        data_centers = [
            # OpenAI & Major AI Provider Data Centers (approximate locations)
            ('US-East-1', 'Virginia', 'Virginia', 'USA', 37.4419, -78.6567, 'Liquid cooling', 0.39, 'active'),
            ('US-West-1', 'California', 'California', 'USA', 37.7749, -122.4194, 'Hybrid cooling', 0.42, 'active'),
            ('US-Central-1', 'Texas', 'Texas', 'USA', 30.2672, -97.7431, 'Evaporative cooling', 0.45, 'active'),
            ('EU-West-1', 'Ireland', 'Dublin', 'Ireland', 53.3498, -6.2603, 'Free cooling', 0.35, 'active'),
            ('EU-Central-1', 'Frankfurt', 'Hesse', 'Germany', 50.1109, 8.6821, 'Liquid cooling', 0.38, 'active'),
            ('APAC-1', 'Singapore', 'Singapore', 'Singapore', 1.3521, 103.8198, 'Liquid cooling', 0.48, 'active'),
            ('APAC-2', 'Japan', 'Tokyo', 'Japan', 35.6762, 139.6503, 'Free cooling', 0.36, 'active'),
            ('Canada-1', 'Toronto', 'Ontario', 'Canada', 43.6532, -79.3832, 'Free cooling', 0.34, 'active'),
        ]
        
        for dc in data_centers:
            c.execute('''INSERT INTO data_centers 
                         (name, city, region, country, latitude, longitude, cooling_tech, water_intensity, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', dc)
        
        conn.commit()
    
    conn.close()

# Initialize database
def init_db():
    conn = sqlite3.connect('water_calc.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY, email TEXT UNIQUE, openai_token TEXT, 
                  created_at TIMESTAMP, last_sync TIMESTAMP)''')
    
    # Usage data table
    c.execute('''CREATE TABLE IF NOT EXISTS usage_data
                 (id INTEGER PRIMARY KEY, user_id INTEGER, date TEXT, 
                  tokens_used INTEGER, requests INTEGER, model TEXT,
                  task_type TEXT, FOREIGN KEY(user_id) REFERENCES users(id))''')
    
    # Data centers table
    c.execute('''CREATE TABLE IF NOT EXISTS data_centers
                 (id INTEGER PRIMARY KEY, name TEXT, city TEXT, region TEXT, 
                  country TEXT, latitude REAL, longitude REAL, 
                  cooling_tech TEXT, water_intensity REAL, status TEXT)''')
    
    conn.commit()
    conn.close()

# Initialize database before first request
db_initialized = False

@app.before_request
def initialize_db_before_first_request():
    """Initialize database on first request - this ensures it happens AFTER Render starts"""
    global db_initialized
    if db_initialized:
        return
    
    try:
        init_db()
        init_data_centers()
        db_initialized = True
    except Exception as e:
        print(f"Database initialization error: {e}")

# Water calculation functions
class WaterCalculator:
    # Energy consumption per 1M tokens (in kWh)
    ENERGY_PER_TOKEN = {
        'gpt-4': 0.0003,  # Higher computation
        'gpt-4-turbo': 0.00025,
        'gpt-3.5-turbo': 0.00015,  # Lower computation
    }
    
    # Task type multipliers
    TASK_MULTIPLIERS = {
        'text_generation': 1.0,
        'code_generation': 1.2,  # Code is more compute-intensive
        'chat': 0.95,
    }
    
    @staticmethod
    def estimate_model_from_usage(tokens, requests):
        """Estimate which model was likely used based on tokens/requests ratio"""
        if requests == 0:
            return 'gpt-3.5-turbo'
        
        avg_tokens_per_request = tokens / requests
        
        if avg_tokens_per_request > 2000:
            return 'gpt-4'
        elif avg_tokens_per_request > 500:
            return 'gpt-4-turbo'
        else:
            return 'gpt-3.5-turbo'
    
    @staticmethod
    def calculate_water_usage(tokens, model, task_type='text_generation', data_center_water_intensity=0.40):
        """
        Calculate water usage in liters for given usage
        
        Formula:
        - Tokens → Energy (kWh)
        - Energy → Water (based on data center water intensity)
        - Typical data center: 0.3-0.5 gallons per kWh
        """
        
        # Get energy per token
        energy_per_token = WaterCalculator.ENERGY_PER_TOKEN.get(model, 0.0002)
        
        # Get task multiplier
        task_multiplier = WaterCalculator.TASK_MULTIPLIERS.get(task_type, 1.0)
        
        # Calculate total energy (kWh)
        total_energy = (tokens / 1_000_000) * energy_per_token * task_multiplier
        
        # Calculate water usage (gallons)
        water_gallons = total_energy * data_center_water_intensity
        
        # Convert to liters (1 gallon = 3.785 liters)
        water_liters = water_gallons * 3.785
        
        return {
            'water_liters': round(water_liters, 2),
            'water_gallons': round(water_gallons, 2),
            'energy_kwh': round(total_energy, 3),
            'model': model,
            'task_type': task_type
        }

# Routes
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/auth/openai', methods=['GET'])
def auth_openai():
    """Redirect to OpenAI OAuth"""
    auth_url = f"https://platform.openai.com/account/billing/overview"
    return jsonify({
        'auth_url': auth_url,
        'message': 'Redirect user to OpenAI to connect account'
    }), 200

@app.route('/api/auth/openai/callback', methods=['POST'])
def auth_openai_callback():
    """Handle OpenAI OAuth callback"""
    data = request.json
    email = data.get('email')
    api_key = data.get('api_key')
    
    if not email or not api_key:
        return jsonify({'error': 'Missing email or API key'}), 400
    
    # Store user in database
    conn = sqlite3.connect('water_calc.db')
    c = conn.cursor()
    
    try:
        c.execute('''INSERT INTO users (email, openai_token, created_at)
                     VALUES (?, ?, ?)''', (email, api_key, datetime.now()))
        conn.commit()
        user_id = c.lastrowid
    except sqlite3.IntegrityError:
        # User exists, update token
        c.execute('UPDATE users SET openai_token = ? WHERE email = ?', (api_key, email))
        conn.commit()
        c.execute('SELECT id FROM users WHERE email = ?', (email,))
        user_id = c.fetchone()[0]
    
    conn.close()
    
    session['user_id'] = user_id
    session['email'] = email
    
    return jsonify({
        'success': True,
        'user_id': user_id,
        'email': email
    }), 200

@app.route('/api/user/usage', methods=['POST'])
def get_user_usage():
    """Fetch and store user's OpenAI usage data"""
    data = request.json
    email = data.get('email')
    api_key = data.get('api_key')
    
    if not email or not api_key:
        return jsonify({'error': 'Missing email or API key'}), 400
    
    # Get user
    conn = sqlite3.connect('water_calc.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE email = ?', (email,))
    user_row = c.fetchone()
    
    if not user_row:
        return jsonify({'error': 'User not found'}), 404
    
    user_id = user_row[0]
    
    # Fetch usage from OpenAI API
    headers = {'Authorization': f'Bearer {api_key}'}
    
    try:
        # Get usage data for last 30 days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        
        usage_response = requests.get(
            f'https://api.openai.com/v1/usage?start_date={start_date}&end_date={end_date}',
            headers=headers,
            timeout=10
        )
        
        if usage_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch OpenAI usage data'}), 400
        
        usage_data = usage_response.json()
        
        # Store usage data
        if 'data' in usage_data:
            for entry in usage_data['data']:
                date = entry.get('date')
                tokens = entry.get('tokens_used', 0)
                requests_count = entry.get('n_requests', 0)
                
                # Estimate model
                model = WaterCalculator.estimate_model_from_usage(tokens, requests_count)
                
                c.execute('''INSERT OR REPLACE INTO usage_data 
                             (user_id, date, tokens_used, requests, model, task_type)
                             VALUES (?, ?, ?, ?, ?, ?)''',
                         (user_id, date, tokens, requests_count, model, 'text_generation'))
        
        # Update last sync
        c.execute('UPDATE users SET last_sync = ? WHERE id = ?', (datetime.now(), user_id))
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usage data synced',
            'data_points': len(usage_data.get('data', []))
        }), 200
    
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to fetch data: {str(e)}'}), 400
    
    finally:
        conn.close()

@app.route('/api/user/summary/<int:user_id>', methods=['GET'])
def get_user_summary(user_id):
    """Get user's water usage summary"""
    conn = sqlite3.connect('water_calc.db')
    c = conn.cursor()
    
    # Get user
    c.execute('SELECT email FROM users WHERE id = ?', (user_id,))
    user_row = c.fetchone()
    
    if not user_row:
        return jsonify({'error': 'User not found'}), 404
    
    # Get total tokens used
    c.execute('''SELECT SUM(tokens_used), SUM(requests), COUNT(DISTINCT model), 
                 MAX(date), MIN(date)
                 FROM usage_data WHERE user_id = ?''', (user_id,))
    
    result = c.fetchone()
    total_tokens = result[0] or 0
    total_requests = result[1] or 0
    models_used = result[2] or 0
    latest_date = result[3]
    earliest_date = result[4]
    
    # Get average model
    c.execute('''SELECT model FROM usage_data WHERE user_id = ? 
                 GROUP BY model ORDER BY SUM(tokens_used) DESC LIMIT 1''', (user_id,))
    
    model_row = c.fetchone()
    primary_model = model_row[0] if model_row else 'gpt-3.5-turbo'
    
    # Calculate water usage
    water_calc = WaterCalculator.calculate_water_usage(
        total_tokens, 
        primary_model,
        'text_generation'
    )
    
    conn.close()
    
    return jsonify({
        'user_id': user_id,
        'email': user_row[0],
        'total_tokens': total_tokens,
        'total_requests': total_requests,
        'models_used': models_used,
        'primary_model': primary_model,
        'earliest_date': earliest_date,
        'latest_date': latest_date,
        'water_usage': water_calc,
        'water_context': {
            'bathtub_showers': round(water_calc['water_liters'] / 136, 1),  # Average shower ~136L
            'bottles': round(water_calc['water_liters'] / 0.5, 0),  # 500ml bottles
            'swimming_pools': round(water_calc['water_liters'] / 2_500_000, 3)  # Olympic pool
        }
    }), 200

@app.route('/api/datacenters', methods=['GET'])
def get_datacenters():
    """Get all data centers"""
    conn = sqlite3.connect('water_calc.db')
    c = conn.cursor()
    
    c.execute('''SELECT id, name, city, country, latitude, longitude, 
                 cooling_tech, water_intensity FROM data_centers WHERE status = 'active'
                 ORDER BY country''')
    
    centers = []
    for row in c.fetchall():
        centers.append({
            'id': row[0],
            'name': row[1],
            'city': row[2],
            'country': row[3],
            'latitude': row[4],
            'longitude': row[5],
            'cooling_tech': row[6],
            'water_intensity': row[7]
        })
    
    conn.close()
    return jsonify(centers), 200

@app.route('/api/datacenters/nearest', methods=['POST'])
def get_nearest_datacenters():
    """Get nearest data centers to user location"""
    data = request.json
    user_lat = data.get('latitude')
    user_lon = data.get('longitude')
    
    if user_lat is None or user_lon is None:
        return jsonify({'error': 'Missing latitude or longitude'}), 400
    
    import math
    
    conn = sqlite3.connect('water_calc.db')
    c = conn.cursor()
    
    c.execute('''SELECT id, name, city, country, latitude, longitude, 
                 cooling_tech, water_intensity FROM data_centers WHERE status = 'active'
                 ORDER BY country''')
    
    centers = []
    for row in c.fetchall():
        dc_lat, dc_lon = row[4], row[5]
        
        # Calculate distance using Haversine formula
        R = 6371  # Earth radius in km
        lat1, lon1, lat2, lon2 = map(math.radians, [user_lat, user_lon, dc_lat, dc_lon])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c_val = 2 * math.asin(math.sqrt(a))
        distance = R * c_val
        
        centers.append({
            'id': row[0],
            'name': row[1],
            'city': row[2],
            'country': row[3],
            'latitude': row[4],
            'longitude': row[5],
            'cooling_tech': row[6],
            'water_intensity': row[7],
            'distance_km': round(distance, 1)
        })
    
    # Sort by distance
    centers.sort(key=lambda x: x['distance_km'])
    
    conn.close()
    return jsonify(centers[:10]), 200  # Return top 10 nearest

if __name__ == '__main__':
    # Get port from environment (Render sets this) or use 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Determine if running in production
    is_production = os.getenv('FLASK_ENV') == 'production'
    
    app.run(
        host='0.0.0.0',  # Listen on all interfaces
        port=port,
        debug=not is_production  # Debug off in production
    )
