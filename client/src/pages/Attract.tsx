import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Magnet, Download, Save, Loader2, ExternalLink, RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const stepColor = "oklch(0.78 0.22 195)";

interface Lead {
  company: string;
  website: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  recentTopics: string;
}

const PLATFORM_OPTIONS = [
  "Instagram & Facebook",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Twitter / X",
  "Všechny platformy",
];

const NICHE_SUGGESTIONS = [
  "Zdravověčí & Wellness",
  "E-commerce Móda",
  "SaaS B2B",
  "Realitní trh",
  "Fitness & Výživa",
  "Krása & Kosmetika",
];

export default function Attract() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("Instagram & Facebook");
  const [count, setCount] = useState(10);
  const [additionalCriteria, setAdditionalCriteria] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const generate = trpc.attract.generate.useMutation({
    onSuccess: (data) => {
      setLeads(data.leads);
      setSaveTitle(`${niche} — ${platform} (${data.leads.length} leadů)`);
      toast.success(`Úspěšně vygenerováno ${data.leads.length} leadů`);
    },
    onError: (err) => toast.error(`Generování selhalo: ${err.message}`),
  });

  const save = trpc.attract.save.useMutation({
    onSuccess: () => {
      toast.success("Seznam leadů uložen do projektů");
      setShowSaveForm(false);
    },
    onError: (err) => toast.error(`Uložení selhalo: ${err.message}`),
  });

  const handleGenerate = () => {
    if (!niche.trim()) { toast.error("Zadejte prosím odvětví"); return; }
    generate.mutate({ niche, platform, count, additionalCriteria: additionalCriteria || undefined });
  };

  const handleSave = () => {
    if (!saveTitle.trim()) { toast.error("Zadejte prosím název"); return; }
    save.mutate({ title: saveTitle, niche, platform, count: leads.length, leads });
  };

  const downloadCSV = () => {
    if (!leads.length) return;
    const headers = ["Společnost", "Web", "Instagram", "Facebook", "Twitter", "Aktuální témata"];
    const rows = leads.map(l => [
      `"${l.company}"`,
      `"${l.website}"`,
      `"${l.instagram ?? ""}"`,
      `"${l.facebook ?? ""}"`,
      `"${l.twitter ?? ""}"`,
      `"${l.recentTopics.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${niche.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV staženo");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
          <span>Framework</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">Attract</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Magnet className="w-4.5 h-4.5 text-primary" />
              </div>
              <h1 className="text-3xl font-serif text-foreground">Attract</h1>
              <span className="text-[10px] font-mono tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                STEP 01
              </span>
            </div>
            <p className="text-muted-foreground text-sm ml-12">
              Generujte cílené seznamy leadů pomocí AI. Definujte kritéria a získáte strukturovanou tabulku kvalifikovaných zájemců.
            </p>
          </div>
          {leads.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                className="border-border text-foreground hover:bg-white/5 gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSaveForm(!showSaveForm)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                Uložit seznam
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl">
        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 space-y-5">
            <div data-onboarding="attract-form" className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-mono text-primary">1</span>
                Definujte kritéria
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2 block">
                    Odvětví / Obor
                  </Label>
                  <Input
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    placeholder="např. Zdravověčí & Wellness"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {NICHE_SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setNiche(s)}
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full border transition-all",
                          niche === s
                            ? "bg-primary/15 border-primary/30 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2 block">
                    Platforma
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PLATFORM_OPTIONS.map(p => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={cn(
                          "text-xs px-2 py-1.5 rounded-lg border transition-all text-left",
                          platform === p
                            ? "bg-primary/15 border-primary/30 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2 block">
                    Počet leadů
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={5}
                      value={count}
                      onChange={e => setCount(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-sm font-mono text-primary w-8 text-right">{count}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-2 block">
                    Další kritéria <span className="text-muted-foreground/40">(volitelné)</span>
                  </Label>
                  <Textarea
                    value={additionalCriteria}
                    onChange={e => setAdditionalCriteria(e.target.value)}
                    placeholder="např. Aktivní v posledních 30 dnech, 10k–500k sledujících, prodává fyzické produkty..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 resize-none text-sm"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generate.isPending || !niche.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  {generate.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Generuji leady...</>
                  ) : (
                    <><Magnet className="w-4 h-4" />Generovat seznam leadů</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {leads.length === 0 && !generate.isPending ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-3 px-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Magnet className="w-6 h-6 text-primary/60" />
                  </div>
                  <p className="text-muted-foreground text-sm">Váš seznam leadů se zobrazí zde</p>
                  <p className="text-muted-foreground/50 text-xs">Definujte kritéria a klikněte na Generovat</p>
                </div>
              </div>
            ) : generate.isPending ? (
              <div className="rounded-xl border border-border bg-card h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
                  <div>
                    <p className="text-foreground text-sm font-medium">Vyhledávám leady...</p>
                    <p className="text-muted-foreground text-xs mt-1">AI prohledává {count} {niche} značek na {platform}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{leads.length} vygenerovaných leadů</h3>
                    <p className="text-xs text-muted-foreground">{niche} · {platform}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Znovu generovat
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-5 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider w-8">#</th>
                        <th className="text-left px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Společnost</th>
                        <th className="text-left px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Web</th>
                        <th className="text-left px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Sociální sítě</th>
                        <th className="text-left px-3 py-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Aktuální témata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3 text-muted-foreground/50 font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-3 py-3">
                            <span className="font-medium text-foreground">{lead.company}</span>
                          </td>
                          <td className="px-3 py-3">
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary/80 hover:text-primary flex items-center gap-1 text-xs"
                            >
                              {lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "").substring(0, 25)}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-0.5">
                              {lead.instagram && <span className="text-xs text-muted-foreground">{lead.instagram}</span>}
                              {lead.facebook && <span className="text-xs text-muted-foreground/60">{lead.facebook}</span>}
                            </div>
                          </td>
                          <td className="px-3 py-3 max-w-xs">
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{lead.recentTopics}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save form */}
        {showSaveForm && leads.length > 0 && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-4">
            <Save className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Uložit jako</Label>
              <Input
                value={saveTitle}
                onChange={e => setSaveTitle(e.target.value)}
                className="bg-input border-border text-foreground h-8 text-sm"
                placeholder="Název seznamu leadů..."
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={save.isPending}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uložit"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveForm(false)}
              className="text-muted-foreground"
            >
              Zrušit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
