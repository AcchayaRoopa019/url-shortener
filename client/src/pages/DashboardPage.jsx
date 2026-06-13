import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Link2, Copy, Trash2, BarChart2, Plus, 
  LogOut, Clipboard, QrCode, Calendar, 
  ExternalLink, Search, Check, AlertCircle, 
  Loader2, Sparkles, Activity
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create URL Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyCreatedUrl, setNewlyCreatedUrl] = useState(null);

  // QR Modal State
  const [qrModalUrl, setQrModalUrl] = useState(null);

  // Delete Confirmation State
  const [urlToDelete, setUrlToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy success indicator state
  const [copiedId, setCopiedId] = useState(null);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchUrls = async () => {
    try {
      const response = await api.get('/urls');
      setUrls(response.data.data);
    } catch (error) {
      toast.error('Failed to load short URLs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreateUrl = async (e) => {
    e.preventDefault();
    if (!originalUrl) return toast.error('Original URL is required');

    setIsSubmitting(true);
    try {
      const response = await api.post('/urls', {
        originalUrl,
        customAlias: customAlias || undefined,
        expiresAt: expiresAt || undefined
      });
      
      toast.success('URL shortened successfully!');
      setNewlyCreatedUrl(response.data.data);
      fetchUrls(); // Refresh list
      
      // Reset input fields
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUrl = async () => {
    if (!urlToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/urls/${urlToDelete}`);
      toast.success('Shortened URL deleted');
      setUrls(urls.filter(url => url._id !== urlToDelete));
      setUrlToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete URL');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (code, id) => {
    const fullUrl = `${API_BASE}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered URLs based on search
  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) || 
    url.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalClicks = urls.reduce((sum, item) => sum + (item.totalClicks || 0), 0);
  const activeUrls = urls.filter(url => url.isActive && (!url.expiresAt || new Date(url.expiresAt) > new Date())).length;

  return (
    <div class="relative min-h-screen bg-dark-950 text-white font-sans overflow-x-hidden pb-12">
      {/* Glow backgrounds */}
      <div class="glow-bg w-[500px] h-[500px] rounded-full bg-brand-500/10 top-[-10%] right-[-10%]"></div>
      <div class="glow-bg w-[600px] h-[600px] rounded-full bg-indigo-500/5 bottom-[-20%] left-[-10%]"></div>

      {/* Navbar */}
      <nav class="relative z-10 border-b border-gray-800/80 bg-dark-900/60 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-2">
              <div class="p-2 bg-brand-500/10 rounded-xl border border-brand-500/20">
                <Link2 class="h-6 w-6 text-brand-500" />
              </div>
              <span class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
                TrimURL
              </span>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="hidden sm:block text-right">
                <p class="text-xs text-gray-500 font-medium">Signed in as</p>
                <p class="text-sm font-semibold text-gray-200">{user?.name}</p>
              </div>
              <button 
                onClick={logout}
                class="flex items-center space-x-1 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800/60 hover:bg-red-550/20 hover:text-red-400 border border-gray-700/50 hover:border-red-500/30 rounded-xl transition duration-200 cursor-pointer"
              >
                <LogOut class="h-4 w-4" />
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-white">Dashboard</h1>
            <p class="text-sm text-gray-400 mt-1">Manage, copy, and track your shortened links</p>
          </div>
          <button 
            onClick={() => {
              setNewlyCreatedUrl(null);
              setIsCreateModalOpen(true);
            }}
            class="flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 transition duration-300 transform hover:-translate-y-0.5 cursor-pointer self-start md:self-auto"
          >
            <Plus class="h-5 w-5" />
            <span>Shorten a Link</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-4 right-4 p-2.5 bg-brand-500/10 rounded-xl text-brand-500">
              <Link2 class="h-5 w-5" />
            </div>
            <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Links</p>
            <h3 class="text-3xl font-bold text-white mt-2">{urls.length}</h3>
          </div>

          <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-4 right-4 p-2.5 bg-green-500/10 rounded-xl text-green-500">
              <Activity class="h-5 w-5" />
            </div>
            <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Clicks</p>
            <h3 class="text-3xl font-bold text-white mt-2">{totalClicks}</h3>
          </div>

          <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-4 right-4 p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Sparkles class="h-5 w-5" />
            </div>
            <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Active Links</p>
            <h3 class="text-3xl font-bold text-white mt-2">{activeUrls}</h3>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div class="glass-panel rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4 border border-gray-800/80">
          <div class="relative w-full sm:flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search class="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search by long URL or short code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              class="block w-full pl-10 pr-3 py-2.5 border border-gray-800 rounded-xl bg-dark-900/40 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-200 text-sm"
            />
          </div>
        </div>

        {/* URL Content Section */}
        {isLoading ? (
          /* Skeleton loader */
          <div class="glass-panel rounded-2xl border border-gray-800/80 p-8 space-y-4">
            <div class="h-8 bg-gray-800/50 rounded-lg animate-pulse w-1/4"></div>
            <div class="h-12 bg-gray-800/30 rounded-xl animate-pulse"></div>
            <div class="h-12 bg-gray-800/30 rounded-xl animate-pulse"></div>
            <div class="h-12 bg-gray-800/30 rounded-xl animate-pulse"></div>
          </div>
        ) : filteredUrls.length === 0 ? (
          /* Empty state */
          <div class="glass-panel rounded-2xl border border-gray-800/80 p-12 text-center flex flex-col items-center justify-center">
            <div class="p-4 bg-brand-500/10 rounded-full text-brand-500 border border-brand-500/10 mb-4">
              <Link2 class="h-8 w-8" />
            </div>
            <h3 class="text-lg font-bold text-white">No URLs shortened yet</h3>
            <p class="text-sm text-gray-400 mt-1 max-w-sm">
              {searchQuery ? "No search results match your criteria. Try adjusting your queries." : "Get started by pasting your first long URL to shorten and analyze clicks."}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                class="mt-6 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg transition duration-200 cursor-pointer"
              >
                Shorten your first link
              </button>
            )}
          </div>
        ) : (
          /* Main URL Table */
          <div class="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-800">
                <thead class="bg-gray-900/40">
                  <tr>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Original URL</th>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Short URL</th>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created Date</th>
                    <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Clicks</th>
                    <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-800/60 bg-dark-900/20">
                  {filteredUrls.map((url) => {
                    const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();
                    return (
                      <tr key={url._id} class="hover:bg-gray-800/20 transition-colors">
                        {/* Original URL */}
                        <td class="px-6 py-4 max-w-xs sm:max-w-sm md:max-w-md">
                          <div class="flex items-center space-x-2">
                            <span class="text-sm font-medium text-gray-200 truncate block" title={url.originalUrl}>
                              {url.originalUrl}
                            </span>
                            <a 
                              href={url.originalUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              class="text-gray-500 hover:text-brand-400 transition"
                            >
                              <ExternalLink class="h-3.5 w-3.5" />
                            </a>
                          </div>
                          {url.customAlias && (
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-400 mt-1 border border-brand-500/10">
                              Alias: {url.customAlias}
                            </span>
                          )}
                          {isExpired && (
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 mt-1 ml-2 border border-red-500/10">
                              Expired
                            </span>
                          )}
                        </td>
                        
                        {/* Short URL */}
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center space-x-2">
                            <a
                              href={`${API_BASE}/${url.shortCode}`}
                              target="_blank"
                              rel="noreferrer"
                              class="text-sm font-bold text-brand-400 font-mono hover:underline hover:text-brand-300"
                              title="Visit Short Link"
                            >
                              {url.shortCode}
                            </a>
                            <button
                              onClick={() => copyToClipboard(url.shortCode, url._id)}
                              class="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition"
                              title="Copy Short Link"
                            >
                              {copiedId === url._id ? <Check class="h-4 w-4 text-green-500" /> : <Copy class="h-4 w-4" />}
                            </button>
                          </div>
                        </td>

                        {/* Created Date */}
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>

                        {/* Click Count */}
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                          {url.totalClicks}
                        </td>

                        {/* Actions */}
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => setQrModalUrl(`${API_BASE}/${url.shortCode}`)}
                            class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition inline-flex items-center"
                            title="QR Code"
                          >
                            <QrCode class="h-4 w-4" />
                          </button>
                          <Link
                            to={`/analytics/${url._id}`}
                            class="p-2 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition inline-flex items-center"
                            title="View Analytics"
                          >
                            <BarChart2 class="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setUrlToDelete(url._id)}
                            class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition inline-flex items-center"
                            title="Delete Short Link"
                          >
                            <Trash2 class="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CREATE SHORT URL MODAL */}
      {isCreateModalOpen && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div class="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-800 animate-slideUp">
            <div class="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 class="text-xl font-bold flex items-center gap-2 text-white">
                <Sparkles class="h-5 w-5 text-brand-400 animate-pulse" />
                Shorten new link
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800/80 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {!newlyCreatedUrl ? (
              <form onSubmit={handleCreateUrl} class="space-y-4 mt-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Long URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/very-long-link-path-to-shorten"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    class="block w-full px-3 py-3 border border-gray-800 rounded-xl bg-dark-900/60 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition duration-200 text-sm"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Custom Alias (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="promo2026"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      class="block w-full px-3 py-3 border border-gray-800 rounded-xl bg-dark-900/60 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition duration-200 text-sm"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Expiry Date (Optional)
                    </label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Calendar class="h-4 w-4" />
                      </span>
                      <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        class="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-dark-900/60 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition duration-200 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    class="px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-800 rounded-xl border border-gray-700/50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    class="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-lg transition duration-200 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 class="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Shorten Link'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success View inside Modal */
              <div class="mt-4 space-y-6 text-center">
                <div class="mx-auto w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                  <Check class="h-6 w-6" />
                </div>
                <div>
                  <h4 class="text-lg font-bold text-white">Your link is ready!</h4>
                  <p class="text-sm text-gray-400 mt-1">Copy and share the shortened link below</p>
                </div>

                <div class="flex items-center gap-2 p-3 bg-gray-900 border border-gray-800 rounded-xl font-mono text-brand-400 text-base font-bold justify-between">
                  <a
                    href={`${API_BASE}/${newlyCreatedUrl.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                    class="truncate block pr-2 hover:underline hover:text-brand-300"
                  >
                    {`${API_BASE}/${newlyCreatedUrl.shortCode}`}
                  </a>
                  <button
                    onClick={() => copyToClipboard(newlyCreatedUrl.shortCode, 'new_url')}
                    class="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
                    title="Copy Link"
                  >
                    <Copy class="h-4 w-4" />
                  </button>
                </div>

                <div class="pt-4 border-t border-gray-800 flex justify-end">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setNewlyCreatedUrl(null);
                    }}
                    class="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR CODE DISPLAY MODAL */}
      {qrModalUrl && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-800 text-center relative">
            <button 
              onClick={() => setQrModalUrl(null)}
              class="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
            >
              ✕
            </button>
            <h3 class="text-lg font-bold text-white mb-2">QR Code</h3>
            <p class="text-xs text-gray-400 mb-6 truncate">{qrModalUrl}</p>

            <div class="inline-block p-4 bg-white rounded-xl shadow-lg mb-6">
              <QRCodeSVG value={qrModalUrl} size={180} />
            </div>

            <div class="flex justify-center">
              <button
                onClick={() => {
                  // Simply copy link
                  navigator.clipboard.writeText(qrModalUrl);
                  toast.success('Link copied!');
                }}
                class="px-5 py-2.5 bg-gray-850 hover:bg-gray-800 border border-gray-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Copy Link Url
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {urlToDelete && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-800">
            <div class="flex items-start space-x-3">
              <div class="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/10">
                <AlertCircle class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Delete short URL?</h3>
                <p class="text-sm text-gray-400 mt-1">
                  Are you sure you want to delete this short URL? This action will permanently delete all associated analytics reports and cannot be undone.
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-800">
              <button
                disabled={isDeleting}
                onClick={() => setUrlToDelete(null)}
                class="px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-gray-850 hover:bg-gray-800 border border-gray-700/50 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteUrl}
                class="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-550 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? <Loader2 class="h-4 w-4 animate-spin" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
