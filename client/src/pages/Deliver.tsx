import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  FileText,
  Loader2,
  Save,
  ChevronRight,
  Presentation,
  Palette,
  Share2,
  Download,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "research" | "presentation";

interface BrandColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  confidence: string;
  notes: string;
}

export default function Deliver() {
  const [activeTab, setActiveTab] = useState<Tab>("research");
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [focus, setFocus] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [presentationHtml, setPresentationHtml] = useState("");
  const [brandColors, setBrandColors] = useState<BrandColors | null>(null);
  const [savedReportId, setSavedReportId] = useState<number | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#C9A84C");
  const [secondaryColor, setSecondaryColor] = useState("#1a1a2e");
  const [fontFamily, setFontFamily] = useState("Inter");

  const generateResearch = trpc.deliver.generateResearch.useMutation({
    onSuccess: (data) => {
      setReportContent(data.reportContent);
      toast.success("Brand analysis report generated");
    },
    onError: (err) => toast.error(`Research failed: ${err.message}`),
  });

  const extractColors = trpc.deliver.extractBrandColors.useMutation({
    onSuccess: (data) => {
      setBrandColors(data);
      setPrimaryColor(data.primaryColor);
      setSecondaryColor(data.secondaryColor);
      setFontFamily(data.fontFamily);
      toast.success("Brand colors extracted");
    },
    onError: (err) => toast.error(`Color extraction failed: ${err.message}`),
  });

  const generatePresentation = trpc.deliver.generatePresentation.useMutation({
    onSuccess: (data) => {
      setPresentationHtml(data.presentationHtml);
      toast.success("Presentation generated");
    },
    onError: (err) => toast.error(`Presentation failed: ${err.message}`),
  });

  const saveReport = trpc.deliver.saveReport.useMutation({
    onSuccess: (data) => {
      setShareToken(data.shareToken);
      if (data.id != null) setSavedReportId(data.id);
      toast.success("Report saved to projects");
      setShowSaveForm(false);
    },
    onError: (err) => toast.error(`Save failed: ${err.message}`),
  });

  const handleGenerateResearch = () => {
    if (!companyName.trim()) { toast.error("Please enter a company name"); return; }
    generateResearch.mutate({ companyName, companyUrl: companyUrl || undefined, focus: focus || undefined });
  };

  const handleExtractColors = () => {
    if (!companyName.trim()) { toast.error("Please enter a company name first"); return; }
    extractColors.mutate({ companyName, companyUrl: companyUrl || undefined });
  };

  const handleGeneratePresentation = () => {
    if (!reportContent) { toast.error("Please generate a research report first"); return; }
    // Use savedReportId if available, otherwise 0 (presentation stored locally only)
    generatePresentation.mutate({
      reportId: savedReportId ?? 0,
      companyName,
      reportContent,
      primaryColor,
      secondaryColor,
      fontFamily,
    });
    setActiveTab("presentation");
  };

  const handleSave = () => {
    saveReport.mutate({
      companyName,
      companyUrl: companyUrl || undefined,
      reportContent,
      presentationHtml: presentationHtml || undefined,
      brandColors: brandColors ? [brandColors.primaryColor, brandColors.secondaryColor, brandColors.accentColor] : undefined,
      brandFonts: brandColors ? [brandColors.fontFamily] : undefined,
    });
  };

  const downloadReport = () => {
    if (!reportContent) return;
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.toLowerCase().replace(/\s+/g, "-")}-analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const downloadPresentation = () => {
    if (!presentationHtml) return;
    const blob = new Blob([presentationHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName.toLowerCase().replace(/\s+/g, "-")}-presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Presentation downloaded as HTML");
  };

  const openPresentation = () => {
    if (!presentationHtml) return;
    const blob = new Blob([presentationHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const stepColor = "oklch(0.7 0.1 150)";

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
          <span>Framework</span>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: stepColor }}>Deliver</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stepColor.replace(")", " / 0.1)")}`, border: `1px solid ${stepColor.replace(")", " / 0.2)")}` }}>
                <FileText className="w-4 h-4" style={{ color: stepColor }} />
              </div>
              <h1 className="text-3xl font-serif text-foreground">Deliver</h1>
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full border" style={{ color: stepColor, background: `${stepColor.replace(")", " / 0.1)")}`, borderColor: `${stepColor.replace(")", " / 0.2)")}` }}>
                STEP 03
              </span>
            </div>
            <p className="text-muted-foreground text-sm ml-12">
              Deep brand research and professional presentations — automatically generated with brand-matched styling.
            </p>
          </div>
          {(reportContent || presentationHtml) && (
            <div className="flex items-center gap-2">
              {reportContent && (
                <Button variant="outline" size="sm" onClick={downloadReport} className="border-border text-foreground hover:bg-white/5 gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Report
                </Button>
              )}
              {presentationHtml && (
                <Button variant="outline" size="sm" onClick={downloadPresentation} className="border-border text-foreground hover:bg-white/5 gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Presentation
                </Button>
              )}
              <Button size="sm" onClick={() => setShowSaveForm(!showSaveForm)} className="gap-2" style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}>
                <Save className="w-3.5 h-3.5" />
                Save Report
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 ml-12">
          {(["research", "presentation"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={activeTab === tab ? { background: `${stepColor.replace(")", " / 0.12)")}`, color: stepColor } : {}}
            >
              {tab === "research" ? "Research Report" : "Presentation"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Config panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono" style={{ background: `${stepColor.replace(")", " / 0.15)")}`, color: stepColor }}>1</span>
                Target Brand
              </h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. AG1 by Athletic Greens"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Website URL <span className="text-muted-foreground/40">(optional)</span></Label>
                  <Input
                    value={companyUrl}
                    onChange={e => setCompanyUrl(e.target.value)}
                    placeholder="https://drinkag1.com"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Focus Area <span className="text-muted-foreground/40">(optional)</span></Label>
                  <Textarea
                    value={focus}
                    onChange={e => setFocus(e.target.value)}
                    placeholder="e.g. Social media strategy, last 6 months"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 resize-none text-sm"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleGenerateResearch}
                  disabled={generateResearch.isPending || !companyName.trim()}
                  className="w-full gap-2"
                  style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}
                >
                  {generateResearch.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Researching...</>
                  ) : (
                    <><FileText className="w-4 h-4" />Generate Research Report</>
                  )}
                </Button>
              </div>
            </div>

            {/* Brand colors */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono" style={{ background: `${stepColor.replace(")", " / 0.15)")}`, color: stepColor }}>2</span>
                Brand Styling
              </h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractColors}
                  disabled={extractColors.isPending || !companyName.trim()}
                  className="w-full border-border text-foreground hover:bg-white/5 gap-2 text-xs"
                >
                  {extractColors.isPending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Extracting...</>
                  ) : (
                    <><Palette className="w-3.5 h-3.5" />Extract Brand Colors</>
                  )}
                </Button>

                {brandColors && (
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm border border-border/50" style={{ background: brandColors.primaryColor }} />
                      <span className="text-xs text-muted-foreground font-mono">{brandColors.primaryColor}</span>
                      <span className="text-[10px] text-muted-foreground/50">primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm border border-border/50" style={{ background: brandColors.secondaryColor }} />
                      <span className="text-xs text-muted-foreground font-mono">{brandColors.secondaryColor}</span>
                      <span className="text-[10px] text-muted-foreground/50">secondary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground/50 font-mono">{brandColors.fontFamily}</span>
                      <span className="text-[10px] text-muted-foreground/50">font</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{brandColors.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground font-mono mb-1 block">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                      <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="bg-input border-border text-foreground h-8 text-xs font-mono flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground font-mono mb-1 block">Secondary</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                      <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="bg-input border-border text-foreground h-8 text-xs font-mono flex-1" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground font-mono mb-1 block">Font Family</Label>
                  <Input value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="bg-input border-border text-foreground h-8 text-sm" placeholder="Inter" />
                </div>

                <Button
                  onClick={handleGeneratePresentation}
                  disabled={generatePresentation.isPending || !reportContent}
                  className="w-full gap-2 text-sm"
                  variant="outline"
                  style={{ borderColor: `${stepColor.replace(")", " / 0.3)")}`, color: stepColor }}
                >
                  {generatePresentation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Building slides...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" />Generate Presentation</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Content panel */}
          <div className="lg:col-span-2">
            {activeTab === "research" ? (
              <>
                {!reportContent && !generateResearch.isPending ? (
                  <div className="rounded-xl border border-dashed border-border bg-card/50 h-full min-h-[500px] flex items-center justify-center">
                    <div className="text-center space-y-3 px-8">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: `${stepColor.replace(")", " / 0.1)")}`, border: `1px solid ${stepColor.replace(")", " / 0.2)")}` }}>
                        <FileText className="w-6 h-6" style={{ color: `${stepColor.replace(")", " / 0.6)")}` }} />
                      </div>
                      <p className="text-muted-foreground text-sm">Brand analysis report will appear here</p>
                      <p className="text-muted-foreground/50 text-xs">Enter a company name and click Generate</p>
                    </div>
                  </div>
                ) : generateResearch.isPending ? (
                  <div className="rounded-xl border border-border bg-card h-full min-h-[500px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto" style={{ borderColor: `${stepColor.replace(")", " / 0.3)")}`, borderTopColor: stepColor }} />
                      <div>
                        <p className="text-foreground text-sm font-medium">Researching {companyName}...</p>
                        <p className="text-muted-foreground text-xs mt-1">Analyzing online presence, content strategy, and performance</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Brand Analysis: {companyName}</h3>
                        <p className="text-xs text-muted-foreground">AI-generated research report</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleGenerateResearch} className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("presentation")} className="gap-1.5 text-xs" style={{ color: stepColor }}>
                          <Sparkles className="w-3 h-3" />
                          Make Presentation
                        </Button>
                      </div>
                    </div>
                    <div className="p-6 prose prose-sm prose-invert max-w-none overflow-y-auto max-h-[600px]">
                      <Streamdown>{reportContent}</Streamdown>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {!presentationHtml && !generatePresentation.isPending ? (
                  <div className="rounded-xl border border-dashed border-border bg-card/50 h-full min-h-[500px] flex items-center justify-center">
                    <div className="text-center space-y-3 px-8">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: `${stepColor.replace(")", " / 0.1)")}`, border: `1px solid ${stepColor.replace(")", " / 0.2)")}` }}>
                        <Sparkles className="w-6 h-6" style={{ color: `${stepColor.replace(")", " / 0.6)")}` }} />
                      </div>
                      <p className="text-muted-foreground text-sm">Presentation will appear here</p>
                      <p className="text-muted-foreground/50 text-xs">
                        {reportContent ? "Set brand colors and click Generate Presentation" : "Generate a research report first"}
                      </p>
                    </div>
                  </div>
                ) : generatePresentation.isPending ? (
                  <div className="rounded-xl border border-border bg-card h-full min-h-[500px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto" style={{ borderColor: `${stepColor.replace(")", " / 0.3)")}`, borderTopColor: stepColor }} />
                      <div>
                        <p className="text-foreground text-sm font-medium">Building presentation...</p>
                        <p className="text-muted-foreground text-xs mt-1">Applying {companyName}'s brand colors and typography</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{companyName} — Brand Presentation</h3>
                        <p className="text-xs text-muted-foreground">Multi-slide presentation with brand styling</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={openPresentation} className="border-border text-foreground hover:bg-white/5 gap-2 text-xs">
                          <ExternalLink className="w-3 h-3" />
                          Open Full Screen
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadPresentation} className="border-border text-foreground hover:bg-white/5 gap-2 text-xs">
                          <Download className="w-3 h-3" />
                          Download HTML
                        </Button>
                      </div>
                    </div>
                    <div className="relative bg-background" style={{ height: "600px" }}>
                      <iframe
                        srcDoc={presentationHtml}
                        className="w-full h-full border-0"
                        title="Brand Presentation"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Share token */}
        {shareToken && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4 flex items-center gap-4">
            <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Shareable link</p>
              <p className="text-sm font-mono text-foreground">{window.location.origin}/share/{shareToken}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
                toast.success("Link copied");
              }}
              className="border-border text-foreground hover:bg-white/5 text-xs"
            >
              Copy Link
            </Button>
          </div>
        )}

        {/* Save form */}
        {showSaveForm && (
          <div className="mt-4 rounded-xl border p-5 flex items-center gap-4" style={{ borderColor: `${stepColor.replace(")", " / 0.3)")}`, background: `${stepColor.replace(")", " / 0.05)")}` }}>
            <Save className="w-4 h-4 flex-shrink-0" style={{ color: stepColor }} />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Save report as</Label>
              <Input
                value={saveTitle}
                onChange={e => setSaveTitle(e.target.value)}
                defaultValue={`${companyName} — Brand Analysis`}
                className="bg-input border-border text-foreground h-8 text-sm"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saveReport.isPending}
              size="sm"
              style={{ background: stepColor, color: "oklch(0.1 0.005 260)" }}
            >
              {saveReport.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveForm(false)} className="text-muted-foreground">Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
}
