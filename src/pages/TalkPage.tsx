import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicBusiness } from '../hooks/useBusiness';
import { supabase } from '../lib/supabase';
import {
  Phone,
  Mic,
  MicOff,
  MapPin,
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
  PhoneOff,
} from 'lucide-react';

type ConversationMessage = {
  role: 'agent' | 'user';
  text: string;
  timestamp: Date;
};

type AgentStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

export default function TalkPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { business, loading } = usePublicBusiness(slug);
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const conversationRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
  });

  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const addMessage = useCallback((role: 'agent' | 'user', text: string) => {
    setConversation(prev => [...prev, { role, text, timestamp: new Date() }]);
  }, []);

  const handleStartConversation = async () => {
    if (!agentId) {
      setErrorMessage('ElevenLabs Agent ID not configured');
      return;
    }

    setStatus('connecting');
    setErrorMessage(null);

    try {
      const { Conversation } = await import('@elevenlabs/client');

      const conversation = await Conversation.startSession({
        agentId: agentId,
        onConnect: () => {
          setStatus('connected');
          addMessage('agent', `Hi! Welcome to ${business?.business_name || 'our business'}. How can I help you today?`);
        },
        onDisconnect: () => {
          setStatus('idle');
          conversationRef.current = null;
        },
        onMessage: (message: { message: string; source: string }) => {
          if (message.source === 'ai') {
            addMessage('agent', message.message);
            setStatus('speaking');
          } else if (message.source === 'user') {
            addMessage('user', message.message);
            setStatus('listening');
          }
        },
        onError: (error: Error) => {
          console.error('Conversation error:', error);
          setErrorMessage(error.message || 'Connection error');
          setStatus('error');
        },
        onModeChange: (mode: { mode: string }) => {
          if (mode.mode === 'speaking') {
            setStatus('speaking');
          } else if (mode.mode === 'listening') {
            setStatus('listening');
          }
        },
      });

      conversationRef.current = conversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect');
      setStatus('error');
    }
  };

  const handleEndConversation = async () => {
    if (conversationRef.current) {
      try {
        await conversationRef.current.endSession();
      } catch (error) {
        console.error('Error ending session:', error);
      }
      conversationRef.current = null;
    }
    setStatus('idle');
  };

  const toggleMute = async () => {
    if (conversationRef.current) {
      try {
        if (isMuted) {
          await conversationRef.current.setVolume({ volume: 1 });
        } else {
          await conversationRef.current.setVolume({ volume: 0 });
        }
        setIsMuted(!isMuted);
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!business) return;

    try {
      const appointmentDatetime = new Date(`${bookingForm.date}T${bookingForm.time}`);

      const { error } = await supabase.from('bookings').insert({
        business_id: business.id,
        customer_name: bookingForm.name,
        customer_phone: bookingForm.phone,
        customer_email: bookingForm.email,
        service_requested: bookingForm.service,
        appointment_datetime: appointmentDatetime.toISOString(),
        status: 'confirmed',
      });

      if (error) throw error;

      setBookingSuccess(true);
      setShowBookingForm(false);
      addMessage('agent', `Perfect! I've booked ${bookingForm.service} for ${bookingForm.name} on ${appointmentDatetime.toLocaleDateString()} at ${bookingForm.time}.`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">Business not found</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Browse Businesses
          </button>
        </div>
      </div>
    );
  }

  const isActive = status !== 'idle' && status !== 'error';

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Explore
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600"></div>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{business.business_name}</h1>
                {business.business_type && (
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded capitalize mb-4">
                    {business.business_type}
                  </span>
                )}
                {business.description && (
                  <p className="text-slate-600 mb-6">{business.description}</p>
                )}

                {!isActive ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Phone className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                      Start Voice Conversation
                    </h2>
                    <p className="text-slate-600 mb-8">
                      Click the button below to talk with our AI agent
                    </p>

                    {errorMessage && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      onClick={handleStartConversation}
                      disabled={status === 'connecting'}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'connecting' ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Mic className="w-6 h-6" />
                          Start Talking
                        </>
                      )}
                    </button>
                    <p className="text-sm text-slate-500 mt-4">
                      Your browser will request microphone permission
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center gap-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            status === 'speaking'
                              ? 'bg-blue-500 animate-pulse'
                              : status === 'listening'
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {status === 'speaking' ? 'Agent Speaking' : status === 'listening' ? 'Listening...' : status}
                        </span>
                      </div>

                      <button
                        onClick={toggleMute}
                        className={`p-3 rounded-full ${
                          isMuted ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        } hover:opacity-80`}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={handleEndConversation}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                      >
                        <PhoneOff className="w-4 h-4" />
                        End Call
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-6 mb-6 h-80 overflow-y-auto">
                      <h3 className="font-semibold text-slate-900 mb-4">Conversation</h3>
                      {conversation.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-400">
                          <p>Conversation will appear here...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conversation.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-xs px-4 py-3 rounded-lg ${
                                  message.role === 'user'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-slate-900 border border-slate-200'
                                }`}
                              >
                                <p className="text-sm">{message.text}</p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    {bookingSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-emerald-900 mb-1">
                            Booking Confirmed!
                          </h4>
                          <p className="text-sm text-emerald-700">
                            Your appointment has been scheduled.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                    >
                      Book Appointment
                    </button>
                  </div>
                )}

                {showBookingForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleBookingSubmit} className="bg-white rounded-xl p-6 max-w-md w-full">
                      <h3 className="font-semibold text-slate-900 text-xl mb-4">Book Appointment</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            required
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Service
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Haircut, Consultation"
                            value={bookingForm.service}
                            onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              required
                              value={bookingForm.date}
                              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Time
                            </label>
                            <input
                              type="time"
                              required
                              value={bookingForm.time}
                              onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowBookingForm(false)}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                          >
                            Confirm Booking
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Info</h3>
              <div className="space-y-3">
                {business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">{business.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">How it Works</h3>
              <ol className="space-y-2 text-sm text-emerald-700">
                <li>1. Click "Start Talking" to begin</li>
                <li>2. Allow microphone access</li>
                <li>3. Speak naturally to the AI agent</li>
                <li>4. Book appointments anytime</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
