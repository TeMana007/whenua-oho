# CLAUDE.md — Kōrero Companion
Read this before every session. Do not ask questions already answered here.

## Project
Te reo Māori daily speaking practice app. NOT a Duolingo clone. Speaking-first, AI-powered, culturally safe. Aligned to Reo Ora (Dr. Rāpata Wiri) 75 sentence pattern curriculum.

## Tech Stack
- Web: Next.js 14 (App Router)
- Mobile: Expo (React Native)
- Styling: NativeWind (Tailwind)
- DB: Supabase
- AI Chat: Anthropic Claude (claude-sonnet-4-20250514)
- Speech-to-text: OpenAI Whisper
- TTS: ElevenLabs / Web Speech API
- State: Zustand
- Hosting: Vercel (web) + Expo EAS (mobile)

## Design System
- Primary: #04342C (dark teal)
- Secondary: #F5F0E8 (cream)
- Accent: #C8A951 (kōwhai gold)
- Success: #2D7A4F (pounamu green)
- Warning: #E07B39 (earth)
- Fonts: Playfair Display (headings) + DM Sans (body)
- Min button height: 56px
- Always render macrons correctly: ā ē ī ō ū

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=

## Cultural Rules (Non-Negotiable)
- Never auto-correct te reo Māori words
- AI defers to kaiako on cultural matters
- AI never presents as culturally authoritative
- All content validated by Dr. Rāpata Wiri before release
- Display: "Nā Dr. Rāpata Wiri ngā akoranga"
- No learner voice data stored beyond 90 days without consent

## Build Rules
- Mobile + web versions for every screen
- Supabase for all data reads/writes
- Confidence scores: 0.00–1.00 scale
- Spaced repetition: 1→3→7→14→30 days
- Max lesson session: 10 cards / 10 minutes
- Never shame learners — always encourage
