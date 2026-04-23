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
      const prompt = `You are an expert lead researcher for a marketing agency. Generate a list of ${input.count} real or realistic ${input.niche} brands that are active on ${input.platform}.${input.additionalCriteria ? ` Additional criteria: ${input.additionalCriteria}.` : ""}

Return ONLY a valid JSON object with this exact structure:
{
  "leads": [
    {
      "company": "Brand Name",
      "website": "https://example.com",
      "instagram": "@handle",
      "facebook": "page-name",
      "twitter": "@handle",
      "recentTopics": "Brief description of their recent content themes and campaigns"
    }
  ]
}

Make each lead realistic and specific. The recentTopics should be 1-2 sentences describing what they've been posting about recently.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a precise lead generation assistant. Always return valid JSON only, no markdown, no explanation." },
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
        `${i + 1}. ${l.company} | Website: ${l.website} | Recent topics: ${l.recentTopics}`
      ).join("\n");

      const prompt = `You are an expert sales copywriter for a marketing agency. Write highly personalized outreach emails for each of the following brands.

Sender: ${input.senderName ?? "Alex"} — ${input.senderRole ?? "Marketing Strategist"}
Pitch goal: ${input.pitch ?? "Schedule a 15-minute discovery call to discuss how we can help grow their brand"}

Leads:
${leadsText}

For each lead, write a personalized email that:
- References their specific recent content/campaigns naturally
- Has a compelling, specific subject line
- Keeps the body concise (3-4 short paragraphs max)
- Ends with a clear, low-friction CTA
- Feels human and genuine, not templated

Return ONLY valid JSON:
{
  "emails": [
    {
      "company": "Brand Name",
      "subject": "Subject line here",
      "body": "Full email body here"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a world-class sales copywriter. Return valid JSON only." },
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
      const prompt = `You are a senior brand strategist and market researcher. Conduct a comprehensive analysis of ${input.companyName}${input.companyUrl ? ` (${input.companyUrl})` : ""}.${input.focus ? ` Focus area: ${input.focus}.` : ""}

Write a detailed, professional brand analysis report in Markdown format covering:

# Brand Analysis: ${input.companyName}

## Executive Summary
(2-3 sentence overview of the brand's positioning and market presence)

## Online Presence Overview
(Website quality, UX, content strategy, SEO signals)

## Social Media Performance
(Platform presence, posting frequency, content types, engagement patterns)

## Content Strategy & Messaging
(Core messages, tone of voice, storytelling approach, recurring themes)

## Audience & Community
(Target demographic, community engagement, user-generated content)

## Campaign Highlights
(Notable recent campaigns, what worked and why)

## Brand Strengths
(3-5 key competitive advantages)

## Growth Opportunities
(3-5 specific, actionable opportunities for improvement)

## Strategic Recommendations
(3-5 concrete recommendations for a marketing agency to pitch)

Be specific, insightful, and data-driven in your analysis. Reference realistic metrics and observations.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a world-class brand strategist. Write comprehensive, insightful analysis reports in Markdown." },
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

      const prompt = `You are a professional presentation designer. Create a beautiful, multi-slide HTML presentation for ${input.companyName} based on this brand analysis report.

Brand colors: Primary: ${primary}, Secondary: ${secondary}
Font: ${font}

Report content:
${input.reportContent.substring(0, 3000)}

Create a complete, self-contained HTML presentation with 6-8 slides. Each slide should be a full-page div. Use the brand colors throughout. Make it visually stunning and professional.

Requirements:
- Use inline CSS only (no external stylesheets)
- Each slide: <div class="slide" id="slide-N">
- Include a navigation bar at the bottom
- Slide types: Title, Executive Summary, Online Presence, Content Strategy, Strengths, Opportunities, Recommendations, Contact CTA
- Use the primary color (${primary}) for headings and accents
- Dark background (${secondary}) for the title slide
- Clean white/light background for content slides
- Professional typography using ${font} from Google Fonts
- Include slide numbers
- Make it print-friendly

Return ONLY the complete HTML document, nothing else.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert HTML/CSS presentation designer. Return only complete, valid HTML." },
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
      const prompt = `Based on your knowledge of ${input.companyName}${input.companyUrl ? ` (${input.companyUrl})` : ""}, provide their likely brand colors and typography.

Return ONLY valid JSON:
{
  "primaryColor": "#hexcode",
  "secondaryColor": "#hexcode",
  "accentColor": "#hexcode",
  "fontFamily": "Font Name",
  "confidence": "high|medium|low",
  "notes": "Brief note about the brand's visual identity"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a brand identity expert. Return valid JSON only." },
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
      const systemPrompt = `You are Aria, a friendly and highly knowledgeable AI assistant for the Agency AI platform — a 5-step business automation framework for modern agencies.

You help users navigate and get the most out of the platform. Here is what each module does:

1. ATTRACT — AI-powered lead generation. Users input a niche, platform, and count to generate structured lead lists (company, website, social handles, recent topics). Leads can be exported as CSV.

2. CONVERT — Personalized outreach email generator. Takes a saved lead list and generates individual email drafts (subject + body) referencing each brand's recent activity. Includes email open tracking and click tracking.

3. DELIVER — Two-part module:
   a) Brand Research: AI analyzes a company and generates a detailed structured report (online presence, engagement, messaging effectiveness).
   b) Presentation: Converts the research report into a multi-slide branded presentation, extracting the brand's colors and typography automatically.

4. AUTOMATE — Coming soon. Will connect all modules into automated pipelines.

5. HUMAN ELEMENT — Philosophy page about the irreplaceable human qualities: Taste, Vision, and Care.

SAVED PROJECTS — Users can save and revisit all lead lists, campaigns, and research reports.

The user is currently on: ${input.currentPage ?? "the platform"}.

Be concise, helpful, and friendly. Use short paragraphs. Guide users step by step when they ask how to do something. If they ask about a feature not yet built, acknowledge it's coming soon. Always respond in the same language the user writes in.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({ messages });
      const content = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "I'm here to help! What would you like to know about the platform?";

      return { reply: content };
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
});

export type AppRouter = typeof appRouter;
