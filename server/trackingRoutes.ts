import { Router } from "express";
import {
  getTrackedEmailsByToken,
  createTrackingEvent,
} from "./db";

// 1×1 transparent GIF pixel (35 bytes)
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export function registerTrackingRoutes(app: Router) {
  // ── Open tracking pixel ────────────────────────────────────────────────────
  // Called when an email client loads the tracking pixel image
  app.get("/api/track/open/:token", async (req, res) => {
    const { token } = req.params;

    try {
      const tracked = await getTrackedEmailsByToken(token);
      if (tracked) {
        // Record the open event (fire-and-forget, don't block pixel response)
        createTrackingEvent({
          trackingToken: token,
          campaignId: tracked.campaignId,
          userId: tracked.userId,
          emailIndex: tracked.emailIndex,
          company: tracked.company,
          eventType: "open",
          ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null,
          userAgent: req.headers["user-agent"] ?? null,
        }).catch(err => console.error("[Tracking] Failed to record open:", err));
      }
    } catch (err) {
      console.error("[Tracking] Open pixel error:", err);
    }

    // Always return the pixel regardless of DB errors
    res.set({
      "Content-Type": "image/gif",
      "Content-Length": TRACKING_PIXEL.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.end(TRACKING_PIXEL);
  });

  // ── Click tracking redirect ────────────────────────────────────────────────
  // Called when a recipient clicks a tracked link in the email
  app.get("/api/track/click/:token", async (req, res) => {
    const { token } = req.params;
    const destinationUrl = req.query.url as string;

    if (!destinationUrl) {
      res.status(400).send("Missing url parameter");
      return;
    }

    try {
      const tracked = await getTrackedEmailsByToken(token);
      if (tracked) {
        createTrackingEvent({
          trackingToken: token,
          campaignId: tracked.campaignId,
          userId: tracked.userId,
          emailIndex: tracked.emailIndex,
          company: tracked.company,
          eventType: "click",
          linkUrl: destinationUrl,
          ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null,
          userAgent: req.headers["user-agent"] ?? null,
        }).catch(err => console.error("[Tracking] Failed to record click:", err));
      }
    } catch (err) {
      console.error("[Tracking] Click redirect error:", err);
    }

    // Redirect to the original destination
    res.redirect(302, destinationUrl);
  });
}
