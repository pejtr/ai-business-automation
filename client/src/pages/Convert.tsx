import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail,
  Loader2,
  Save,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  RefreshCw,
  BarChart2,
  Eye,
  MousePointerClick,
  Activity,
  Zap,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  company: string;
  website: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  recentTopics: string;
}

interface OutreachEmail {
  company: string;
  subject: string;
  body: string;
}

interface TrackingStat {
  emailIndex: number;
  opens: number;
  clicks: number;
  lastOpenAt: Date | null;
  lastClickAt: Date | null;
}

type MainTab = "compose" | "tracking";

const stepColor = "oklch(0.65 0.12 200)";

export default function Convert() {
  const [activeTab, setActiveTab] = useState<MainTab>("compose");
  const [senderName, setSenderName] = useState("");
  const [senderRole, setSenderRole] = useState("");
  const [pitch, setPitch] = useState("");
  const [leadsJson, setLeadsJson] = useState("");
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedHtmlIndex, setCopiedHtmlIndex] = useState<number | null>(null);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savedCampaignId, setSavedCampaignId] = useState<number | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const savedLists = trpc.attract.list.useQuery();
  const utils = trpc.useUtils();

  const generate = trpc.convert.generate.useMutation({
    onSuccess: (data) => {
      setEmails(data.emails);
      setExpandedIndex(0);
      setSaveTitle(`Outreach Campaign — ${new Date().toLocaleDateString()}`);
      toast.success(`Generated ${data.emails.length} personalized emails`);
    },
    onError: (err) => toast.error(`Generation failed: ${err.message}`),
  });

  const save = trpc.convert.save.useMutation({
    onSuccess: (data) => {
      if (data.id != null) setSavedCampaignId(data.id);
      toast.success("Campaign saved to projects");
      setShowSaveForm(false);
    },
    onError: (err) => toast.error(`Save failed: ${err.message}`),
  });

  const createTracked = trpc.tracking.createTracked.useMutation({
    onSuccess: (data) => {
      setTrackingEnabled(true);
      toast.success(`Tracking enabled for ${data.tracked.length} emails`);
      utils.tracking.getTracked.invalidate();
      utils.tracking.getStats.invalidate();
    },
    onError: (err) => toast.error(`Tracking setup failed: ${err.message}`),
  });

  const trackedEmails = trpc.tracking.getTracked.useQuery(
    { campaignId: savedCampaignId ?? 0 },
    { enabled: savedCampaignId != null, refetchInterval: 30000 }
  );

  // Derive trackingEnabled from stored tracked emails (persists across page reloads)
  useEffect(() => {
    if (trackedEmails.data && trackedEmails.data.length > 0) setTrackingEnabled(true);
  }, [trackedEmails.data]);

  const trackingStats = trpc.tracking.getStats.useQuery(
    { campaignId: savedCampaignId ?? 0 },
    { enabled: savedCampaignId != null, refetchInterval: 30000 }
  );

  const trackingEvents = trpc.tracking.getEvents.useQuery(
    { campaignId: savedCampaignId ?? 0 },
    { enabled: savedCampaignId != null && activeTab === "tracking", refetchInterval: 15000 }
  );

  const parseLeads = useCallback((): Lead[] => {
    try {
      const parsed = JSON.parse(leadsJson);
      if (Array.isArray(parsed)) return parsed as Lead[];
      if (parsed.leads && Array.isArray(parsed.leads)) return parsed.leads as Lead[];
      return [];
    } catch {
      return [];
    }
  }, [leadsJson]);

  const loadFromSaved = (id: number) => {
    const list = savedLists.data?.find(l => l.id === id);
    if (!list) return;
    setLeadsJson(JSON.stringify(list.leads, null, 2));
    toast.success(`Loaded "${list.title}"`);
  };

  const handleGenerate = () => {
    const leads = parseLeads();
    if (!leads.length) { toast.error("Please provide a valid lead list (JSON format)"); return; }
    generate.mutate({ leads, senderName: senderName || undefined, senderRole: senderRole || undefined, pitch: pitch || undefined });
  };

  const handleSave = () => {
    if (!saveTitle.trim()) { toast.error("Please enter a title"); return; }
    save.mutate({ title: saveTitle, emails });
  };

  const handleEnableTracking = () => {
    if (!savedCampaignId) { toast.error("Save the campaign first to enable tracking"); return; }
    if (!emails.length) { toast.error("No emails to track"); return; }
    createTracked.mutate({
      campaignId: savedCampaignId,
      emails,
      baseUrl: window.location.origin,
    });
  };

  const copyEmail = async (email: OutreachEmail, index: number) => {
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Email copied to clipboard");
  };

  const copyTrackedHtml = async (index: number) => {
    const tracked = trackedEmails.data?.[index];
    if (!tracked) { toast.error("Tracked version not available"); return; }
    await navigator.clipboard.writeText(tracked.bodyHtml);
    setCopiedHtmlIndex(index);
    setTimeout(() => setCopiedHtmlIndex(null), 2000);
    toast.success("Tracked HTML email copied");
  };

  const exportAllEmails = () => {
    if (!emails.length) return;
    const text = emails.map(e => `=== ${e.company} ===\nSubject: ${e.subject}\n\n${e.body}\n\n`).join("---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-campaign-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Emails exported");
  };

  // Compute aggregate stats
  const stats = trackingStats.data as TrackingStat[] | undefined;
  const totalEmails = emails.length;
  const totalOpens = stats?.reduce((sum, s) => sum + s.opens, 0) ?? 0;
  const totalClicks = stats?.reduce((sum, s) => sum + s.clicks, 0) ?? 0;
  const uniqueOpened = stats?.filter(s => s.opens > 0).length ?? 0;
  const uniqueClicked = stats?.filter(s => s.clicks > 0).length ?? 0;
  const openRate = totalEmails > 0 ? Math.round((uniqueOpened / totalEmails) * 100) : 0;
  const clickRate = totalEmails > 0 ? Math.round((uniqueClicked / totalEmails) * 100) : 0;

  const getStatForEmail = (index: number): TrackingStat | undefined =>
    stats?.find(s => s.emailIndex === index);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
          <span>Framework</span>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: stepColor }}>Convert</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.65 0.12 200 / 0.1)", border: "1px solid oklch(0.65 0.12 200 / 0.2)" }}>
                <Mail className="w-4 h-4" style={{ color: stepColor }} />
              </div>
              <h1 className="text-3xl font-serif text-foreground">Convert</h1>
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full border" style={{ color: stepColor, background: "oklch(0.65 0.12 200 / 0.1)", borderColor: "oklch(0.65 0.12 200 / 0.2)" }}>
                STEP 02
              </span>
            </div>
            <p className="text-muted-foreground text-sm ml-12">
              Generate personalized outreach emails and track opens &amp; clicks in real time.
            </p>
          </div>
          {emails.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportAllEmails} className="border-border text-foreground hover:bg-white/5 gap-2">
                Export All
              </Button>
              <Button size="sm" onClick={() => setShowSaveForm(!showSaveForm)} className="gap-2" style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}>
                <Save className="w-3.5 h-3.5" />
                Save Campaign
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 ml-12">
          {([
            { id: "compose" as MainTab, label: "Compose", icon: Mail },
            { id: "tracking" as MainTab, label: "Tracking", icon: BarChart2, badge: savedCampaignId ? (totalOpens + totalClicks) : null },
          ]).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={activeTab === tab.id ? { background: "oklch(0.65 0.12 200 / 0.12)", color: stepColor } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl">
        {/* ── COMPOSE TAB ─────────────────────────────────────────────────── */}
        {activeTab === "compose" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Config panel */}
            <div className="lg:col-span-1 space-y-4">
              <div data-onboarding="convert-form" className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono" style={{ background: "oklch(0.65 0.12 200 / 0.15)", color: stepColor }}>1</span>
                  Sender Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Your Name</Label>
                    <Input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g. Alex Johnson" className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Your Role</Label>
                    <Input value={senderRole} onChange={e => setSenderRole(e.target.value)} placeholder="e.g. Marketing Strategist" className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Pitch Goal</Label>
                    <Textarea value={pitch} onChange={e => setPitch(e.target.value)} placeholder="e.g. Book a 15-minute discovery call" className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 resize-none text-sm" rows={2} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono" style={{ background: "oklch(0.65 0.12 200 / 0.15)", color: stepColor }}>2</span>
                  Lead List
                </h2>
                {savedLists.data && savedLists.data.length > 0 && (
                  <div className="mb-3">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Load Saved List</Label>
                    <select onChange={e => e.target.value && loadFromSaved(Number(e.target.value))} className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Select a saved list...</option>
                      {savedLists.data.map(list => <option key={list.id} value={list.id}>{list.title}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Lead Data (JSON)</Label>
                  <Textarea value={leadsJson} onChange={e => setLeadsJson(e.target.value)} placeholder={`[\n  {\n    "company": "Brand Name",\n    "website": "https://...",\n    "recentTopics": "..."\n  }\n]`} className="bg-input border-border text-foreground placeholder:text-muted-foreground/30 resize-none text-xs font-mono" rows={8} />
                </div>
                <Button onClick={handleGenerate} disabled={generate.isPending || !leadsJson.trim()} className="w-full mt-4 gap-2" style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}>
                  {generate.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Writing emails...</> : <><Mail className="w-4 h-4" />Generate Outreach Emails</>}
                </Button>
              </div>

              {/* Tracking setup card */}
              {savedCampaignId && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-green-400" />
                    <h3 className="text-sm font-semibold text-foreground">Email Tracking</h3>
                    {trackingEnabled && (
                      <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">ACTIVE</span>
                    )}
                  </div>
                  {!trackingEnabled ? (
                    <>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Enable tracking to monitor email opens and link clicks. Each email gets a unique tracking pixel and wrapped links.
                      </p>
                      <Button
                        onClick={handleEnableTracking}
                        disabled={createTracked.isPending}
                        size="sm"
                        className="w-full gap-2 bg-green-600 hover:bg-green-500 text-white"
                      >
                        {createTracked.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Setting up...</> : <><Zap className="w-3.5 h-3.5" />Enable Tracking</>}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="w-3 h-3" />Opens</span>
                        <span className="font-mono text-foreground">{totalOpens} ({openRate}%)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" />Clicks</span>
                        <span className="font-mono text-foreground">{totalClicks} ({clickRate}%)</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("tracking")} className="w-full text-xs gap-1.5 mt-1" style={{ color: stepColor }}>
                        <BarChart2 className="w-3 h-3" />View Full Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email results */}
            <div className="lg:col-span-2">
              {emails.length === 0 && !generate.isPending ? (
                <div className="rounded-xl border border-dashed border-border bg-card/50 h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-3 px-8">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "oklch(0.65 0.12 200 / 0.1)", border: "1px solid oklch(0.65 0.12 200 / 0.2)" }}>
                      <Mail className="w-6 h-6" style={{ color: "oklch(0.65 0.12 200 / 0.6)" }} />
                    </div>
                    <p className="text-muted-foreground text-sm">Personalized emails will appear here</p>
                    <p className="text-muted-foreground/50 text-xs">Load a lead list and click Generate</p>
                  </div>
                </div>
              ) : generate.isPending ? (
                <div className="rounded-xl border border-border bg-card h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto" style={{ borderColor: "oklch(0.65 0.12 200 / 0.3)", borderTopColor: stepColor }} />
                    <div>
                      <p className="text-foreground text-sm font-medium">Crafting personalized emails...</p>
                      <p className="text-muted-foreground text-xs mt-1">AI is writing unique copy for each lead</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{emails.length} emails generated</p>
                    <Button variant="ghost" size="sm" onClick={handleGenerate} className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
                      <RefreshCw className="w-3 h-3" />Regenerate
                    </Button>
                  </div>

                  {emails.map((email, i) => {
                    const stat = getStatForEmail(i);
                    const tracked = trackedEmails.data?.[i];
                    return (
                      <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                        <button
                          onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-muted-foreground/50 w-6">{String(i + 1).padStart(2, "0")}</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{email.company}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{email.subject}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mr-2">
                            {stat && (
                              <div className="flex items-center gap-3 text-xs">
                                <span className={cn("flex items-center gap-1", stat.opens > 0 ? "text-green-400" : "text-muted-foreground/40")}>
                                  <Eye className="w-3 h-3" />{stat.opens}
                                </span>
                                <span className={cn("flex items-center gap-1", stat.clicks > 0 ? "text-blue-400" : "text-muted-foreground/40")}>
                                  <MousePointerClick className="w-3 h-3" />{stat.clicks}
                                </span>
                              </div>
                            )}
                            {trackingEnabled && !tracked && (
                              <span className="text-[10px] text-yellow-500/70 font-mono">pending</span>
                            )}
                            {tracked && (
                              <span className="text-[10px] text-green-500/70 font-mono flex items-center gap-1">
                                <Activity className="w-2.5 h-2.5" />tracked
                              </span>
                            )}
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedIndex === i ? "rotate-180" : "")} />
                        </button>

                        {expandedIndex === i && (
                          <div className="border-t border-border px-5 pb-5 pt-4">
                            <div className="mb-3 pb-3 border-b border-border/50">
                              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Subject Line</p>
                              <p className="text-sm font-medium text-foreground">{email.subject}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Email Body</p>
                              <div className="bg-background/50 rounded-lg p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
                                {email.body}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                              <Button size="sm" variant="outline" onClick={() => copyEmail(email, i)} className="border-border text-foreground hover:bg-white/5 gap-2 text-xs">
                                {copiedIndex === i ? <><Check className="w-3 h-3 text-green-400" />Copied!</> : <><Copy className="w-3 h-3" />Copy Plain Text</>}
                              </Button>
                              {tracked && (
                                <Button size="sm" variant="outline" onClick={() => copyTrackedHtml(i)} className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2 text-xs">
                                  {copiedHtmlIndex === i ? <><Check className="w-3 h-3" />Copied!</> : <><Activity className="w-3 h-3" />Copy Tracked HTML</>}
                                </Button>
                              )}
                              {stat && stat.opens > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                                  <Clock className="w-3 h-3" />
                                  Last opened {stat.lastOpenAt ? new Date(stat.lastOpenAt).toLocaleString() : "—"}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TRACKING TAB ────────────────────────────────────────────────── */}
        {activeTab === "tracking" && (
          <div className="space-y-6">
            {!savedCampaignId ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 flex flex-col items-center text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">No campaign selected</p>
                <p className="text-xs text-muted-foreground">Generate and save a campaign first, then enable tracking.</p>
                <Button size="sm" onClick={() => setActiveTab("compose")} className="mt-4 gap-2" style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}>
                  <Mail className="w-3.5 h-3.5" />Go to Compose
                </Button>
              </div>
            ) : !trackingEnabled ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 flex flex-col items-center text-center">
                <Activity className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Tracking not enabled</p>
                <p className="text-xs text-muted-foreground mb-4">Enable tracking from the Compose tab to start monitoring opens and clicks.</p>
                <Button size="sm" onClick={() => setActiveTab("compose")} className="gap-2" style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}>
                  <Zap className="w-3.5 h-3.5" />Enable Tracking
                </Button>
              </div>
            ) : (
              <>
                {/* Aggregate stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Emails Sent", value: totalEmails, icon: Mail, color: stepColor },
                    { label: "Unique Opens", value: `${uniqueOpened} (${openRate}%)`, icon: Eye, color: "oklch(0.7 0.15 145)" },
                    { label: "Unique Clicks", value: `${uniqueClicked} (${clickRate}%)`, icon: MousePointerClick, color: "oklch(0.65 0.15 260)" },
                    { label: "Total Events", value: totalOpens + totalClicks, icon: Activity, color: "oklch(0.7 0.1 50)" },
                  ].map(stat => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{stat.label}</p>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color.replace(")", " / 0.1)")}`, border: `1px solid ${stat.color.replace(")", " / 0.2)")}` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                          </div>
                        </div>
                        <p className="text-2xl font-serif text-foreground">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Per-email stats table */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Per-Email Performance</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { utils.tracking.getStats.invalidate(); utils.tracking.getEvents.invalidate(); }}
                      className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
                    >
                      <RefreshCw className="w-3 h-3" />Refresh
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-5 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider w-8">#</th>
                          <th className="text-left px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Company</th>
                          <th className="text-left px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Subject</th>
                          <th className="text-center px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Opens</th>
                          <th className="text-center px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Clicks</th>
                          <th className="text-left px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Last Activity</th>
                          <th className="text-center px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emails.map((email, i) => {
                          const stat = getStatForEmail(i);
                          const hasActivity = stat && (stat.opens > 0 || stat.clicks > 0);
                          const lastActivity = stat?.lastClickAt ?? stat?.lastOpenAt;
                          return (
                            <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3 text-muted-foreground/50 font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
                              <td className="px-3 py-3 font-medium text-foreground text-sm">{email.company}</td>
                              <td className="px-3 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{email.subject}</td>
                              <td className="px-3 py-3 text-center">
                                <span className={cn("inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full", stat?.opens ? "bg-green-500/15 text-green-400" : "text-muted-foreground/40")}>
                                  <Eye className="w-3 h-3" />{stat?.opens ?? 0}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={cn("inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full", stat?.clicks ? "bg-blue-500/15 text-blue-400" : "text-muted-foreground/40")}>
                                  <MousePointerClick className="w-3 h-3" />{stat?.clicks ?? 0}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-xs text-muted-foreground">
                                {lastActivity ? new Date(lastActivity).toLocaleString() : "—"}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border", hasActivity ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-secondary text-muted-foreground/50 border-border")}>
                                  {hasActivity ? "engaged" : "waiting"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Event log */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Live Event Log</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Auto-refreshes every 15 seconds</p>
                  </div>
                  {!trackingEvents.data?.length ? (
                    <div className="py-10 text-center">
                      <Activity className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No events yet. Events appear here as recipients open emails or click links.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                      {(trackingEvents.data as Array<{
                        id: number;
                        eventType: "open" | "click";
                        company: string;
                        linkUrl: string | null;
                        ip: string | null;
                        userAgent: string | null;
                        createdAt: Date;
                      }>).map(event => (
                        <div key={event.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02]">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", event.eventType === "open" ? "bg-green-500/10 border border-green-500/20" : "bg-blue-500/10 border border-blue-500/20")}>
                            {event.eventType === "open"
                              ? <Eye className="w-3.5 h-3.5 text-green-400" />
                              : <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{event.company}</span>
                              <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded-full", event.eventType === "open" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400")}>
                                {event.eventType}
                              </span>
                            </div>
                            {event.eventType === "click" && event.linkUrl && (
                              <a href={event.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 truncate max-w-xs">
                                {event.linkUrl.substring(0, 60)}...
                                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                              </a>
                            )}
                            {event.ip && <p className="text-[11px] text-muted-foreground/40 font-mono mt-0.5">{event.ip}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(event.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Save form */}
        {showSaveForm && emails.length > 0 && (
          <div className="mt-6 rounded-xl border p-5 flex items-center gap-4" style={{ borderColor: "oklch(0.65 0.12 200 / 0.3)", background: "oklch(0.65 0.12 200 / 0.05)" }}>
            <Save className="w-4 h-4 flex-shrink-0" style={{ color: stepColor }} />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Save campaign as</Label>
              <Input value={saveTitle} onChange={e => setSaveTitle(e.target.value)} className="bg-input border-border text-foreground h-8 text-sm" placeholder="Campaign title..." />
            </div>
            <Button onClick={handleSave} disabled={save.isPending} size="sm" style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveForm(false)} className="text-muted-foreground">Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
}
