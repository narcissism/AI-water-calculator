import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Droplets, Zap, Activity, LogOut, Settings } from 'lucide-react';

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ? 
  process.env.REACT_APP_API_BASE_URL.replace(/\/$/, '') :  // Remove trailing slash if present
  'http://localhost:5000';

export default function WaterCalculatorApp() {
  const [appState, setAppState] = useState('login'); // login, dashboard, connecting
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [nearestCenters, setNearestCenters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log API base URL on mount
  useEffect(() => {
    console.log('🔗 API_BASE_URL:', API_BASE_URL);
    console.log('📍 NODE_ENV:', process.env.NODE_ENV);
  }, []);

  // Get user's geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

  // Fetch nearest data centers when user location is available
  useEffect(() => {
    if (userLocation && userId) {
      fetchNearestCenters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, userId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !apiKey) {
      setError('Please enter both email and API key');
      setLoading(false);
      return;
    }

    try {
      // Authenticate user
      const authUrl = `${API_BASE_URL}/api/auth/openai/callback`;
      console.log('📤 Sending auth request to:', authUrl);
      
      const authRes = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, api_key: apiKey }),
      });
      
      console.log('📥 Auth response status:', authRes.status);

      if (!authRes.ok) throw new Error('Authentication failed');

      const authData = await authRes.json();
      setUserId(authData.user_id);

      // Fetch usage data
      const usageRes = await fetch(`${API_BASE_URL}/api/user/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, api_key: apiKey }),
      });

      if (!usageRes.ok) throw new Error('Failed to fetch usage data');

      // Fetch user summary
      await fetchUserSummary(authData.user_id);

      setAppState('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSummary = async (uid) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/summary/${uid}`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNearestCenters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/datacenters/nearest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userLocation),
      });

      if (!res.ok) throw new Error('Failed to fetch data centers');
      const data = await res.json();
      setNearestCenters(data);
    } catch (err) {
      console.error('Error fetching nearest centers:', err);
    }
  };

  const handleLogout = () => {
    setAppState('login');
    setUserId(null);
    setUserData(null);
    setEmail('');
    setApiKey('');
    setError('');
  };

  const waterVisualizationData = userData ? [
    {
      name: 'Water Usage',
      liters: userData.water_usage.water_liters,
      gallons: userData.water_usage.water_gallons,
    },
  ] : [];

  if (appState === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
            <div className="flex justify-center mb-8">
              <div className="bg-blue-500 p-3 rounded-full">
                <Droplets size={32} className="text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Water Impact Calculator
            </h1>
            <p className="text-slate-400 text-center mb-8">
              Discover how much water your AI usage consumes
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  OpenAI Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {error && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition duration-200"
              >
                {loading ? 'Connecting...' : 'Connect OpenAI Account'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">About This App</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>✓ See total water consumption from your AI usage</li>
                <li>✓ Understand environmental impact of AI models</li>
                <li>✓ Locate data centers serving your requests</li>
                <li>✓ Compare water usage between models</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Zap size={48} className="text-blue-400" />
          </div>
          <p className="text-white text-lg">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Droplets size={24} className="text-white" />
            </div>
            <h1 className="text-white text-2xl font-bold">Water Impact Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{userData.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Tokens</p>
                <p className="text-white text-3xl font-bold">{(userData.total_tokens / 1_000_000).toFixed(1)}M</p>
              </div>
              <Activity size={32} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Requests</p>
                <p className="text-white text-3xl font-bold">{userData.total_requests}</p>
              </div>
              <Zap size={32} className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Primary Model</p>
                <p className="text-white text-2xl font-bold">{userData.primary_model}</p>
              </div>
              <Settings size={32} className="text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 border border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Water Used</p>
                <p className="text-white text-3xl font-bold">{userData.water_usage.water_liters}L</p>
                <p className="text-blue-200 text-xs mt-1">{userData.water_usage.water_gallons} gal</p>
              </div>
              <Droplets size={40} className="text-blue-200" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Water Usage Bar Chart */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-white text-xl font-bold mb-4">Water Consumption Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterVisualizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="liters" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-slate-700 rounded p-4">
              <p className="text-slate-300 text-sm">
                <span className="font-semibold">Equivalent to:</span>
              </p>
              <ul className="text-slate-300 text-sm mt-2 space-y-1">
                <li>🚿 {userData.water_context.bathtub_showers.toFixed(1)} showers</li>
                <li>🍾 {Math.round(userData.water_context.bottles)} water bottles</li>
                <li>🏊 {userData.water_context.swimming_pools.toFixed(4)} Olympic pools</li>
              </ul>
            </div>
          </div>

          {/* Energy & Model Info */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-white text-xl font-bold mb-4">Usage Summary</h2>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded p-4">
                <p className="text-slate-400 text-sm mb-1">Energy Consumption</p>
                <p className="text-white text-2xl font-bold">{userData.water_usage.energy_kwh} kWh</p>
              </div>

              <div className="bg-slate-700 rounded p-4">
                <p className="text-slate-400 text-sm mb-1">Model Used</p>
                <p className="text-white text-lg font-semibold">{userData.water_usage.model}</p>
                <p className="text-slate-400 text-xs mt-2">Task Type: {userData.water_usage.task_type}</p>
              </div>

              <div className="bg-slate-700 rounded p-4">
                <p className="text-slate-400 text-sm mb-1">Data Period</p>
                <p className="text-white text-sm">
                  {userData.earliest_date} to {userData.latest_date}
                </p>
              </div>

              <div className="bg-blue-900 rounded p-4 border border-blue-700">
                <p className="text-blue-200 text-xs leading-relaxed">
                  💧 <strong>Did you know?</strong> AI models require significant water for cooling. This calculator helps you understand the environmental impact of your usage and encourages mindful AI consumption.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Centers Map Section */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin size={24} className="text-blue-400" />
            Nearby Data Centers
          </h2>

          {userLocation ? (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Your Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </p>

              <div className="bg-slate-700 rounded-lg overflow-hidden mb-6" style={{ height: '400px' }}>
                {/* Simple coordinate-based visualization */}
                <svg width="100%" height="100%" viewBox="0 0 1000 400" className="bg-slate-900">
                  {/* Grid */}
                  <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#475569" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="1000" height="400" fill="url(#grid)" />

                  {/* User location */}
                  <circle
                    cx="500"
                    cy="200"
                    r="12"
                    fill="#3b82f6"
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  <text x="500" y="240" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="bold">
                    You
                  </text>

                  {/* Data centers */}
                  {nearestCenters.slice(0, 5).map((dc, idx) => {
                    const angle = (idx * 72) * (Math.PI / 180); // Spread 5 centers around
                    const radius = 120;
                    const x = 500 + radius * Math.cos(angle);
                    const y = 200 + radius * Math.sin(angle);

                    return (
                      <g key={dc.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r="10"
                          fill="#10b981"
                          stroke="#047857"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y + 30}
                          textAnchor="middle"
                          fill="#a7f3d0"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {dc.city}
                        </text>
                        <line
                          x1="500"
                          y1="200"
                          x2={x}
                          y2={y}
                          stroke="#64748b"
                          strokeWidth="1"
                          strokeDasharray="5,5"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearestCenters.slice(0, 6).map((dc) => (
                  <div key={dc.id} className="bg-slate-700 rounded p-4 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold">{dc.name}</p>
                        <p className="text-slate-400 text-sm">
                          📍 {dc.city}, {dc.country}
                        </p>
                      </div>
                      <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-xs font-semibold">
                        {dc.distance_km} km away
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">
                      ❄️ Cooling: {dc.cooling_tech}
                    </p>
                    <p className="text-slate-400 text-xs">
                      💧 Water Intensity: {dc.water_intensity} gal/kWh
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-700 rounded p-6 text-center">
              <p className="text-slate-400">Enable location services to see nearby data centers</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 py-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm text-center">
            Water Impact Calculator • Made for educational awareness • Data estimated based on public sources
          </p>
        </div>
      </main>
    </div>
  );
}
