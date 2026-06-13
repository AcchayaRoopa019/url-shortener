import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  ArrowLeft, Calendar, MousePointerClick, 
  Clock, Link2, Monitor, Globe, Info, 
  HelpCircle, Sparkles, Navigation 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  Cell, Legend, PieChart, Pie 
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#4d70ff', '#818cf8', '#34d399', '#f59e0b', '#ec4899', '#a78bfa'];

const AnalyticsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/urls/${id}/analytics`);
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  if (isLoading) {
    return (
      <div class="min-h-screen bg-dark-950 text-white p-8 flex items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-brand-500/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-t-brand-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div class="min-h-screen bg-dark-950 text-white p-8 flex flex-col items-center justify-center">
        <div class="text-center p-8 glass-panel rounded-2xl max-w-md border border-gray-800">
          <h2 class="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p class="text-gray-400 mb-6">Analytics data for this shortened URL could not be found or you do not have permission to view it.</p>
          <Link to="/dashboard" class="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg transition">
            <ArrowLeft class="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const { url, summary, dailyClicks, devices, browsers, countries, recentVisits } = data;
  const shortLink = `${API_BASE}/${url.shortCode}`;

  return (
    <div class="relative min-h-screen bg-dark-950 text-white font-sans overflow-x-hidden pb-12">
      {/* Decorative Glows */}
      <div class="glow-bg w-[500px] h-[500px] rounded-full bg-brand-500/10 top-[-10%] left-[-10%]"></div>
      <div class="glow-bg w-[600px] h-[600px] rounded-full bg-indigo-500/5 bottom-[-20%] right-[-10%]"></div>

      <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation / Header */}
        <div class="mb-8">
          <Link to="/dashboard" class="inline-flex items-center space-x-2 text-sm font-semibold text-gray-400 hover:text-white transition mb-6">
            <ArrowLeft class="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div class="flex items-center space-x-2">
                <h1 class="text-3xl font-extrabold text-white">Link Analytics</h1>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/10">
                  {url.shortCode}
                </span>
              </div>
              <p class="text-sm text-gray-400 mt-2 flex flex-wrap items-center gap-1">
                <span class="text-gray-500">Destination:</span> 
                <a href={url.originalUrl} target="_blank" rel="noreferrer" class="text-brand-400 hover:underline inline-flex items-center gap-0.5 truncate max-w-xs sm:max-w-md">
                  {url.originalUrl}
                </a>
              </p>
            </div>
            
            <div class="flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-xl p-3 max-w-md">
              <a
                href={shortLink}
                target="_blank"
                rel="noreferrer"
                class="text-xs text-brand-400 hover:text-brand-300 font-mono hover:underline truncate"
              >
                {shortLink}
              </a>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(shortLink);
                  toast.success('Copied link!');
                }}
                class="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-4 right-4 p-2.5 bg-brand-500/10 rounded-xl text-brand-500">
              <MousePointerClick class="h-5 w-5" />
            </div>
            <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Clicks</p>
            <h3 class="text-3xl font-bold text-white mt-2">{summary.totalClicks}</h3>
          </div>

          <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-4 right-4 p-2.5 bg-green-500/10 rounded-xl text-green-500">
              <Clock class="h-5 w-5" />
            </div>
            <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Last Clicked</p>
            <h3 class="text-lg font-bold text-white mt-2.5">
              {summary.lastVisitedAt ? new Date(summary.lastVisitedAt).toLocaleString() : 'No clicks logged yet'}
            </h3>
          </div>

          <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-4 right-4 p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Calendar class="h-5 w-5" />
            </div>
            <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Created Date</p>
            <h3 class="text-xl font-bold text-white mt-2.5">
              {new Date(url.createdAt).toLocaleDateString()}
            </h3>
          </div>
        </div>

        {/* Analytics Charts */}
        {summary.totalClicks === 0 ? (
          <div class="glass-panel rounded-2xl border border-gray-800/80 p-12 text-center flex flex-col items-center justify-center mb-8">
            <HelpCircle class="h-12 w-12 text-gray-600 mb-4" />
            <h3 class="text-lg font-bold text-white">No Clicks Yet</h3>
            <p class="text-sm text-gray-400 mt-1 max-w-sm">
              We will track device types, browser agents, click locations, and daily click counts once people start visiting your link.
            </p>
          </div>
        ) : (
          <>
            {/* Daily Clicks Line Chart */}
            <div class="glass-panel rounded-2xl border border-gray-800/80 p-6 mb-8">
              <h3 class="text-lg font-bold text-white mb-6">Daily Clicks Trend (Last 30 Days)</h3>
              <div class="h-80 w-full">
                {dailyClicks.length === 0 ? (
                  <div class="h-full flex items-center justify-center text-gray-500 text-sm">
                    No timeline data to display yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyClicks} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4d70ff" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4d70ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        fontSize={12}
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#9ca3af" 
                        fontSize={12}
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111827', 
                          borderColor: '#1f2937', 
                          borderRadius: '12px',
                          color: '#fff' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#4d70ff" 
                        strokeWidth={3} 
                        dot={{ r: 4, stroke: '#4d70ff', strokeWidth: 2, fill: '#111827' }}
                        activeDot={{ r: 6, fill: '#4d70ff' }}
                        fill="url(#colorClicks)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Distribution Charts Grid */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Devices chart */}
              <div class="glass-panel rounded-2xl border border-gray-800/80 p-6">
                <h3 class="text-base font-bold text-white mb-6 flex items-center gap-2">
                  <Monitor class="h-4.5 w-4.5 text-gray-400" />
                  Devices
                </h3>
                <div class="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devices}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {devices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }} 
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        iconSize={10} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Browsers chart */}
              <div class="glass-panel rounded-2xl border border-gray-800/80 p-6">
                <h3 class="text-base font-bold text-white mb-6 flex items-center gap-2">
                  <Globe class="h-4.5 w-4.5 text-gray-400" />
                  Browsers
                </h3>
                <div class="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={browsers}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {browsers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }} 
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        iconSize={10} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Countries chart */}
              <div class="glass-panel rounded-2xl border border-gray-800/80 p-6">
                <h3 class="text-base font-bold text-white mb-6 flex items-center gap-2">
                  <Navigation class="h-4.5 w-4.5 text-gray-400" />
                  Countries
                </h3>
                <div class="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countries} layout="vertical" margin={{ left: -10, right: 10 }}>
                      <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }} 
                      />
                      <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]}>
                        {countries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Visits Table */}
            <div class="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl">
              <div class="px-6 py-4 border-b border-gray-800 bg-gray-900/20 flex items-center justify-between">
                <h3 class="text-lg font-bold text-white">Recent Clicks Activity</h3>
                <span class="text-xs text-gray-400">Showing last {recentVisits.length} logs</span>
              </div>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-800">
                  <thead class="bg-gray-900/40">
                    <tr>
                      <th scope="col" class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                      <th scope="col" class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">IP Address</th>
                      <th scope="col" class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Device</th>
                      <th scope="col" class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Browser</th>
                      <th scope="col" class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-800/60 bg-dark-900/20">
                    {recentVisits.map((visit) => (
                      <tr key={visit._id} class="hover:bg-gray-800/10 transition-colors">
                        <td class="px-6 py-3.5 whitespace-nowrap text-sm text-gray-300">
                          {new Date(visit.visitedAt).toLocaleString()}
                        </td>
                        <td class="px-6 py-3.5 whitespace-nowrap text-sm font-mono text-gray-450">
                          {visit.ipAddress}
                        </td>
                        <td class="px-6 py-3.5 whitespace-nowrap text-sm text-gray-300">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700/60">
                            {visit.device}
                          </span>
                        </td>
                        <td class="px-6 py-3.5 whitespace-nowrap text-sm text-gray-300">
                          {visit.browser}
                        </td>
                        <td class="px-6 py-3.5 whitespace-nowrap text-sm text-gray-300">
                          {visit.country}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default AnalyticsPage;
