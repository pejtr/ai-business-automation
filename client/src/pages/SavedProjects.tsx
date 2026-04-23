import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FolderOpen,
  Magnet,
  Mail,
  FileText,
  Trash2,
  Download,
  ExternalLink,
  ChevronRight,
  Share2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type Tab = "leads" | "campaigns" | "reports";

export default function SavedProjects() {
  const [activeTab, setActiveTab] = useState<Tab>("leads");

  const leadLists = trpc.attract.list.useQuery();
  const campaigns = trpc.convert.list.useQuery();
  const reports = trpc.deliver.list.useQuery();

  const deleteLeadList = trpc.attract.delete.useMutation({
    onSuccess: () => { leadLists.refetch(); toast.success("Lead list deleted"); },
    onError: () => toast.error("Delete failed"),
  });

  const deleteCampaign = trpc.convert.delete.useMutation({
    onSuccess: () => { campaigns.refetch(); toast.success("Campaign deleted"); },
    onError: () => toast.error("Delete failed"),
  });

  const deleteReport = trpc.deliver.delete.useMutation({
    onSuccess: () => { reports.refetch(); toast.success("Report deleted"); },
    onError: () => toast.error("Delete failed"),
  });

  const downloadLeadCSV = (list: NonNullable<typeof leadLists.data>[0]) => {
    const leads = list.leads as Array<{
      company: string; website: string; instagram?: string;
      facebook?: string; twitter?: string; recentTopics: string;
    }>;
    const headers = ["Company", "Website", "Instagram", "Facebook", "Twitter", "Recent Topics"];
    const rows = leads.map(l => [
      `"${l.company}"`, `"${l.website}"`, `"${l.instagram ?? ""}"`,
      `"${l.facebook ?? ""}"`, `"${l.twitter ?? ""}"`,
      `"${l.recentTopics.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const downloadReport = (report: NonNullable<typeof reports.data>[0]) => {
    const blob = new Blob([report.reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.companyName.toLowerCase().replace(/\s+/g, "-")}-analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const openPresentation = (html: string, name: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const tabs: { id: Tab; label: string; icon: typeof Magnet; count: number }[] = [
    { id: "leads", label: "Lead Lists", icon: Magnet, count: leadLists.data?.length ?? 0 },
    { id: "campaigns", label: "Campaigns", icon: Mail, count: campaigns.data?.length ?? 0 },
    { id: "reports", label: "Research Reports", icon: FileText, count: reports.data?.length ?? 0 },
  ];

  const isLoading = leadLists.isLoading || campaigns.isLoading || reports.isLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
          <span>Platform</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Saved Projects</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-serif text-foreground">Saved Projects</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">All your lead lists, outreach campaigns, and research reports in one place.</p>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 ml-12">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                  activeTab === tab.id ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Lead Lists */}
            {activeTab === "leads" && (
              <div>
                {!leadLists.data?.length ? (
                  <EmptyState
                    icon={Magnet}
                    title="No lead lists yet"
                    description="Generate your first lead list in the Attract module"
                    href="/attract"
                    cta="Go to Attract"
                  />
                ) : (
                  <div className="space-y-3">
                    {leadLists.data.map(list => {
                      const leads = list.leads as Array<{ company: string }>;
                      return (
                        <div key={list.id} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <Magnet className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{list.title}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-muted-foreground">{leads.length} leads</span>
                                <span className="text-muted-foreground/30">·</span>
                                <span className="text-xs text-muted-foreground">{list.niche}</span>
                                <span className="text-muted-foreground/30">·</span>
                                <span className="text-xs text-muted-foreground">{list.platform}</span>
                                <span className="text-muted-foreground/30">·</span>
                                <span className="text-xs text-muted-foreground">{new Date(list.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadLeadCSV(list)}
                              className="border-border text-foreground hover:bg-white/5 gap-1.5 text-xs h-7"
                            >
                              <Download className="w-3 h-3" />
                              CSV
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteLeadList.mutate({ id: list.id })}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Campaigns */}
            {activeTab === "campaigns" && (
              <div>
                {!campaigns.data?.length ? (
                  <EmptyState
                    icon={Mail}
                    title="No campaigns yet"
                    description="Generate personalized outreach emails in the Convert module"
                    href="/convert"
                    cta="Go to Convert"
                  />
                ) : (
                  <div className="space-y-3">
                    {campaigns.data.map(campaign => {
                      const emails = campaign.emails as Array<{ company: string; subject: string; body: string }>;
                      return (
                        <div key={campaign.id} className="rounded-xl border border-border bg-card overflow-hidden group hover:border-[oklch(0.65_0.12_200/0.3)] transition-all">
                          <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.65 0.12 200 / 0.1)", border: "1px solid oklch(0.65 0.12 200 / 0.2)" }}>
                                <Mail className="w-4 h-4" style={{ color: "oklch(0.65 0.12 200)" }} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{campaign.title}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-muted-foreground">{emails.length} emails</span>
                                  <span className="text-muted-foreground/30">·</span>
                                  <span className="text-xs text-muted-foreground">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteCampaign.mutate({ id: campaign.id })}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          {/* Email preview */}
                          <div className="border-t border-border/50 px-5 pb-4 pt-3 space-y-2">
                            {emails.slice(0, 3).map((email, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs">
                                <span className="text-muted-foreground/40 font-mono w-4">{i + 1}</span>
                                <span className="font-medium text-foreground w-32 truncate">{email.company}</span>
                                <span className="text-muted-foreground truncate flex-1">{email.subject}</span>
                              </div>
                            ))}
                            {emails.length > 3 && (
                              <p className="text-xs text-muted-foreground/50 ml-7">+{emails.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Reports */}
            {activeTab === "reports" && (
              <div>
                {!reports.data?.length ? (
                  <EmptyState
                    icon={FileText}
                    title="No research reports yet"
                    description="Analyze a brand and generate a research report in the Deliver module"
                    href="/deliver"
                    cta="Go to Deliver"
                  />
                ) : (
                  <div className="space-y-3">
                    {reports.data.map(report => (
                      <div key={report.id} className="rounded-xl border border-border bg-card p-5 group hover:border-[oklch(0.7_0.1_150/0.3)] transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.7 0.1 150 / 0.1)", border: "1px solid oklch(0.7 0.1 150 / 0.2)" }}>
                              <FileText className="w-4 h-4" style={{ color: "oklch(0.7 0.1 150)" }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{report.companyName}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                {report.companyUrl && (
                                  <>
                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{report.companyUrl}</span>
                                    <span className="text-muted-foreground/30">·</span>
                                  </>
                                )}
                                <span className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</span>
                                {report.presentationHtml && (
                                  <>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span className="text-xs text-[oklch(0.7_0.1_150)]">+ Presentation</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadReport(report)}
                              className="border-border text-foreground hover:bg-white/5 gap-1.5 text-xs h-7"
                            >
                              <Download className="w-3 h-3" />
                              Report
                            </Button>
                            {report.presentationHtml && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPresentation(report.presentationHtml!, report.companyName)}
                                className="border-border text-foreground hover:bg-white/5 gap-1.5 text-xs h-7"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Slides
                              </Button>
                            )}
                            {report.shareToken && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/share/${report.shareToken}`);
                                  toast.success("Share link copied");
                                }}
                                className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteReport.mutate({ id: report.id })}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {/* Report preview */}
                        <div className="mt-3 ml-13 pl-13">
                          <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 ml-[52px]">
                            {report.reportContent.replace(/[#*`]/g, "").substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof Magnet;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-5">{description}</p>
      <Link href={href}>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          {cta}
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}
