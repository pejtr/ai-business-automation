# AI Business Automation Platform — TODO

## Phase 2: Foundation
- [x] Database schema: lead_lists, outreach_campaigns, research_reports
- [x] tRPC routers: attract, convert, deliver, projects
- [x] Global design system: CSS variables, fonts, color palette (dark elegant theme)

## Phase 3: Dashboard & Layout
- [x] AppLayout with sidebar (Attract, Convert, Deliver, Automate, Human Element, Saved Projects)
- [x] Dashboard Home Page with 5-step framework overview cards
- [x] Responsive sidebar with active state indicators and collapse
- [x] Top header with user profile and branding
- [x] Landing page for unauthenticated users

## Phase 4: Attract Module
- [x] Lead generation form (niche, platform, count inputs)
- [x] AI-powered lead generation via LLM (structured JSON output)
- [x] Lead list results table (company, website, social handles, recent topics)
- [x] Save lead list to database
- [x] Export lead list as CSV

## Phase 5: Convert Module
- [x] Load saved lead lists for selection
- [x] AI-powered personalized email generation per lead
- [x] Email drafts display (subject + body per lead, expandable)
- [x] Save outreach campaign to database
- [x] Copy individual emails to clipboard
- [x] Export all emails as text file

## Phase 6: Deliver Module
- [x] Brand research form (company name or URL input)
- [x] AI-powered brand analysis report generation (structured markdown)
- [x] Research report display with Streamdown markdown rendering
- [x] Presentation generator from research report
- [x] Brand color/typography extraction via AI
- [x] Color picker for manual override
- [x] Multi-slide presentation HTML output in iframe
- [x] Save research reports to database with share token
- [x] Export report as Markdown download
- [x] Export presentation as HTML download
- [x] Open presentation full screen
- [x] Shareable link generation

## Phase 7: Saved Projects / History
- [x] Saved Projects page listing all lead lists, campaigns, reports
- [x] View/reload any saved project
- [x] Delete saved projects
- [x] Shareable links for reports
- [x] SharedReport public page for shared links

## Phase 8: Polish & Testing
- [x] Automate module placeholder page
- [x] Human Element module page with philosophy and reflection prompts
- [x] Vitest tests for all routers (9 tests passing)
- [x] TypeScript: 0 errors
- [x] Final checkpoint and delivery

## Email Tracking Feature (Convert Module Enhancement)
- [x] DB schema: email_tracking_events table (id, campaignId, emailIndex, company, eventType: open|click, linkUrl, ip, userAgent, createdAt)
- [x] DB schema: tracked_emails table (id, campaignId, emailIndex, company, trackingToken, subject, body, createdAt)
- [x] Server: GET /api/track/open/:token — serve 1x1 transparent pixel, record open event
- [x] Server: GET /api/track/click/:token?url=... — record click event, redirect to destination URL
- [x] tRPC: convert.getTrackingStats — return open/click counts per campaign and per email
- [x] tRPC: convert.generateTracked — generate emails with tracking pixel and tracked links injected
- [x] Convert UI: "Tracking" tab in campaign view showing open rate, click rate per email
- [x] Convert UI: Copy tracked email (HTML with pixel + tracked links) button
- [x] Convert UI: Real-time stats refresh button
- [x] Vitest tests for tracking router

## Neon Glow Redesign
- [x] Global CSS: neon palette (cyan, violet, pink, green), glow box-shadows, glassmorphism cards
- [x] AppLayout: neon sidebar with glowing active states, gradient logo
- [x] Home page: neon step cards with glow on hover, gradient hero text
- [x] Attract page: neon form inputs, glowing generate button, neon table
- [x] Convert page: neon tabs, glowing email cards, tracking stats with neon badges
- [x] Deliver page: neon research form, glowing report sections
- [x] Automate + HumanElement + SavedProjects: consistent neon style

## AI Assistant Widget
- [x] Upload assistant avatar image to static storage
- [x] tRPC: assistant.chat mutation — context-aware AI responses about the platform
- [x] AssistantWidget component — floating button with avatar, slide-up chat panel
- [x] Neon glow styling consistent with platform design
- [x] Integrate into AppLayout (visible on all pages)
- [x] Context awareness — assistant knows current page and can guide user
- [x] Vitest tests for assistant router

## Hero Diagram & Remaining Polish
- [x] Landing page hero: add visual services diagram showing the 5-step workflow with neon connections
- [x] SavedProjects: complete neon glow redesign (cards, tabs, empty states)

## Interactive Onboarding with Aria
- [x] OnboardingContext + useOnboarding hook (state: step, active, completed, skip, next, prev)
- [x] Onboarding data: 8 steps covering Attract, Convert, Deliver, Automate, Human Element
- [x] OnboardingOverlay component: Aria avatar, animated speech bubble, step progress bar, Next/Skip/Back buttons
- [x] Spotlight highlight: semi-transparent overlay with cutout over targeted UI element
- [x] Tooltip pointer: directional arrow pointing to highlighted element
- [x] Auto-trigger for first-time users (localStorage flag), manual restart from sidebar
- [x] Route-aware: onboarding navigates user to correct page for each step
- [x] Aria typing animation for speech bubble text
- [x] Completion screen: congratulations card with Aria avatar and CTA to start first lead list
- [x] Vitest tests for onboarding context logic

## Překlad do češtiny
- [x] AppLayout: sidebar navigace, uživatelská sekce, tlačítka
- [x] AssistantWidget: uvítání, placeholder, hlavička, systémový prompt
- [x] Home: hero text, popis kroků, CTA tlačítka, workflow diagram
- [x] OnboardingContext: texty všech 8 kroků průvodce
- [x] OnboardingOverlay: tlačítka, progress, závěrečná obrazovka
- [x] Attract: formulář, labely, nápovědy, tabulka výsledků, export
- [x] Convert: formulář, emaily, tracking dashboard, statistiky
- [x] Deliver: formulář, report, prezentace, sdílení
- [x] Automate: hero text, plánované funkce
- [x] HumanElement: citát, pilíře, popis
- [x] SavedProjects: záložky, karty, prázdné stavy, akce
- [x] Server: AI prompty pro attract, convert, deliver, assistant router

## AppsToCash Features Implementation
- [x] Niche Templates in Attract: predefined industry cards (zubař, fitness, restaurace, kadeřnictví, realitní makléř, barber, salon)
- [x] Each niche card: industry name, average project price, recommended AI solution, best outreach platform
- [x] Niche selection updates form defaults and AI prompt context
- [x] Pitch Script Generator in Convert: new "Skript" tab for walk-in and demo video scripts
- [x] AI generates personalized pitch scripts based on lead data and industry
- [x] Copy-to-clipboard for pitch scripts (plain text + formatted for video)
- [x] Retainer & Income Calculator widget on Home dashboard
- [x] Interactive calculator: X clients × Y Kč/month = Z Kč monthly revenue
- [x] Visualization of income growth path (0 → 100k Kč/month)
- [x] Save calculator state to database for tracking progress (backend done)

## AI-Powered Pitch Script Generation
- [x] tRPC: convert.generatePitchScripts mutation with LLM backend
- [x] LLM prompt: personalized walk-in script (lead data + niche context)
- [x] LLM prompt: personalized video demo script (lead data + niche context)
- [x] Convert UI: replace local placeholder with LLM mutation call
- [x] Loading state: spinner while LLM generates scripts
- [x] Error handling: display error message if generation fails
- [x] Vitest tests for pitch script generation router
