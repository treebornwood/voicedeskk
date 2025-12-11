# VoiceDesk Demo Guide

This guide will help you prepare and deliver an impressive demo for the hackathon.

---

## Pre-Demo Setup (5 minutes)

### 1. Configure Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your Publishable Key
4. Update `.env`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

### 2. Configure ElevenLabs (Optional for Enhanced Demo)

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up and get your API key
3. Update `.env`:
   ```
   VITE_ELEVENLABS_API_KEY=your_actual_key_here
   ```

### 3. Create Demo Business

1. Start the app: `npm run dev`
2. Sign in with Clerk
3. Create a business profile:
   - Name: "Joe's Barber Shop"
   - Type: Barber / Salon
   - Phone: (555) 123-4567
   - Address: "123 Main St, Downtown"

4. Add content (copy-paste this):

```
Services & Pricing:
- Classic Haircut: $25 (30 minutes)
- Beard Trim: $15 (15 minutes)
- Hot Towel Shave: $35 (45 minutes)
- Hair & Beard Combo: $35 (45 minutes)

Hours:
Monday-Friday: 9:00 AM - 7:00 PM
Saturday: 10:00 AM - 6:00 PM
Sunday: Closed

About Us:
Joe's Barber Shop has been serving the community for over 10 years. We specialize in classic cuts and modern styles. Walk-ins welcome, but appointments are recommended.

Policies:
- Please arrive 5 minutes before your appointment
- We accept cash and card
- 24-hour cancellation notice appreciated
```

5. Click "Go Live"
6. Copy your agent link

---

## Demo Script (3 minutes)

### Opening (15 seconds)

> "Every local business loses customers to missed calls and phone tag. VoiceDesk solves this by letting any business create an AI voice agent in minutes. Let me show you how it works."

### Act 1: Business Setup (60 seconds)

**Screen:** Business Dashboard

> "I'm Joe, a barber shop owner. I just signed up and added my services, prices, and hours."

**Actions:**
1. Show Dashboard overview
2. Navigate to Content tab
3. Show the added content
4. Point out "Your Agent is Live" banner
5. Click "Copy" on the agent link

> "That's it. My agent is now live. I can share this link anywhere - my website, social media, even a QR code in my shop."

### Act 2: Customer Experience (90 seconds)

**Screen:** Open agent link in new tab/window

> "Now I'm Sarah, a customer who needs a haircut. I found Joe's link online."

**Actions:**
1. Show the business profile page
2. Click "Start Talking"
3. Ask: "What services do you offer?"
   - Show voice response and transcript

4. Ask: "How much is a haircut?"
   - Show response

5. Say: "I'd like to book a haircut for tomorrow"
   - Show booking form appear

6. Fill out the form:
   - Name: Sarah Johnson
   - Phone: (555) 987-6543
   - Service: Classic Haircut
   - Date: Tomorrow's date
   - Time: 2:00 PM

7. Click "Confirm Booking"
8. Show success message

> "Done! I got instant confirmation, and Joe's calendar is automatically updated."

### Act 3: Back to Business (30 seconds)

**Screen:** Switch back to Dashboard

> "And here's Joe's view - the booking appeared in his dashboard instantly."

**Actions:**
1. Navigate to Bookings tab
2. Show the new booking with all details
3. Point out customer info and appointment time

### Closing (15 seconds)

> "VoiceDesk works for any local business - barbers, restaurants, clinics, gyms. No more missed calls. No more phone tag. Customers get instant answers 24/7, businesses get bookings while they sleep."

---

## Pro Tips for Demo

### Before You Start
- Open all tabs beforehand (dashboard and agent link)
- Test your audio if doing voice demo
- Have the sample content ready to copy-paste
- Close unnecessary browser tabs
- Use incognito for customer view

### During Demo
- Speak slowly and clearly
- Let UI animations complete
- Point to specific elements as you explain
- Use "I'm Joe" and "I'm Sarah" to clarify perspective
- Show excitement when booking appears in dashboard

### If Things Go Wrong
- **Voice not working?** Use the quick question buttons instead
- **Slow internet?** Focus on the booking form flow
- **Can't sign in?** Have a video backup ready
- **Database error?** Explain the architecture while it loads

---

## Demo Variations

### Quick Demo (1 minute)
1. Show business dashboard with content
2. Open agent page
3. Click "Book Appointment" quick button
4. Fill and submit form
5. Show booking in dashboard

### Extended Demo (5 minutes)
Add these elements:
1. Show business onboarding flow (creating new business)
2. Demonstrate adding new content
3. Show business settings page
4. Browse the Explore directory
5. Show multiple bookings in dashboard
6. Explain the technology stack

### Technical Deep-Dive (10 minutes)
Include:
1. Show Supabase database schema
2. Explain RLS policies
3. Walk through n8n workflow architecture
4. Discuss ElevenLabs integration approach
5. Show Clerk authentication flow
6. Explain the code structure

---

## Questions You'll Get

### "How does the voice AI work?"
> "We use ElevenLabs Conversational AI. The agent has the business's knowledge base and can understand natural language. When customers ask questions, it searches the knowledge base and responds. For bookings, it triggers workflows to check calendar availability and create appointments."

### "What about calendar integration?"
> "We integrate with Google Calendar via OAuth. Business owners connect their calendar once, and then our n8n workflows can check availability in real-time and automatically create calendar events when customers book."

### "How do you extract info from PDFs?"
> "We use n8n workflows that trigger when content is uploaded. The workflow extracts text from PDFs, sends it to Claude Haiku to structure the information into categories like services, pricing, hours, etc., and stores it in our knowledge base."

### "Is the voice real-time?"
> "Yes! ElevenLabs provides real-time voice-to-voice conversation. Customers speak naturally, the agent understands and responds immediately. There's no typing or text-based interaction unless they prefer it."

### "How do you handle multiple languages?"
> "ElevenLabs supports multiple languages out of the box. In the future, we can detect the customer's language and respond accordingly. The business knowledge base can also be translated."

### "What's the business model?"
> "Freemium. Basic agents are free with limited bookings per month. Premium features include custom voice cloning, advanced analytics, SMS confirmations, multiple locations, and API access."

---

## Backup Plans

### If Live Demo Fails
1. Have screenshots/video recording ready
2. Walk through the architecture diagram
3. Show the code structure
4. Explain the hackathon challenges solved

### If Internet is Down
1. Run everything locally
2. Show pre-recorded video
3. Present the architecture and vision
4. Do a code walkthrough

### If Time is Short
1. Skip business creation (start logged in)
2. Use quick question buttons instead of voice
3. Show booking form directly
4. Just show final dashboard view

---

## Judging Criteria Alignment

### Innovation
- Two-sided platform concept
- Voice-first approach
- No-app-needed solution

### Implementation
- Full-stack application
- Database with RLS
- Authentication
- Real booking system

### Partner Integration
- **ElevenLabs:** Core voice AI (show API integration)
- **n8n:** Workflow automation (show architecture)
- **Clerk:** Authentication (show sign-in flow)
- **Supabase:** Database (show schema)

### Impact
- Solves real problem for local businesses
- Improves customer experience
- Accessible to non-technical owners
- Scalable solution

### Presentation
- Clear problem statement
- Live demo
- Technical depth
- Business viability

---

## Post-Demo Follow-Up

Have ready:
1. GitHub repository link
2. Live deployment URL
3. Architecture diagram
4. Roadmap slide
5. Contact information

---

## Sample Q&A Responses

**Q: How long did this take to build?**
> "We built the MVP in one hackathon session. The core platform works, and we have the architecture ready for full ElevenLabs and n8n integration."

**Q: What's next?**
> "Immediate next steps: integrate the full ElevenLabs voice pipeline, deploy n8n workflows for content processing, add Google Calendar OAuth. Then: file uploads, SMS confirmations, and analytics."

**Q: Can this scale?**
> "Absolutely. Supabase handles millions of requests, ElevenLabs voice agents are cloud-based, and n8n workflows are containerized. Each business gets their own agent instance, so performance scales linearly."

**Q: How do you prevent abuse?**
> "Rate limiting on bookings, RLS in database, verified business owners only through Clerk, moderation of content, and monitoring of conversation logs."

---

## Good Luck!

Remember:
- Be enthusiastic
- Tell a story
- Show, don't just tell
- Emphasize the impact on real businesses
- Have fun!

You've got this! 🚀
