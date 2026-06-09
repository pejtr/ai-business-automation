import { z } from "zod";
import { nanoid } from "nanoid";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  createLeadList,
  getLeadListsByUser,
  getLeadListById,
  deleteLeadList,
  createOutreachCampaign,
  getOutreachCampaignsByUser,
  getOutreachCampaignById,
  deleteOutreachCampaign,
  createResearchReport,
  getResearchReportsByUser,
  getResearchReportById,
  getResearchReportByShareToken,
  updateResearchReport,
  deleteResearchReport,
  createTrackedEmail,
  getTrackedEmailsByCampaign,
  getTrackingStatsByCampaign,
  getTrackingEventsByCampaign,
  getAllNicheTemplates,
  getNicheTemplateBySlug,
  getOrCreateIncomeCalculator,
  updateIncomeCalculator,
} from "./db";

// ── Shared Types ──────────────────────────────────────────────────────────

const LeadSchema = z.object({
  company: z.string(),
  website: z.string(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  recentTopics: z.string(),
});

const OutreachEmailSchema = z.object({
  company: z.string(),
  subject: z.string(),
  body: z.string(),
});

// ── Attract Router ────────────────────────────────────────────────────────

const attractRouter = router({
  generate: protectedProcedure
    .input(z.object({
      niche: z.string().min(2),
      platform: z.string().min(2),
      count: z.number().int().min(1).max(50).default(10),
      additionalCriteria: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Jsi expert na vyhledávání leadů pro marketingovou agenturu. Vygeneruj seznam ${input.count} reálných nebo realistických značek z oblasti ${input.niche}, které jsou aktivní na platformě ${input.platform}.${input.additionalCriteria ? ` Další kritéria: ${input.additionalCriteria}.` : ""}

Vrať POUZE platný JSON objekt s touto přesnou strukturou:
{
  "leads": [
    {
      "company": "Název značky",
      "website": "https://example.com",
      "instagram": "@handle",
      "facebook": "page-name",
      "twitter": "@handle",
      "recentTopics": "Stručný popis jejich nedávných témat a kampaní"
    }
  ]
}

Každý lead udělej realistický a konkrétní. Pole recentTopics by mělo obsahovat 1-2 věty popisující, o čem nedávno přispívali.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Jsi přesný asistent pro generování leadů. Vždy vrácí pouze platný JSON, bez markdownu, bez vysvětlení." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lead_list",
            strict: true,
            schema: {
              type: "object",
              properties: {
                leads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company: { type: "string" },
                      website: { type: "string" },
                      instagram: { type: "string" },
                      facebook: { type: "string" },
                      twitter: { type: "string" },
                      recentTopics: { type: "string" },
                    },
                    required: ["company", "website", "instagram", "facebook", "twitter", "recentTopics"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["leads"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : "{}";
      const parsed = JSON.parse(content) as { leads: z.infer<typeof LeadSchema>[] };
      return parsed;
    }),

  save: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      niche: z.string(),
      platform: z.string(),
      count: z.number().int(),
      leads: z.array(LeadSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      await createLeadList({
        userId: ctx.user.id,
        title: input.title,
        niche: input.niche,
        platform: input.platform,
        count: input.count,
        leads: input.leads,
      });
      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return getLeadListsByUser(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const list = await getLeadListById(input.id);
      if (!list || list.userId !== ctx.user.id) return null;
      return list;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const list = await getLeadListById(input.id);
      if (!list || list.userId !== ctx.user.id) throw new Error("Not found");
      await deleteLeadList(input.id);
      return { success: true };
    }),
});

// ── Convert Router ────────────────────────────────────────────────────────

const convertRouter = router({
  generate: protectedProcedure
    .input(z.object({
      leads: z.array(LeadSchema),
      senderName: z.string().optional(),
      senderRole: z.string().optional(),
      pitch: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const leadsText = input.leads.map((l, i) =>
        `${i + 1}. ${l.company} | Web: ${l.website} | Nedávná témata: ${l.recentTopics}`
      ).join("\n");

      const prompt = `Jsi expert na prodejní copywriting pro marketingovou agenturu. Napiš vysoce personalizované outreach emaily pro každou z následujících značek.

Odesílatel: ${input.senderName ?? "Alex"} — ${input.senderRole ?? "Marketingový stratég"}
Cíl pitche: ${input.pitch ?? "Domluvit 15minutový discovery call o tom, jak můžeme pomoci růstu jejich značky"}

Leady:
${leadsText}

Pro každý lead napiš personalizovaný email, který:
- Přirozeně odkazuje na jejich konkrétní nedávný obsah/kampaně
- Má přesvědčivý, konkrétní předmět
- Je stručný (max. 3-4 krátké odstavce)
- Končí jasnou, nízko-frikční výzvou k akci
- Působí lidsky a autenticky, ne jako šablona

Vrať POUZE platný JSON:
{
  "emails": [
    {
      "company": "Název značky",
      "subject": "Předmět emailu",
      "body": "Celé tělo emailu"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Jsi světová třída prodejní copywriter. Vrácí pouze platný JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "outreach_emails",
            strict: true,
            schema: {
              type: "object",
              properties: {
                emails: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company: { type: "string" },
                      subject: { type: "string" },
                      body: { type: "string" },
                    },
                    required: ["company", "subject", "body"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["emails"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : "{}";
      const parsed = JSON.parse(content) as { emails: z.infer<typeof OutreachEmailSchema>[] };
      return parsed;
    }),

  save: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      leadListId: z.number().int().optional(),
      emails: z.array(OutreachEmailSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await createOutreachCampaign({
        userId: ctx.user.id,
        title: input.title,
        leadListId: input.leadListId,
        emails: input.emails,
      });
      const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId ?? null;
      return { success: true, id: insertId };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return getOutreachCampaignsByUser(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const campaign = await getOutreachCampaignById(input.id);
      if (!campaign || campaign.userId !== ctx.user.id) return null;
      return campaign;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getOutreachCampaignById(input.id);
      if (!campaign || campaign.userId !== ctx.user.id) throw new Error("Not found");
      await deleteOutreachCampaign(input.id);
      return { success: true };
    }),
});

// ── Deliver Router ────────────────────────────────────────────────────────

const deliverRouter = router({
  generateResearch: protectedProcedure
    .input(z.object({
      companyName: z.string().min(1),
      companyUrl: z.string().optional(),
      focus: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Jsi senior brand stratég a marketingový výzkumník. Proveď komplexní analýzu společnosti ${input.companyName}${input.companyUrl ? ` (${input.companyUrl})` : ""}.${input.focus ? ` Oblast zaměření: ${input.focus}.` : ""}

Napiš podrobný, profesionální report analýzy značky ve formátu Markdown pokrývající:

# Analýza značky: ${input.companyName}

## Shrnutí
(2-3 věty o pozici značky a přítomnosti na trhu)

## Přehled online přítomnosti
(Kvalita webu, UX, obsahová strategie, SEO signály)

## Výkon na sociálních sítích
(Přítomnost na platformách, frekvence příspěvků, typy obsahu, vzorce zapojení)

## Obsahová strategie a messaging
(Klíčové zprávy, tone of voice, vyprávěčský přístup, opakující se témata)

## Publikum a komunita
(Cílová demografika, zapojení komunity, uživatelsky generovaný obsah)

## Highlight kampaní
(Pozoruhodné nedávné kampaně, co fungovalo a proč)

## Silné stránky značky
(3-5 klíčových konkurenčních výhod)

## Příležitosti růstu
(3-5 konkrétních, akcionálních příležitostí ke zlepšení)

## Strategická doporučení
(3-5 konkrétních doporučení pro marketingovou agenturu k nabídce)

Buď konkrétní, pronikavý a datově podložený ve své analýze. Odkazuj na realistické metriky a pozorování.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Jsi světová třída brand stratég. Piš komplexní, pronikavé analýzy značek v Markdownu." },
          { role: "user", content: prompt },
        ],
      });

      const rawReport = response.choices[0]?.message?.content;
      const reportContent = typeof rawReport === "string" ? rawReport : "";
      return { reportContent };
    }),

  generatePresentation: protectedProcedure
    .input(z.object({
      reportId: z.number().int(),
      companyName: z.string(),
      reportContent: z.string(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      fontFamily: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const primary = input.primaryColor ?? "#C9A84C";
      const secondary = input.secondaryColor ?? "#1a1a2e";
      const font = input.fontFamily ?? "Inter";

      const prompt = `Jsi profesionální návrhář prezentací. Vytvoř krásnou, víceSnímkovou HTML prezentaci pro ${input.companyName} na základě tohoto reportu analýzy značky.

Barvy značky: Primární: ${primary}, Sekundární: ${secondary}
Písmo: ${font}

Obsah reportu:
${input.reportContent.substring(0, 3000)}

Vytvoř kompletní, samostatnou HTML prezentaci s 6-8 snímky. Každý snímek by měl být div na celou stránku. Použij barvy značky v celé prezentaci. Udělej ji vizuálně ohromující a profesionální.

Požadavky:
- Použij pouze inline CSS (bez externích stylů)
- Každý snímek: <div class="slide" id="slide-N">
- Zahrn navigaci na spodní části
- Typy snímků: Titulní, Shrnutí, Online přítomnost, Obsahová strategie, Silné stránky, Příležitosti, Doporučení, Kontaktní CTA
- Použij primární barvu (${primary}) pro nadpisy a akcenty
- Tmavé pozadí (${secondary}) pro titulní snímek
- Čisté bílé/světlé pozadí pro obsahové snímky
- Profesionální typografie s použitím ${font} z Google Fonts
- Zahrn čísla snímků
- Udělej ji vhodnou pro tisk

Vrať POUZE kompletní HTML dokument, nic jiného.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Jsi expert na návrh HTML/CSS prezentací. Vrať pouze kompletní, platné HTML." },
          { role: "user", content: prompt },
        ],
      });

      const rawHtml = response.choices[0]?.message?.content;
      const presentationHtml = typeof rawHtml === "string" ? rawHtml : "";

      // Save to DB
      await updateResearchReport(input.reportId, { presentationHtml });

      return { presentationHtml };
    }),

  extractBrandColors: protectedProcedure
    .input(z.object({
      companyName: z.string(),
      companyUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Na základě svých znalostí o ${input.companyName}${input.companyUrl ? ` (${input.companyUrl})` : ""}, urči pravděpodobné barvy značky a typografii.

Vrať POUZE platný JSON:
{
  "primaryColor": "#hexcode",
  "secondaryColor": "#hexcode",
  "accentColor": "#hexcode",
  "fontFamily": "Název písma",
  "confidence": "high|medium|low",
  "notes": "Stručná poznámka o vizuální identitě značky"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Jsi expert na brand identitu. Vrať pouze platný JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "brand_colors",
            strict: true,
            schema: {
              type: "object",
              properties: {
                primaryColor: { type: "string" },
                secondaryColor: { type: "string" },
                accentColor: { type: "string" },
                fontFamily: { type: "string" },
                confidence: { type: "string" },
                notes: { type: "string" },
              },
              required: ["primaryColor", "secondaryColor", "accentColor", "fontFamily", "confidence", "notes"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawBrand = response.choices[0]?.message?.content;
      const content = typeof rawBrand === "string" ? rawBrand : "{}";
      return JSON.parse(content) as {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
        confidence: string;
        notes: string;
      };
    }),

  saveReport: protectedProcedure
    .input(z.object({
      companyName: z.string(),
      companyUrl: z.string().optional(),
      reportContent: z.string(),
      presentationHtml: z.string().optional(),
      brandColors: z.array(z.string()).optional(),
      brandFonts: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const shareToken = nanoid(16);
      const reportId = await createResearchReport({
        userId: ctx.user.id,
        companyName: input.companyName,
        companyUrl: input.companyUrl,
        reportContent: input.reportContent,
        presentationHtml: input.presentationHtml,
        brandColors: input.brandColors ?? [],
        brandFonts: input.brandFonts ?? [],
        shareToken,
      });
      return { success: true, shareToken, id: reportId };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return getResearchReportsByUser(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const report = await getResearchReportById(input.id);
      if (!report || report.userId !== ctx.user.id) return null;
      return report;
    }),

  getByShareToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      return getResearchReportByShareToken(input.token);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const report = await getResearchReportById(input.id);
      if (!report || report.userId !== ctx.user.id) throw new Error("Not found");
      await deleteResearchReport(input.id);
      return { success: true };
    }),
});

// ── Tracking Router ────────────────────────────────────────────────────────

const trackingRouter = router({
  // Generate tracked versions of emails (with pixel + wrapped links) and store them
  createTracked: protectedProcedure
    .input(z.object({
      campaignId: z.number().int(),
      emails: z.array(z.object({
        company: z.string(),
        subject: z.string(),
        body: z.string(),
      })),
      baseUrl: z.string().url(), // frontend origin for building tracking URLs
    }))
    .mutation(async ({ ctx, input }) => {
      const results: Array<{
        emailIndex: number;
        company: string;
        trackingToken: string;
        subject: string;
        bodyHtml: string;
        bodyText: string;
      }> = [];

      for (let i = 0; i < input.emails.length; i++) {
        const email = input.emails[i]!;
        const token = nanoid(24);
        const pixelUrl = `${input.baseUrl}/api/track/open/${token}`;

        // Wrap any URLs in the body with click-tracking redirects
        const trackedBody = email.body.replace(
          /(https?:\/\/[^\s<>"']+)/g,
          (url) => {
            const encoded = encodeURIComponent(url);
            return `${input.baseUrl}/api/track/click/${token}?url=${encoded}`;
          }
        );

        // Build HTML version with tracking pixel
        const bodyHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
${trackedBody
  .split("\n\n")
  .map(p => p.trim() ? `<p>${p.replace(/\n/g, "<br>")}</p>` : "")
  .join("\n")}
<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;">
</body>
</html>`;

        await createTrackedEmail({
          campaignId: input.campaignId,
          userId: ctx.user.id,
          emailIndex: i,
          company: email.company,
          trackingToken: token,
          subject: email.subject,
          bodyHtml,
          bodyText: trackedBody,
        });

        results.push({
          emailIndex: i,
          company: email.company,
          trackingToken: token,
          subject: email.subject,
          bodyHtml,
          bodyText: trackedBody,
        });
      }

      return { success: true, tracked: results };
    }),

  // Get tracked emails for a campaign
  getTracked: protectedProcedure
    .input(z.object({ campaignId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const campaign = await getOutreachCampaignById(input.campaignId);
      if (!campaign || campaign.userId !== ctx.user.id) return [];
      return getTrackedEmailsByCampaign(input.campaignId);
    }),

  // Get per-email open/click stats for a campaign
  getStats: protectedProcedure
    .input(z.object({ campaignId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const campaign = await getOutreachCampaignById(input.campaignId);
      if (!campaign || campaign.userId !== ctx.user.id) return [];
      return getTrackingStatsByCampaign(input.campaignId);
    }),

  // Get raw event log for a campaign
  getEvents: protectedProcedure
    .input(z.object({ campaignId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const campaign = await getOutreachCampaignById(input.campaignId);
      if (!campaign || campaign.userId !== ctx.user.id) return [];
      return getTrackingEventsByCampaign(input.campaignId);
    }),
});

// ── Assistant Router ──────────────────────────────────────────────────────

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const assistantRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(2000),
      history: z.array(MessageSchema).max(20).default([]),
      currentPage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `Jsi Aria, přátelská a vysoce znalostní AI asistentka platformy Agency AI — 5-krokového frameworku pro automatizaci obchodních procesů moderních agentur.

Pomáháš uživatelům navigovat a vytěžit maximum z platformy. Zde je popis každého modulu:

1. ATTRACT — AI generování leadů. Uživatel zadá niši, platformu a počet a vygeneruje strukturované seznamy leadů (společnost, web, sociální sítě, nedávná témata). Leady lze exportovat jako CSV.

2. CONVERT — Generátor personalizovaných outreach emailů. Vezme uložený seznam leadů a vygeneruje individuální koncepty emailů (předmět + tělo) odkazující na nedávnou aktivitu každé značky. Zahrnuje sledování otevření emailů a kliknutí na odkazy.

3. DELIVER — Dvoudílný modul:
   a) Výzkum značky: AI analyzuje společnost a generuje podrobný strukturovaný report (online přítomnost, zapojení, efektivita messagingu).
   b) Prezentace: Převádí výzkumný report na víceSnímkovou brandovanou prezentaci, automaticky extrahuje barvy a typografii značky.

4. AUTOMATE — Brzy k dispozici. Propojí všechny moduly do automatizovaných pipeline.

5. HUMAN ELEMENT — Filozofická stránka o nenahraditelných lidských kvalitách: Vkus, Vize a Péče.

ULOŽENÉ PROJEKTY — Uživatelé mohou ukládat a prohlížet všechny seznamy leadů, kampaně a výzkumné reporty.

Uživatel se aktuálně nachází na: ${input.currentPage ?? "platformě"}.

Buď stručná, nápomocná a přátelská. Používej krátké odstavce. Proveď uživatele krok za krokem, když se ptá jak něco udělat. Pokud se ptá na funkci, která ještě není hotová, potvrď, že brzy přijde. Vždy odpovídej v jazyce, ve kterém uživatel píše.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({ messages });
      const content = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "Jsem tu, abych pomohla! Na co se chcete zeptat ohledně platformy?";

      return { reply: content };
    }),
});

// ── Niche Router ──────────────────────────────────────────────────────────────

const nicheRouter = router({
  getAll: publicProcedure.query(async () => {
    return await getAllNicheTemplates();
  }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await getNicheTemplateBySlug(input.slug);
    }),
});

// ── Income Calculator Router ────────────────────────────────────────────────────

const incomeRouter = router({
  getOrCreate: protectedProcedure.query(async ({ ctx }) => {
    return await getOrCreateIncomeCalculator(ctx.user.id);
  }),
  update: protectedProcedure
    .input(z.object({
      clientCount: z.number().min(0),
      monthlyRetainerCzk: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateIncomeCalculator(ctx.user.id, input.clientCount, input.monthlyRetainerCzk);
    }),
});

// ── App Router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  attract: attractRouter,
  convert: convertRouter,
  deliver: deliverRouter,
  tracking: trackingRouter,
  assistant: assistantRouter,
  niche: nicheRouter,
  income: incomeRouter,
});

export type AppRouter = typeof appRouter;
