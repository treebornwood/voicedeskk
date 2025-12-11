# VoiceDesk

**Tagline:** Give your business a voice. Literally.

**One-liner:** Businesses upload their info, customers talk to their AI agent - book appointments, ask questions, get answers. No app downloads, no waiting on hold.

---

## Overview

VoiceDesk is a two-sided platform that enables local businesses to create AI voice agents that customers can talk to for information and appointment booking. Built for the hackathon using ElevenLabs, n8n, Clerk, and Supabase.

### The Problem

Local businesses (barbers, restaurants, clinics, gyms) lose customers to:
- Missed calls during busy hours
- Phone tag and voicemail frustration
- Limited availability for customer inquiries
- Manual appointment scheduling

### The Solution

VoiceDesk provides:
- **For Business Owners:** Create a voice agent in minutes by uploading business information and connecting their calendar
- **For Customers:** Talk naturally to book appointments and get instant answers 24/7
- **No App Required:** Everything works through a simple web link

---

## Features

### Business Owner Side
- Sign up and create business profile
- Upload business content (text, PDFs, URLs)
- Manage content and knowledge base
- View all bookings in dashboard
- Share unique agent link with customers
- Track conversations and analytics

### Customer Side
- Browse business directory
- Start voice conversation with any agent
- Ask questions naturally about services, pricing, hours
- Book appointments through conversation
- Get instant confirmation

### Core Technology
- **Voice AI:** ElevenLabs Conversational AI for natural voice interactions
- **Authentication:** Clerk for secure business owner login
- **Database:** Supabase for all data persistence
- **Workflow Automation:** n8n for content processing and calendar integration (ready to implement)
- **Calendar:** Google Calendar integration (ready to implement)

---

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **Voice AI:** ElevenLabs Conversational AI
- **Workflow Engine:** n8n (for hackathon demo)
- **Calendar:** Google Calendar API (for hackathon demo)
- **Routing:** React Router DOM

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Clerk account and API keys
- Supabase project (already configured)
- ElevenLabs API key (for voice integration)
- n8n instance (optional for full demo)

### Environment Setup

Update the `.env` file with your credentials:

```env
# Supabase (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key

# ElevenLabs Voice AI
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_ELEVENLABS_AGENT_ID=your_agent_id

# n8n Workflows (optional)
VITE_N8N_BASE_URL=https://your-n8n-instance.com
```

### Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Database Setup

The database schema is already created with the following tables:
- `businesses` - Business profiles and settings
- `business_content` - Uploaded content (PDFs, text, URLs)
- `business_knowledge` - Compiled knowledge base for agents
- `bookings` - Appointment bookings
- `conversations` - Conversation logs for analytics

All tables have Row Level Security (RLS) enabled for data protection.

---

## User Flows

### Business Owner Journey

1. **Sign Up**
   - Sign in with Clerk
   - Create business profile (name, type, contact info)

2. **Add Content**
   - Add text content about services, pricing, hours
   - Upload PDFs (menus, price lists) - *ready to implement*
   - Add website URLs to scrape - *ready to implement*

3. **Go Live**
   - Review extracted information
   - Activate agent
   - Get shareable link: `voicedesk.io/talk/your-business`

4. **Manage Bookings**
   - View all appointments in dashboard
   - See customer details
   - Track upcoming and past bookings

### Customer Journey

1. **Discover**
   - Browse business directory at `/explore`
   - Or access direct link: `/talk/business-slug`

2. **Talk**
   - Click "Start Talking" to begin conversation
   - Ask questions naturally
   - Get instant voice responses

3. **Book**
   - Request appointment through conversation
   - Fill booking form with details
   - Receive instant confirmation

---

## Demo Script (3 minutes)

### Part 1: Business Setup (1 min)

"Let me show you how a barber would set this up"

1. Sign in as business owner
2. Create "Joe's Barber Shop" profile
3. Add text content: services, prices, hours
4. Click "Go Live"
5. Show shareable link generated

### Part 2: Customer Experience (1.5 min)

"Now I'm a customer wanting a haircut"

1. Open `/talk/joes-barber` in new tab
2. Click "Start Talking"
3. Ask: "What services do you offer?"
4. Ask: "What are your prices?"
5. Say: "I'd like to book a haircut"
6. Fill booking form (name, phone, date, time)
7. Show booking confirmation

### Part 3: Back to Dashboard (30 sec)

"And the business owner sees it instantly"

1. Switch back to dashboard
2. Show new booking appeared
3. Display customer details and appointment time

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VOICEDESK PLATFORM                       │
├──────────────────────────┬──────────────────────────────────┤
│   BUSINESS OWNER SIDE    │       CUSTOMER SIDE              │
│                          │                                  │
│  Dashboard               │  Browse Directory                │
│  ├─ Create Profile       │  └─ Search & Filter              │
│  ├─ Upload Content       │                                  │
│  ├─ Manage Knowledge     │  Voice Agent Page                │
│  ├─ View Bookings        │  ├─ Business Info                │
│  └─ Settings             │  ├─ Voice Conversation           │
│                          │  ├─ Quick Questions              │
│  Supabase Database       │  └─ Booking Form                 │
│  ├─ businesses           │                                  │
│  ├─ business_content     │  Supabase Database               │
│  ├─ business_knowledge   │  └─ Create Bookings              │
│  └─ bookings             │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

---

## Project Structure

```
src/
├── components/          # Reusable UI components (future)
├── hooks/              # Custom React hooks
│   └── useBusiness.ts  # Business data management
├── lib/                # Core libraries
│   └── supabase.ts     # Supabase client & types
├── pages/              # Main application pages
│   ├── LandingPage.tsx      # Homepage
│   ├── Dashboard.tsx        # Business owner dashboard
│   ├── ExplorePage.tsx      # Business directory
│   └── TalkPage.tsx         # Customer voice interface
├── App.tsx             # Main app with routing
└── main.tsx            # App entry point
```

---

## Hackathon Partner Integrations

### ElevenLabs (Core - Required)
- Conversational AI for voice interactions
- Text-to-Speech for agent responses
- Speech-to-Text for customer input
- Agent configuration and knowledge base

### n8n (Backend Workflows)
- Content extraction from PDFs
- Website scraping for business info
- AI processing with Claude Haiku
- Calendar availability checking
- Booking creation workflow

### Clerk (Authentication)
- Secure business owner authentication
- User management
- Session handling
- Protected routes

### Supabase (Database)
- PostgreSQL database
- Real-time subscriptions
- Row Level Security
- File storage (ready for PDF uploads)

---

## Next Steps for Full Implementation

### Immediate (Demo Polish)
1. Integrate real ElevenLabs agent with API key
2. Add actual voice recording and playback
3. Implement n8n webhook endpoints
4. Add Google Calendar OAuth flow

### Phase 2 (Post-Hackathon)
1. PDF upload and extraction
2. Website URL scraping
3. Multi-language support
4. SMS confirmations via Twilio
5. Analytics dashboard
6. Custom voice cloning
7. Widget embed for business websites
8. QR code generation for in-store use

### Phase 3 (Scale)
1. Payment integration for premium features
2. Team management for multi-location businesses
3. Advanced scheduling rules
4. Customer CRM integration
5. API for third-party integrations

---

## Security & Privacy

- All business data protected with Row Level Security (RLS)
- Business owners can only access their own data
- Customers can create bookings but not view others' data
- Clerk handles authentication securely
- Environment variables for all sensitive keys
- No hardcoded credentials

---

## License

Built for Hackathon 2024

---

## Team

Built with love for local businesses everywhere

---

## Resources

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs)
- [Clerk Authentication Docs](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Workflow Automation](https://n8n.io)

---

## Support

For hackathon questions and demo setup, contact the team.

**VoiceDesk - Never miss a customer again** 🎤✨
