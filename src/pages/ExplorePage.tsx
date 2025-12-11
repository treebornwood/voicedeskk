import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Business } from '../lib/supabase';
import { Search, MapPin, Phone, ArrowRight, Home, Mic, Sparkles } from 'lucide-react';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_live', true)
      .not('elevenlabs_agent_id', 'is', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBusinesses(data);
    }
    setLoading(false);
  };

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || business.business_type === selectedType;
    return matchesSearch && matchesType;
  });

  const businessTypes = Array.from(new Set(businesses.map((b) => b.business_type).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Phone className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900">VoiceDesk</h1>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-emerald-600" />
            <h2 className="text-4xl font-bold text-slate-900">Try AI Voice Agents</h2>
            <Sparkles className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-xl text-slate-600 mb-3">Talk to AI agents and book appointments instantly</p>
          <p className="text-sm text-slate-500">All agents are powered by ElevenLabs conversational AI</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {businessTypes.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedType('')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedType === ''
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-300'
                }`}
              >
                All
              </button>
              {businessTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type || '')}
                  className={`px-4 py-2 rounded-lg font-medium capitalize ${
                    selectedType === type
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading businesses...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-12">
            <Mic className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2 text-lg font-medium">No AI voice agents found</p>
            <p className="text-slate-500 text-sm mb-4">
              {searchQuery || selectedType
                ? 'Try adjusting your filters to see available agents'
                : 'Create a business with an ElevenLabs agent and mark it as live to showcase it here'}
            </p>
            {(searchQuery || selectedType) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
                onClick={() => navigate(`/talk/${business.slug}`)}
              >
                <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">AI Voice</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{business.business_name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {business.business_type && (
                          <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full capitalize">
                            {business.business_type}
                          </span>
                        )}
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          ElevenLabs
                        </span>
                      </div>
                    </div>
                  </div>

                  {business.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{business.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    {business.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{business.address}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-lg group-hover:shadow-xl transition-all">
                    <Mic className="w-5 h-5" />
                    Start Voice Chat
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
