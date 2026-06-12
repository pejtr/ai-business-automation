# Agency AI — AI Business Automation Platform

Elegantní platforma pro automatizaci obchodních procesů agentur. Provádí nové uživatele 5-krokovým frameworkem: **Attract** (generování leadů), **Convert** (personalizované emaily), **Deliver** (brand research + prezentace), **Automate** (plánování), **Human Element** (filosofie).

## 🚀 Funkce

### ✅ Implementované
- **Attract Module**: AI generování leadů s filtrováním dle niche, export CSV
- **Convert Module**: Personalizované emaily s AI, email tracking (open/click), pitch skript generátor s LLM
- **Deliver Module**: Brand research report (AI), multi-slide prezentace s brand barvami, sdílitelné linky
- **Saved Projects**: Historie všech leadů, kampaní, reportů
- **Niche Templates**: 7 předpřipravených odvětví (zubař, fitness, restaurace, salon, realitní makléř, barber, wellness)
- **Income Calculator**: Interaktivní widget pro výpočet měsíčního příjmu
- **AI Asistentka Aria**: Plovoucí chat widget s avatarem, dostupný na všech stránkách
- **Interactive Onboarding**: 8-krokový průvodce s Arií pro nové uživatele
- **Neon Glow Design**: Moderní tmavý design s neonovými barvami a glow efekty
- **Čeština**: Celá platforma přeložena do češtiny

### 📋 Plánované (TODO)

#### 1. Notifikace v reálném čase
- [ ] Push notifikace vlastníkovi při otevření emailu
- [ ] Push notifikace při kliknutí na odkaz v emailu
- [ ] Email notifikace s shrnutím denní aktivity
- [ ] In-app notifikace v notification center

#### 2. A/B testování emailů
- [ ] Generovat 2 varianty subject line pro každý lead
- [ ] Generovat 2 varianty body copy (formální vs neformální)
- [ ] Sledovat open rate a click rate pro obě varianty
- [ ] Doporučit vítěznou variantu na základě dat
- [ ] Dashboard s A/B test výsledky

#### 3. Exportní report sledování
- [ ] Export tracking statistik jako CSV
- [ ] Export tracking statistik jako PDF s grafy
- [ ] Vizualizace open rate a click rate v grafech
- [ ] Shrnutí top performing leadů
- [ ] Exportní report pro prezentaci klientům

#### 4. Vlastní profil agentury
- [ ] Stránka Nastavení s názvem agentury, logem, kontaktem
- [ ] Automatické doplnění údajů do emailů a prezentací
- [ ] Branding odesílatele (podpis, logo, barvy)
- [ ] Uložení do databáze a synchronizace

#### 5. Šablony emailů
- [ ] Knihovna šablon tónu (formální, neformální, agresivní)
- [ ] Uložení vlastních šablon
- [ ] Výběr šablony před generováním kampaně
- [ ] Přizpůsobení AI promptu dle vybrané šablony

#### 6. Dashboard statistiky
- [ ] Live metriky: celkový počet leadů, průměrný open rate, počet reportů
- [ ] Neonové stat karty na Home dashboardu
- [ ] Trend grafy (weekly/monthly)
- [ ] Top performing niches

#### 7. Integrace s externími nástroji
- [ ] Slack notifikace při otevření emailu
- [ ] Google Sheets export pro tracking dat
- [ ] Zapier/Make.com webhook pro custom integraci
- [ ] CRM sync (HubSpot, Pipedrive)

#### 8. Pokročilá personalizace
- [ ] Dynamické obsah v emailech (jméno, název firmy, recent news)
- [ ] Personalizované video demo skript generátor
- [ ] Kontextové AI odpovědi na základě lead profilu
- [ ] Sentiment analysis pro optimalizaci tónu

#### 9. Vícejazyčnost
- [ ] Přepínač jazyka (EN/CS)
- [ ] Překlad onboarding textu
- [ ] Překlad AI promptů pro různé jazyky
- [ ] Lokalizace měny a formátů

#### 10. Pokročilé analytiky
- [ ] Funnel analysis (leads → emails sent → opens → clicks)
- [ ] Cohort analysis (skupiny leadů dle niche)
- [ ] Predictive analytics (který lead má nejvyšší šanci na konverzi)
- [ ] Custom report builder

## 🛠️ Technologie

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL (Drizzle ORM)
- **AI**: LLM API (invokeLLM helper)
- **Auth**: Manus OAuth
- **Testing**: Vitest (35 testů)

## 📦 Setup

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Struktura projektu

```
client/
  src/
    pages/          # Stránky modulů (Attract, Convert, Deliver, etc.)
    components/     # Komponenty (AppLayout, AssistantWidget, OnboardingOverlay)
    contexts/       # React contexts (OnboardingContext)
    lib/            # tRPC client
    index.css       # Neon glow design system

server/
  routers.ts        # tRPC procedury (attract, convert, deliver, tracking, niche, income, assistant)
  db.ts             # Query helpers
  trackingRoutes.ts # Email tracking endpoints

drizzle/
  schema.ts         # Database schema
```

## 🔑 Klíčové procedury

### Attract
- `attract.generate` — AI generování leadů
- `attract.save` — Uložení lead listu
- `attract.list` — Seznam všech lead listů

### Convert
- `convert.generate` — AI generování emailů
- `convert.generateTracked` — Emaily s tracking pixelem
- `convert.generatePitchScripts` — AI generování pitch skriptů
- `convert.getTrackingStats` — Statistiky otevření/kliknutí
- `convert.save` — Uložení kampaně

### Deliver
- `deliver.research` — AI brand research report
- `deliver.presentation` — Generování prezentace
- `deliver.extractColors` — Extrakce brand barev
- `deliver.save` — Uložení reportu

### Tracking
- `GET /api/track/open/:token` — Pixel pro otevření emailu
- `GET /api/track/click/:token?url=...` — Redirect pro kliknutí

### Niche & Income
- `niche.list` — Seznam niche šablon
- `income.save` — Uložení kalkulátoru
- `income.get` — Načtení uloženého stavu

### Assistant
- `assistant.chat` — Aria asistentka

## 🎨 Design

- **Barvy**: Cyan (#00d9ff), Violet (#b026ff), Pink (#ff006e), Green (#00ff41)
- **Glow efekty**: box-shadow s neon barvami
- **Glassmorphism**: Poloprůhledné karty s backdrop blur
- **Typografie**: Inter font, gradient texty

## 🚀 Deployment

Projekt je připraven na Manus hosting s vlastní doménou `aibizauto-jypb2amg.manus.space`.

## 📝 Poznámky pro Claude Code

Zbývající úkoly jsou v `todo.md`. Priorita:
1. **Notifikace v reálném čase** — nejjednoduší a nejhodnotnější
2. **A/B testování emailů** — vyžaduje UI a backend
3. **Exportní report** — relativně jednoduchý

Všechny AI prompty jsou v `server/routers.ts` a lze je snadno upravovat. Databázové schéma je v `drizzle/schema.ts`.

---

**Vytvořeno**: Manus AI Agent | **Poslední update**: 2026-06-12
