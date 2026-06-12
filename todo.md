# AI Business Automation Platform — TODO

## ✅ Hotovo (Completed)

### Core Features
- [x] Attract Module — AI generování leadů, export CSV
- [x] Convert Module — Personalizované emaily, email tracking, pitch skript generátor
- [x] Deliver Module — Brand research report, multi-slide prezentace, sdílitelné linky
- [x] Saved Projects — Historie leadů, kampaní, reportů
- [x] Niche Templates — 7 předpřipravených odvětví
- [x] Income Calculator — Interaktivní widget pro výpočet příjmu
- [x] AI Asistentka Aria — Plovoucí chat widget na všech stránkách
- [x] Interactive Onboarding — 8-krokový průvodce pro nové uživatele
- [x] Neon Glow Design — Moderní tmavý design s neon efekty
- [x] Čeština — Celá platforma v češtině
- [x] Email Tracking — Open/click tracking s pixel a redirect
- [x] AI Pitch Scripts — LLM generování walk-in a video skriptů
- [x] Agency AI Presentation — 14-slide neon glow prezentace (Attract, Convert, Deliver, Aria, Tech Stack, Roadmap, CTA)

### Technical
- [x] Database schema (Drizzle ORM)
- [x] tRPC routers (attract, convert, deliver, tracking, niche, income, assistant)
- [x] Vitest tests (35 passing)
- [x] TypeScript (0 errors)
- [x] GitHub integration ready

---

## 📋 TODO — Budoucí funkce

### 1. Notifikace v reálném čase (Priority: HIGH)
- [ ] Push notifikace vlastníkovi při otevření emailu
- [ ] Push notifikace při kliknutí na odkaz
- [ ] Email notifikace s denním shrnutím
- [ ] In-app notification center
- [ ] Vitest tests pro notification router

### 2. A/B testování emailů (Priority: HIGH)
- [ ] Generovat 2 varianty subject line (LLM)
- [ ] Generovat 2 varianty body copy (formální vs neformální)
- [ ] Sledovat open/click rate pro obě varianty
- [ ] Dashboard s A/B test výsledky
- [ ] Doporučit vítěznou variantu
- [ ] Vitest tests pro A/B router

### 3. Exportní report sledování (Priority: MEDIUM)
- [ ] Export tracking statistik jako CSV
- [ ] Export jako PDF s grafy (Chart.js)
- [ ] Vizualizace open rate a click rate
- [ ] Top performing leads ranking
- [ ] Exportní report pro klienty
- [ ] Vitest tests pro report router

### 4. Vlastní profil agentury (Priority: MEDIUM)
- [ ] Stránka Settings s názvem, logem, kontaktem
- [ ] Automatické doplnění do emailů a prezentací
- [ ] Branding odesílatele (podpis, barvy)
- [ ] DB schema pro agency profile
- [ ] Vitest tests

### 5. Šablony emailů (Priority: MEDIUM)
- [ ] Knihovna šablon tónu (formální, neformální, agresivní)
- [ ] Uložení vlastních šablon do DB
- [ ] Výběr šablony před generováním
- [ ] Přizpůsobení AI promptu
- [ ] Vitest tests

### 6. Dashboard statistiky (Priority: LOW)
- [ ] Live metriky (celkový počet leadů, avg open rate, počet reportů)
- [ ] Neonové stat karty na Home
- [ ] Trend grafy (weekly/monthly)
- [ ] Top performing niches
- [ ] Vitest tests

### 7. Integrace s externími nástroji (Priority: LOW)
- [ ] Slack notifikace
- [ ] Google Sheets export
- [ ] Zapier/Make.com webhook
- [ ] CRM sync (HubSpot, Pipedrive)

### 8. Pokročilá personalizace (Priority: LOW)
- [ ] Dynamický obsah v emailech (jméno, firma, recent news)
- [ ] Personalizované video demo skript
- [ ] Sentiment analysis pro optimalizaci tónu
- [ ] Lead scoring na základě profilu

### 9. Vícejazyčnost (Priority: LOW)
- [ ] Přepínač jazyka (EN/CS)
- [ ] Překlad onboarding textu
- [ ] Překlad AI promptů
- [ ] Lokalizace měny a formátů

### 10. Pokročilé analytiky (Priority: LOW)
- [ ] Funnel analysis (leads → emails → opens → clicks)
- [ ] Cohort analysis (skupiny dle niche)
- [ ] Predictive analytics (scoring)
- [ ] Custom report builder

---

## 🔄 Workflow pro Claude Code

1. Vyberte úkol z TODO (doporučujeme Priority: HIGH)
2. Implementujte backend (tRPC router + DB query helpers)
3. Implementujte frontend UI
4. Napište Vitest testy
5. Pushněte na GitHub
6. Vytvořte checkpoint v Manus UI

---

## 📝 Poznámky

- Všechny AI prompty jsou v `server/routers.ts`
- Database schema je v `drizzle/schema.ts`
- Design system je v `client/src/index.css` (neon glow variables)
- Onboarding data je v `client/src/contexts/OnboardingContext.tsx`
- Niche templates jsou v databázi (7 seed records)

---

**Poslední update**: 2026-06-12 | **Status**: Production-ready s budoucími funkcemi

## 🎬 Prezentace
- [x] 14-slide Agency AI Presentation — Neon glow design, česká lokalizace
- [x] SEO fixes na Home stránce — Meta keywords, H2 heading, description
- [x] VIDEO_SCRIPT.md — Scénář pro video prezentaci
- [x] PRESENTATION_CONTENT.md — Obsah pro slide generátor
