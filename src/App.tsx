import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TalkPage from './pages/TalkPage';
import ExplorePage from './pages/ExplorePage';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const isClerkConfigured = clerkPubKey && !clerkPubKey.includes('your_key_here');

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-4">
            Please configure Clerk authentication to access the dashboard.
          </p>
          <p className="text-sm text-slate-500">
            Add your VITE_CLERK_PUBLISHABLE_KEY to the .env file
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  const routes = (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/talk/:slug" element={<TalkPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );

  if (!isClerkConfigured) {
    return routes;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey!}>
      {routes}
    </ClerkProvider>
  );
}

export default App;
