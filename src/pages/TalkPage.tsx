import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicBusiness } from '../hooks/useBusiness';
import { supabase, BusinessKnowledge } from '../lib/supabase';
import {
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Mail,
  ArrowLeft,
  Calendar,
  CheckCircle,
} from 'lucide-react';

type ConversationMessage = {
  role: 'agent' | 'user';
  text: string;
  timestamp: Date;
};

export default function TalkPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { business, loading } = usePublicBusiness(slug);
  const [knowledge, setKnowledge] = useState<BusinessKnowledge | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    if (business) {
      fetchKnowledge();
    }
  }, [business]);

  const fetchKnowledge = async () => {
    if (!business) return;

    const { data } = await supabase
      .from('business_knowledge')
      .select('*')
      .eq('business_id', business.id)
      .maybeSingle();

    if (data) {
      setKnowledge(data);
    }
  };

  const handleStartConversation = () => {
    setIsConnected(true);
    const greeting = `Hi! Welcome to ${business?.business_name}. I can help you learn about our services or book an appointment. What would you like to know?`;
    setConversation([
      {
        role: 'agent',
        text: greeting,
        timestamp: new Date(),
      },
    ]);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(greeting);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEndConversation = () => {
    setIsConnected(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setConversation((prev) => [
      ...prev,
      {
        role: 'user',
        text: question,
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => {
      let response = '';

      if (question.toLowerCase().includes('services') || question.toLowerCase().includes('offer')) {
        response =
          'We offer a variety of services. Let me get those details for you. You can find our full service menu in our business information. Would you like to book an appointment?';
      } else if (
        question.toLowerCase().includes('price') ||
        question.toLowerCase().includes('cost')
      ) {
        response =
          'Our pricing varies by service. For specific pricing details, I recommend checking our service menu or speaking with our team. Would you like to book an appointment to discuss your needs?';
      } else if (question.toLowerCase().includes('book') || question.toLowerCase().includes('appointment')) {
        response = 'I would be happy to help you book an appointment! Let me collect some information.';
        setShowBookingForm(true);
      } else {
        response =
          'That is a great question! For detailed information, please check our business details below, or I can help you book an appointment to speak with our team directly.';
      }

      setConversation((prev) => [
        ...prev,
        {
          role: 'agent',
          text: response,
          timestamp: new Date(),
        },
      ]);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response);
        window.speechSynthesis.speak(utterance);
      }
    }, 1000);
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

      const confirmationMessage = `Perfect! I have booked ${bookingForm.service} for ${bookingForm.name} on ${new Date(
        appointmentDatetime
      ).toLocaleDateString()} at ${bookingForm.time}. You will receive a confirmation shortly.`;

      setConversation((prev) => [
        ...prev,
        {
          role: 'agent',
          text: confirmationMessage,
          timestamp: new Date(),
        },
      ]);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(confirmationMessage);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
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

                {!isConnected ? (
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
                    <button
                      onClick={handleStartConversation}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <Mic className="w-6 h-6" />
                      Start Talking
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
                            isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-slate-700">
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3 rounded-full ${
                          isMuted ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        } hover:opacity-80`}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={handleEndConversation}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        End Call
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                      <h3 className="font-semibold text-slate-900 mb-4">Conversation</h3>
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
                      </div>
                    </div>

                    {bookingSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-emerald-900 mb-1">
                            Booking Confirmed!
                          </h4>
                          <p className="text-sm text-emerald-700">
                            Your appointment has been scheduled. You will receive a confirmation
                            shortly.
                          </p>
                        </div>
                      </div>
                    )}

                    {showBookingForm && (
                      <form onSubmit={handleBookingSubmit} className="bg-slate-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Book Appointment</h3>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Your Name
                              </label>
                              <input
                                type="text"
                                required
                                value={bookingForm.name}
                                onChange={(e) =>
                                  setBookingForm({ ...bookingForm, name: e.target.value })
                                }
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
                                onChange={(e) =>
                                  setBookingForm({ ...bookingForm, phone: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Email (optional)
                            </label>
                            <input
                              type="email"
                              value={bookingForm.email}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, email: e.target.value })
                              }
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
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, service: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                required
                                value={bookingForm.date}
                                onChange={(e) =>
                                  setBookingForm({ ...bookingForm, date: e.target.value })
                                }
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
                                onChange={(e) =>
                                  setBookingForm({ ...bookingForm, time: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
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
                    )}

                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleQuickQuestion('What services do you offer?')}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 text-sm font-medium text-slate-700"
                      >
                        What services do you offer?
                      </button>
                      <button
                        onClick={() => handleQuickQuestion('What are your prices?')}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 text-sm font-medium text-slate-700"
                      >
                        What are your prices?
                      </button>
                      <button
                        onClick={() => handleQuickQuestion('I would like to book an appointment')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                      >
                        Book Appointment
                      </button>
                    </div>
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
                <li>1. Start the conversation</li>
                <li>2. Ask questions naturally</li>
                <li>3. Book appointments instantly</li>
                <li>4. Get confirmation right away</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
