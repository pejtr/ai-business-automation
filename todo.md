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

### 1. AI-powered Pitch Scripts (Priority: HIGH)
- [ ] Implementovat tRPC proceduru `generatePitchScript` s LLM voláním
- [ ] Přijmout lead data (jméno, firma, odvětví, recent news)
- [ ] Generovat personalizované walk-in skript (3-5 vět)
- [ ] Generovat personalizované video demo skript (5-10 vět)
- [ ] Uložit vygenerované skripty do DB (pitch_scripts tabulka)
- [ ] Frontend UI pro zobrazení a kopírování skriptů
- [ ] Vitest tests pro pitch script router
- [ ] Integrovat do Convert modulu

### 2. Income Growth Visualization (Priority: HIGH)
- [ ] Přidat progress bar do Income Calculatoru
- [ ] Milestone track: 0 → 10k → 25k → 50k → 100k Kč/měsíc
- [ ] Motivační texty pro každý milestone
- [ ] Vizuální animace při dosažení milníku
- [ ] Uložit milestone progress do DB
- [ ] Vitest tests pro visualization

### 3. Niche-specific AI Prompts (Priority: HIGH)
- [ ] Rozšířit Attract generátor s niche context
- [ ] Při výběru niche šablony automaticky přizpůsobit AI prompt
- [ ] Přidat niche-specific keywords a tone guidance
- [ ] Příklady: Tech (technical jargon), Real Estate (location focus), Fitness (health benefits)
- [ ] Testovat relevanci generovaných leadů
- [ ] Vitest tests pro niche-specific prompts
- [ ] Dokumentace niche templates v README

### 4. Notifikace v reálném čase (Priority: HIGH)
- [ ] Push notifikace vlastníkovi při otevření emailu
- [ ] Push notifikace při kliknutí na odkaz
- [ ] Email notifikace s denním shrnutím
- [ ] In-app notification center
- [ ] Vitest tests pro notification router

### 5. A/B testování emailů (Priority: HIGH)
- [ ] Generovat 2 varianty subject line (LLM)
- [ ] Generovat 2 varianty body copy (formální vs neformální)
- [ ] Sledovat open/click rate pro obě varianty
- [ ] Dashboard s A/B test výsledky
- [ ] Doporučit vítěznou variantu
- [ ] Vitest tests pro A/B router

### 6. Exportní report sledování (Priority: MEDIUM)
- [ ] Export tracking statistik jako CSV
- [ ] Export jako PDF s grafy (Chart.js)
- [ ] Vizualizace open rate a click rate
- [ ] Top performing leads ranking
- [ ] Exportní report pro klienty
- [ ] Vitest tests pro report router

### 7. Vlastní profil agentury (Priority: MEDIUM)
- [ ] Stránka Settings s názvem, logem, kontaktem
- [ ] Automatické doplnění do emailů a prezentací
- [ ] Branding odesílatele (podpis, barvy)
- [ ] DB schema pro agency profile
- [ ] Vitest tests

### 8. Šablony emailů (Priority: MEDIUM)
- [ ] Knihovna šablon tónu (formální, neformální, agresivní)
- [ ] Uložení vlastních šablon do DB
- [ ] Výběr šablony před generováním
- [ ] Přizpůsobení AI promptu
- [ ] Vitest tests

### 9. Dashboard statistiky (Priority: LOW)
- [ ] Live metriky (celkový počet leadů, avg open rate, počet reportů)
- [ ] Neonové stat karty na Home
- [ ] Trend grafy (weekly/monthly)
- [ ] Top performing niches
- [ ] Vitest tests

### 10. Integrace s externími nástroji (Priority: LOW)
- [ ] Slack notifikace
- [ ] Google Sheets export
- [ ] Zapier/Make.com webhook
- [ ] CRM sync (HubSpot, Pipedrive)

### 11. Pokročilá personalizace (Priority: LOW)
- [ ] Dynamický obsah v emailech (jméno, firma, recent news)
- [ ] Personalizované video demo skript
- [ ] Sentiment analysis pro optimalizaci tónu
- [ ] Lead scoring na základě profilu

### 12. Vícejazyčnost (Priority: LOW)
- [ ] Přepínač jazyka (EN/CS)
- [ ] Překlad onboarding textu
- [ ] Překlad AI promptů
- [ ] Lokalizace měny a formátů

### 13. Pokročilé analytiky (Priority: LOW)
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
