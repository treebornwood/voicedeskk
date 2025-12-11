import { useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, Zap, Phone, Clock, Users } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Phone className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900">VoiceDesk</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/explore')}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                Explore
              </button>
              <button
                onClick={() => navigate('/sign-in')}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/sign-up')}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Give Your Business a Voice.
              <span className="block text-emerald-600">Literally.</span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Create an AI voice agent for your business in minutes. Customers can talk naturally to book
              appointments, ask questions, and get instant answers - no app downloads, no waiting on hold.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/sign-up')}
                className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg"
              >
                Create Your Agent
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 font-semibold text-lg"
              >
                Try a Demo
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">1. Upload Your Info</h4>
              <p className="text-slate-600">
                Add your business details, services, pricing, and hours. Upload PDFs, paste website URLs, or
                type directly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">2. Connect Calendar</h4>
              <p className="text-slate-600">
                Link your Google Calendar so your agent can check availability and book appointments in
                real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">3. Share Your Link</h4>
              <p className="text-slate-600">
                Get a unique link to your voice agent. Share it anywhere - social media, your website, or with
                a QR code in-store.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">Perfect For</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: 'Salons & Barbers',
                  description: 'Book haircuts and styling appointments',
                },
                {
                  icon: Calendar,
                  title: 'Restaurants',
                  description: 'Take reservations and answer menu questions',
                },
                {
                  icon: Clock,
                  title: 'Clinics & Doctors',
                  description: 'Schedule consultations and provide info',
                },
                {
                  icon: Zap,
                  title: 'Gyms & Studios',
                  description: 'Book classes and share membership details',
                },
              ].map((item, index) => (
                <div key={index} className="p-6 rounded-lg border border-slate-200 hover:border-emerald-300">
                  <item.icon className="w-10 h-10 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-emerald-50 mb-8">
              Join businesses that never miss a customer again
            </p>
            <button
              onClick={() => navigate('/sign-up')}
              className="px-8 py-4 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 font-semibold text-lg"
            >
              Create Your Agent Free
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>&copy; 2024 VoiceDesk. Built with ElevenLabs, n8n, and Clerk.</p>
        </div>
      </footer>
    </div>
  );
}
