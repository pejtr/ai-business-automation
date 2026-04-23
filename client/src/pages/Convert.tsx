import { useState } from "react";
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

export default function Convert() {
  const [senderName, setSenderName] = useState("");
  const [senderRole, setSenderRole] = useState("");
  const [pitch, setPitch] = useState("");
  const [leadsJson, setLeadsJson] = useState("");
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectedLeadListId, setSelectedLeadListId] = useState<number | null>(null);

  const savedLists = trpc.attract.list.useQuery();

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
    onSuccess: () => {
      toast.success("Campaign saved to projects");
      setShowSaveForm(false);
    },
    onError: (err) => toast.error(`Save failed: ${err.message}`),
  });

  const parseLeads = (): Lead[] => {
    try {
      const parsed = JSON.parse(leadsJson);
      if (Array.isArray(parsed)) return parsed as Lead[];
      if (parsed.leads && Array.isArray(parsed.leads)) return parsed.leads as Lead[];
      return [];
    } catch {
      return [];
    }
  };

  const loadFromSaved = (id: number) => {
    const list = savedLists.data?.find(l => l.id === id);
    if (!list) return;
    setSelectedLeadListId(id);
    setLeadsJson(JSON.stringify(list.leads, null, 2));
    toast.success(`Loaded "${list.title}"`);
  };

  const handleGenerate = () => {
    const leads = parseLeads();
    if (!leads.length) {
      toast.error("Please provide a valid lead list (JSON format)");
      return;
    }
    generate.mutate({
      leads,
      senderName: senderName || undefined,
      senderRole: senderRole || undefined,
      pitch: pitch || undefined,
    });
  };

  const handleSave = () => {
    if (!saveTitle.trim()) { toast.error("Please enter a title"); return; }
    save.mutate({
      title: saveTitle,
      leadListId: selectedLeadListId ?? undefined,
      emails,
    });
  };

  const copyEmail = async (email: OutreachEmail, index: number) => {
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Email copied to clipboard");
  };

  const exportAllEmails = () => {
    if (!emails.length) return;
    const text = emails.map(e =>
      `=== ${e.company} ===\nSubject: ${e.subject}\n\n${e.body}\n\n`
    ).join("---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-campaign-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Emails exported");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
          <span>Framework</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[oklch(0.65_0.12_200)]">Convert</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.65 0.12 200 / 0.1)", border: "1px solid oklch(0.65 0.12 200 / 0.2)" }}>
                <Mail className="w-4 h-4" style={{ color: "oklch(0.65 0.12 200)" }} />
              </div>
              <h1 className="text-3xl font-serif text-foreground">Convert</h1>
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full border" style={{ color: "oklch(0.65 0.12 200)", background: "oklch(0.65 0.12 200 / 0.1)", borderColor: "oklch(0.65 0.12 200 / 0.2)" }}>
                STEP 02
              </span>
            </div>
            <p className="text-muted-foreground text-sm ml-12">
              Turn your lead list into personalized outreach emails. Each draft references the brand's recent activity.
            </p>
          </div>
          {emails.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAllEmails}
                className="border-border text-foreground hover:bg-white/5 gap-2"
              >
                Export All
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSaveForm(!showSaveForm)}
                className="gap-2"
                style={{ background: "oklch(0.65 0.12 200)", color: "oklch(0.1 0.005 260)" }}
              >
                <Save className="w-3.5 h-3.5" />
                Save Campaign
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Config panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[oklch(0.65_0.12_200/0.15)] flex items-center justify-center text-[10px] font-mono" style={{ color: "oklch(0.65 0.12 200)" }}>1</span>
                Sender Details
              </h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Your Name</Label>
                  <Input
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Your Role</Label>
                  <Input
                    value={senderRole}
                    onChange={e => setSenderRole(e.target.value)}
                    placeholder="e.g. Marketing Strategist"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Pitch Goal</Label>
                  <Textarea
                    value={pitch}
                    onChange={e => setPitch(e.target.value)}
                    placeholder="e.g. Book a 15-minute discovery call to discuss growth opportunities"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 resize-none text-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[oklch(0.65_0.12_200/0.15)] flex items-center justify-center text-[10px] font-mono" style={{ color: "oklch(0.65 0.12 200)" }}>2</span>
                Lead List
              </h2>

              {/* Load from saved */}
              {savedLists.data && savedLists.data.length > 0 && (
                <div className="mb-3">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Load Saved List</Label>
                  <select
                    onChange={e => e.target.value && loadFromSaved(Number(e.target.value))}
                    className="w-full bg-input border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a saved list...</option>
                    {savedLists.data.map(list => (
                      <option key={list.id} value={list.id}>{list.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">
                  Lead Data (JSON)
                </Label>
                <Textarea
                  value={leadsJson}
                  onChange={e => setLeadsJson(e.target.value)}
                  placeholder={`[\n  {\n    "company": "Brand Name",\n    "website": "https://...",\n    "recentTopics": "..."\n  }\n]`}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground/30 resize-none text-xs font-mono"
                  rows={8}
                />
                <p className="text-[11px] text-muted-foreground/50 mt-1">
                  Paste JSON from Attract module or load a saved list above
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generate.isPending || !leadsJson.trim()}
                className="w-full mt-4 gap-2"
                style={{ background: "oklch(0.65 0.12 200)", color: "oklch(0.1 0.005 260)" }}
              >
                {generate.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Writing emails...</>
                ) : (
                  <><Mail className="w-4 h-4" />Generate Outreach Emails</>
                )}
              </Button>
            </div>
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
                  <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto" style={{ borderColor: "oklch(0.65 0.12 200 / 0.3)", borderTopColor: "oklch(0.65 0.12 200)" }} />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </Button>
                </div>

                {emails.map((email, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
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
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyEmail(email, i)}
                            className="border-border text-foreground hover:bg-white/5 gap-2 text-xs"
                          >
                            {copiedIndex === i ? (
                              <><Check className="w-3 h-3 text-green-400" />Copied!</>
                            ) : (
                              <><Copy className="w-3 h-3" />Copy Email</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save form */}
        {showSaveForm && emails.length > 0 && (
          <div className="rounded-xl border border-[oklch(0.65_0.12_200/0.3)] bg-[oklch(0.65_0.12_200/0.05)] p-5 flex items-center gap-4">
            <Save className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.65 0.12 200)" }} />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Save campaign as</Label>
              <Input
                value={saveTitle}
                onChange={e => setSaveTitle(e.target.value)}
                className="bg-input border-border text-foreground h-8 text-sm"
                placeholder="Campaign title..."
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={save.isPending}
              size="sm"
              style={{ background: "oklch(0.65 0.12 200)", color: "oklch(0.1 0.005 260)" }}
            >
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveForm(false)} className="text-muted-foreground">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
