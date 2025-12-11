import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useBusiness, useBusinessContent, useBookings } from '../hooks/useBusiness';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  Plus,
  Upload,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle,
  ChevronDown,
  Building2,
  X,
} from 'lucide-react';

function BusinessSelector() {
  const { business, businesses, selectBusiness, createBusiness } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newAgentId, setNewAgentId] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createBusiness({
        business_name: newName,
        business_type: newType || null,
        elevenlabs_agent_id: newAgentId || null,
      });
      setNewName('');
      setNewType('');
      setNewAgentId('');
      setShowNewForm(false);
      setIsOpen(false);
    } catch (err) {
      alert('Failed to create business');
    } finally {
      setCreating(false);
    }
  };

  if (!business) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Building2 className="w-4 h-4 text-slate-500" />
        <span className="font-medium text-slate-700">{business.business_name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="p-2">
              <p className="text-xs font-medium text-slate-500 px-3 py-2">Your Businesses</p>
              {businesses.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    selectBusiness(b.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    b.id === business.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{b.business_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {b.is_live ? 'Live' : 'Draft'} {b.elevenlabs_agent_id ? '- Agent configured' : ''}
                    </p>
                  </div>
                  {b.id === business.id && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-200 p-2">
              {showNewForm ? (
                <div className="p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-900">Add Business</p>
                    <button onClick={() => setShowNewForm(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Business name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select type (optional)</option>
                    <option value="barber">Barber / Salon</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="clinic">Clinic / Doctor</option>
                    <option value="gym">Gym / Fitness</option>
                    <option value="spa">Spa / Wellness</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={newAgentId}
                    onChange={(e) => setNewAgentId(e.target.value)}
                    placeholder="ElevenLabs Agent ID (optional)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newName.trim()}
                    className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Business'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add another business
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')}>
                <h1 className="text-2xl font-bold text-slate-900">VoiceDesk</h1>
              </button>
              <span className="text-slate-300">/</span>
              <BusinessSelector />
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-5 h-5" />
                Overview
              </Link>
              <Link
                to="/dashboard/content"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <FileText className="w-5 h-5" />
                Content
              </Link>
              <Link
                to="/dashboard/bookings"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <Calendar className="w-5 h-5" />
                Bookings
              </Link>
              <Link
                to="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </nav>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function OverviewPage() {
  const { business } = useBusiness();
  const { bookings } = useBookings(business?.id);
  const [copied, setCopied] = useState(false);

  const agentUrl = business ? `${window.location.origin}/talk/${business.slug}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(agentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.appointment_datetime) > new Date()
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {business ? `Welcome, ${business.business_name}` : 'Welcome'}
        </h2>
        <p className="text-slate-600">Manage your voice agent and bookings</p>
      </div>

      {!business?.elevenlabs_agent_id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Configure Your Voice Agent</h3>
          <p className="text-blue-700 mb-4">Add your ElevenLabs Agent ID to enable voice conversations</p>
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings className="w-4 h-4" />
            Go to Settings
          </Link>
        </div>
      )}

      {business?.is_live ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">Your Agent is Live</h3>
              <p className="text-emerald-700 mb-4">Share this link with your customers</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={agentUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-emerald-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <a
              href={agentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700"
            >
              <ExternalLink className="w-6 h-6" />
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Complete Setup</h3>
          <p className="text-amber-700 mb-4">Add content and go live to start receiving bookings</p>
          <Link
            to="/dashboard/content"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Total Bookings</h4>
          <p className="text-3xl font-bold text-slate-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Upcoming</h4>
          <p className="text-3xl font-bold text-slate-900">{upcomingBookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-600 mb-2">This Week</h4>
          <p className="text-3xl font-bold text-slate-900">
            {
              bookings.filter((b) => {
                const bookingDate = new Date(b.appointment_datetime);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return bookingDate > new Date() && bookingDate < weekFromNow;
              }).length
            }
          </p>
        </div>
      </div>

      {upcomingBookings.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming Bookings</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900">{booking.customer_name}</h4>
                    <p className="text-sm text-slate-600">{booking.service_requested}</p>
                    {booking.customer_phone && (
                      <p className="text-sm text-slate-500">{booking.customer_phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(booking.appointment_datetime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(booking.appointment_datetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentPage() {
  const { business, updateBusiness } = useBusiness();
  const { content, addContent, deleteContent } = useBusinessContent(business?.id);
  const [uploading, setUploading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handleAddText = async () => {
    if (!textContent.trim()) return;

    setUploading(true);
    try {
      await addContent({
        content_type: 'text',
        original_filename: 'Manual Entry',
        extracted_text: textContent,
        extracted_json: { raw_text: textContent },
        processed: true,
      });
      setTextContent('');
      setShowTextInput(false);
    } catch (error) {
      console.error('Error adding content:', error);
      alert('Failed to add content');
    } finally {
      setUploading(false);
    }
  };

  const handleGoLive = async () => {
    if (content.length === 0) {
      alert('Please add some content before going live');
      return;
    }

    try {
      await updateBusiness({ is_live: true });
      alert('Your agent is now live!');
    } catch (error) {
      console.error('Error going live:', error);
      alert('Failed to activate agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Business Content</h2>
          <p className="text-slate-600">Add information for your voice agent</p>
        </div>
        {!business?.is_live && content.length > 0 && (
          <button
            onClick={handleGoLive}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Go Live
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowTextInput(true)}
          className="p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
        >
          <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-medium text-slate-700">Add Text Content</p>
        </button>

        <button
          disabled
          className="p-6 border-2 border-dashed border-slate-300 rounded-lg opacity-50 cursor-not-allowed"
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-medium text-slate-700">Upload File</p>
          <p className="text-xs text-slate-500 mt-1">Coming soon</p>
        </button>
      </div>

      {showTextInput && (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Text Content</h3>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter your business information: services, pricing, hours, location, policies, etc."
            className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setShowTextInput(false);
                setTextContent('');
              }}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddText}
              disabled={uploading || !textContent.trim()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Adding...' : 'Add Content'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Your Content</h3>
        </div>
        {content.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No content added yet</p>
            <p className="text-sm text-slate-500 mt-2">Add your first piece of content to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {content.map((item) => (
              <div key={item.id} className="p-6 flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{item.original_filename}</h4>
                  <p className="text-sm text-slate-600 capitalize mt-1">{item.content_type}</p>
                  {item.extracted_text && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{item.extracted_text}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteContent(item.id)}
                  className="text-red-600 hover:text-red-700 ml-4"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingsPage() {
  const { business } = useBusiness();
  const { bookings, loading } = useBookings(business?.id);

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Bookings</h2>
        <p className="text-slate-600">All appointments made through your voice agent</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No bookings yet</p>
            <p className="text-sm text-slate-500 mt-2">
              Bookings made through your agent will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">{booking.customer_name}</h4>
                    <p className="text-slate-600 mt-1">{booking.service_requested}</p>
                    {booking.customer_phone && (
                      <p className="text-sm text-slate-500 mt-1">{booking.customer_phone}</p>
                    )}
                    {booking.customer_email && (
                      <p className="text-sm text-slate-500">{booking.customer_email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      {new Date(booking.appointment_datetime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-slate-600 mt-1">
                      {new Date(booking.appointment_datetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { business, updateBusiness } = useBusiness();
  const [businessName, setBusinessName] = useState(business?.business_name || '');
  const [businessType, setBusinessType] = useState(business?.business_type || '');
  const [description, setDescription] = useState(business?.description || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [email, setEmail] = useState(business?.email || '');
  const [address, setAddress] = useState(business?.address || '');
  const [agentId, setAgentId] = useState(business?.elevenlabs_agent_id || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setBusinessName(business.business_name);
      setBusinessType(business.business_type || '');
      setDescription(business.description || '');
      setPhone(business.phone || '');
      setEmail(business.email || '');
      setAddress(business.address || '');
      setAgentId(business.elevenlabs_agent_id || '');
    }
  }, [business]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusiness({
        business_name: businessName,
        business_type: businessType,
        description,
        phone,
        email,
        address,
        elevenlabs_agent_id: agentId || null,
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Settings</h2>
        <p className="text-slate-600">Manage your business information</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        <div className="pb-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Voice Agent Settings</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ElevenLabs Agent ID
            </label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="agent_xxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
            />
            <p className="text-sm text-slate-500 mt-2">
              Get your Agent ID from the ElevenLabs Conversational AI dashboard. Each business needs its own unique agent.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select type</option>
            <option value="barber">Barber / Salon</option>
            <option value="restaurant">Restaurant</option>
            <option value="clinic">Clinic / Doctor</option>
            <option value="gym">Gym / Fitness</option>
            <option value="spa">Spa / Wellness</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const { business, businesses, loading, createBusiness } = useBusiness();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [agentId, setAgentId] = useState('');
  const [creatingBusiness, setCreatingBusiness] = useState(false);

  useEffect(() => {
    if (!loading && businesses.length === 0 && user) {
      setShowOnboarding(true);
    }
  }, [loading, businesses, user]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setCreatingBusiness(true);
    try {
      await createBusiness({
        business_name: businessName,
        business_type: businessType || null,
        elevenlabs_agent_id: agentId || null,
      });
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Failed to create business');
    } finally {
      setCreatingBusiness(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to VoiceDesk</h2>
          <p className="text-slate-600 mb-6">Let's set up your first business</p>

          <form onSubmit={handleCreateBusiness} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Joe's Barber Shop"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select type (optional)</option>
                <option value="barber">Barber / Salon</option>
                <option value="restaurant">Restaurant</option>
                <option value="clinic">Clinic / Doctor</option>
                <option value="gym">Gym / Fitness</option>
                <option value="spa">Spa / Wellness</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ElevenLabs Agent ID
              </label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="agent_xxxxxxxxxxxxxxx (optional)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                You can add this later in Settings
              </p>
            </div>

            <button
              type="submit"
              disabled={creatingBusiness || !businessName.trim()}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingBusiness ? 'Creating...' : 'Create Business'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
