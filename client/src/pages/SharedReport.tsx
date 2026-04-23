import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Loader2, FileText, Download, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "wouter";
import { toast } from "sonner";

export default function SharedReport() {
  const { token } = useParams<{ token: string }>();

  const { data: report, isLoading, error } = trpc.deliver.getByShareToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token }
  );

  const downloadReport = () => {
    if (!report?.reportContent) return;
    const blob = new Blob([report.reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.companyName.toLowerCase().replace(/\s+/g, "-")}-analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const openPresentation = () => {
    if (!report?.presentationHtml) return;
    const blob = new Blob([report.presentationHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-serif text-foreground">Report not found</h2>
          <p className="text-muted-foreground text-sm">This report may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Agency AI</p>
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Shared Report</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadReport}
            className="border-border text-foreground hover:bg-white/5 gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          {report.presentationHtml && (
            <Button
              size="sm"
              onClick={openPresentation}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Presentation
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">Brand Analysis Report</span>
          </div>
          <h1 className="text-4xl font-serif text-foreground">{report.companyName}</h1>
          {report.companyUrl && (
            <a href={report.companyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary/80 hover:text-primary mt-1 inline-flex items-center gap-1">
              {report.companyUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Generated {new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="divider-gold mb-8" />

        <div className="prose prose-sm prose-invert max-w-none">
          <Streamdown>{report.reportContent}</Streamdown>
        </div>

        {report.presentationHtml && (
          <div className="mt-10 pt-8 border-t border-border">
            <h2 className="text-xl font-serif text-foreground mb-4">Presentation Preview</h2>
            <div className="rounded-xl border border-border overflow-hidden" style={{ height: "500px" }}>
              <iframe
                srcDoc={report.presentationHtml}
                className="w-full h-full border-0"
                title="Brand Presentation"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
