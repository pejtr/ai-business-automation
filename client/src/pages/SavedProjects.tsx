import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FolderOpen, Magnet, Mail, FileText, Trash2,
  Download, ExternalLink, ChevronRight, Share2, Loader2,
} from "lucide-react";
import { Link } from "wouter";

type Tab = "leads" | "campaigns" | "reports";

const TAB_COLORS: Record<Tab, string> = {
  leads:     "oklch(0.78 0.22 195)",
  campaigns: "oklch(0.68 0.26 295)",
  reports:   "oklch(0.72 0.24 340)",
};

export default function SavedProjects() {
  const [activeTab, setActiveTab] = useState<Tab>("leads");

  const leadLists  = trpc.attract.list.useQuery();
  const campaigns  = trpc.convert.list.useQuery();
  const reports    = trpc.deliver.list.useQuery();

  const deleteLeadList  = trpc.attract.delete.useMutation({ onSuccess: () => { leadLists.refetch();  toast.success("Seznam leadů smazán"); }, onError: () => toast.error("Smazání selhalo") });
  const deleteCampaign  = trpc.convert.delete.useMutation({ onSuccess: () => { campaigns.refetch();  toast.success("Kampaň smazána"); }, onError: () => toast.error("Smazání selhalo") });
  const deleteReport    = trpc.deliver.delete.useMutation({ onSuccess: () => { reports.refetch();    toast.success("Report smazán"); },   onError: () => toast.error("Smazání selhalo") });

  const downloadLeadCSV = (list: NonNullable<typeof leadLists.data>[0]) => {
    const leads = list.leads as Array<{ company: string; website: string; instagram?: string; facebook?: string; twitter?: string; recentTopics: string }>;
    const headers = ["Společnost", "Web", "Instagram", "Facebook", "Twitter", "Aktuální témata"];
    const rows = leads.map(l => [`"${l.company}"`, `"${l.website}"`, `"${l.instagram ?? ""}"`, `"${l.facebook ?? ""}"`, `"${l.twitter ?? ""}"`, `"${l.recentTopics.replace(/"/g, '""')}"`]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${list.title.toLowerCase().replace(/\s+/g, "-")}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV staženo");
  };

  const downloadReport = (report: NonNullable<typeof reports.data>[0]) => {
    const blob = new Blob([report.reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${report.companyName.toLowerCase().replace(/\s+/g, "-")}-analysis.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report stažen");
  };

  const openPresentation = (html: string) => {
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const tabs: { id: Tab; label: string; icon: typeof Magnet; count: number }[] = [
    { id: "leads",     label: "Seznamy leadů",   icon: Magnet,   count: leadLists.data?.length  ?? 0 },
    { id: "campaigns", label: "Kampaňe",          icon: Mail,     count: campaigns.data?.length  ?? 0 },
    { id: "reports",   label: "Výzkumné reporty", icon: FileText, count: reports.data?.length    ?? 0 },
  ];

  const isLoading = leadLists.isLoading || campaigns.isLoading || reports.isLoading;
  const accentColor = TAB_COLORS[activeTab];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-1/4 right-1/4 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none z-0" style={{ background: `${accentColor.replace(")", " / 0.04)")}` }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-8 py-6" style={{ borderBottom: "1px solid oklch(0.18 0.02 260)" }}>
          <div className="flex items-center gap-2 text-xs font-mono mb-3" style={{ color: "oklch(0.40 0.02 260)" }}>
            <span>Platforma</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Uložené projekty</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.78 0.22 195 / 0.1)", border: "1px solid oklch(0.78 0.22 195 / 0.25)", boxShadow: "0 0 14px oklch(0.78 0.22 195 / 0.15)" }}>
              <FolderOpen className="w-4 h-4" style={{ color: "oklch(0.78 0.22 195)", filter: "drop-shadow(0 0 5px oklch(0.78 0.22 195))" }} />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Uložené projekty</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">Všechny vaše seznamy leadů, outreach kampaňe a výzkumné reporty na jednom místě.</p>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-5 ml-12">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const color = TAB_COLORS[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={isActive ? {
                    background: `${color.replace(")", " / 0.12)")}`,
                    border: `1px solid ${color.replace(")", " / 0.35)")}`,
                    color,
                    boxShadow: `0 0 14px ${color.replace(")", " / 0.2)")}`,
                  } : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "oklch(0.45 0.02 260)",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.75 0.01 260)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.45 0.02 260)"; }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                    style={isActive ? {
                      background: `${color.replace(")", " / 0.2)")}`,
                      color,
                    } : {
                      background: "oklch(0.15 0.016 260)",
                      color: "oklch(0.40 0.02 260)",
                    }}
                  >
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
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.78 0.22 195 / 0.5)" }} />
            </div>
          ) : (
            <>
              {/* Lead Lists */}
              {activeTab === "leads" && (
                <div>
                  {!leadLists.data?.length ? (
                    <NeonEmptyState icon={Magnet} color={TAB_COLORS.leads} title="Zatím žádné seznamy leadů" description="Vygenerujte svůj první seznam leadů v modulu Attract" href="/attract" cta="Přejít na Attract" />
                  ) : (
                    <div className="space-y-3">
                      {leadLists.data.map(list => {
                        const leads = list.leads as Array<{ company: string }>;
                        return (
                          <NeonCard key={list.id} color={TAB_COLORS.leads}>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <NeonIcon icon={Magnet} color={TAB_COLORS.leads} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">{list.title}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <NeonMeta color={TAB_COLORS.leads}>{leads.length} leadů</NeonMeta>
                                  <Dot /><NeonMeta>{list.niche}</NeonMeta>
                                  <Dot /><NeonMeta>{list.platform}</NeonMeta>
                                  <Dot /><NeonMeta>{new Date(list.createdAt).toLocaleDateString()}</NeonMeta>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <NeonActionBtn color={TAB_COLORS.leads} onClick={() => downloadLeadCSV(list)}>
                                <Download className="w-3 h-3" /> CSV
                              </NeonActionBtn>
                              <DeleteBtn onClick={() => deleteLeadList.mutate({ id: list.id })} />
                            </div>
                          </NeonCard>
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
                    <NeonEmptyState icon={Mail} color={TAB_COLORS.campaigns} title="Zatím žádné kampaňe" description="Generujte personalizované outreach emaily v modulu Convert" href="/convert" cta="Přejít na Convert" />
                  ) : (
                    <div className="space-y-3">
                      {campaigns.data.map(campaign => {
                        const emails = campaign.emails as Array<{ company: string; subject: string }>;
                        return (
                          <div
                            key={campaign.id}
                            className="rounded-2xl overflow-hidden group transition-all duration-300"
                            style={{ background: "oklch(0.10 0.016 260)", border: "1px solid oklch(0.68 0.26 295 / 0.2)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 24px oklch(0.68 0.26 295 / 0.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.68 0.26 295 / 0.4)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.68 0.26 295 / 0.2)"; }}
                          >
                            <div className="p-5 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <NeonIcon icon={Mail} color={TAB_COLORS.campaigns} />
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{campaign.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <NeonMeta color={TAB_COLORS.campaigns}>{emails.length} emailů</NeonMeta>
                                    <Dot /><NeonMeta>{new Date(campaign.createdAt).toLocaleDateString()}</NeonMeta>
                                  </div>
                                </div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <DeleteBtn onClick={() => deleteCampaign.mutate({ id: campaign.id })} />
                              </div>
                            </div>
                            <div className="px-5 pb-4 pt-0 space-y-1.5" style={{ borderTop: "1px solid oklch(0.68 0.26 295 / 0.1)" }}>
                              {emails.slice(0, 3).map((email, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs py-1">
                                  <span className="font-mono w-4 flex-shrink-0" style={{ color: "oklch(0.68 0.26 295 / 0.4)" }}>{i + 1}</span>
                                  <span className="font-medium text-foreground w-32 truncate">{email.company}</span>
                                  <span className="text-muted-foreground truncate flex-1">{email.subject}</span>
                                </div>
                              ))}
                              {emails.length > 3 && (
                                <p className="text-xs ml-7" style={{ color: "oklch(0.68 0.26 295 / 0.4)" }}>+{emails.length - 3} dalších</p>
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
                    <NeonEmptyState icon={FileText} color={TAB_COLORS.reports} title="Zatím žádné reporty" description="Analyzujte značku a vygenerujte výzkumný report v modulu Deliver" href="/deliver" cta="Přejít na Deliver" />
                  ) : (
                    <div className="space-y-3">
                      {reports.data.map(report => (
                        <NeonCard key={report.id} color={TAB_COLORS.reports}>
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <NeonIcon icon={FileText} color={TAB_COLORS.reports} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground">{report.companyName}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {report.companyUrl && (<><NeonMeta>{report.companyUrl}</NeonMeta><Dot /></>)}
                                <NeonMeta>{new Date(report.createdAt).toLocaleDateString()}</NeonMeta>
                                {report.presentationHtml && (<><Dot /><NeonMeta color={TAB_COLORS.reports}>+ Snímky</NeonMeta></>)}
                              </div>
                              <p className="text-xs mt-1.5 leading-relaxed line-clamp-1" style={{ color: "oklch(0.40 0.02 260)" }}>
                                {report.reportContent.replace(/[#*`]/g, "").substring(0, 160)}…
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <NeonActionBtn color={TAB_COLORS.reports} onClick={() => downloadReport(report)}>
                              <Download className="w-3 h-3" /> Report
                            </NeonActionBtn>
                            {report.presentationHtml && (
                              <NeonActionBtn color={TAB_COLORS.reports} onClick={() => openPresentation(report.presentationHtml!)}>
                                <ExternalLink className="w-3 h-3" /> Snímky
                              </NeonActionBtn>
                            )}
                            {report.shareToken && (
                              <button
                                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${report.shareToken}`); toast.success("Odkaz zkopírován"); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                style={{ color: "oklch(0.45 0.02 260)", border: "1px solid oklch(0.20 0.022 260)" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = TAB_COLORS.reports; (e.currentTarget as HTMLButtonElement).style.borderColor = TAB_COLORS.reports.replace(")", " / 0.4)"); }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.45 0.02 260)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.20 0.022 260)"; }}
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <DeleteBtn onClick={() => deleteReport.mutate({ id: report.id })} />
                          </div>
                        </NeonCard>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NeonCard({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      className="group rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300"
      style={{ background: "oklch(0.10 0.016 260)", border: `1px solid ${color.replace(")", " / 0.2)")}` }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${color.replace(")", " / 0.1)")}`; (e.currentTarget as HTMLDivElement).style.borderColor = color.replace(")", " / 0.4)"); (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = color.replace(")", " / 0.2)"); (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      {children}
    </div>
  );
}

function NeonIcon({ icon: Icon, color }: { icon: typeof Magnet; color: string }) {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color.replace(")", " / 0.1)")}`, border: `1px solid ${color.replace(")", " / 0.25)")}` }}>
      <Icon className="w-4 h-4" style={{ color, filter: `drop-shadow(0 0 5px ${color})` }} />
    </div>
  );
}

function NeonMeta({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="text-xs" style={{ color: color ? `${color.replace(")", " / 0.7)")}` : "oklch(0.40 0.02 260)" }}>
      {children}
    </span>
  );
}

function Dot() {
  return <span style={{ color: "oklch(0.25 0.02 260)" }}>·</span>;
}

function NeonActionBtn({ children, color, onClick }: { children: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs font-medium transition-all duration-150"
      style={{ color: "oklch(0.55 0.02 260)", border: "1px solid oklch(0.20 0.022 260)", background: "transparent" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = color; (e.currentTarget as HTMLButtonElement).style.borderColor = color.replace(")", " / 0.4)"); (e.currentTarget as HTMLButtonElement).style.background = `${color.replace(")", " / 0.08)")}`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.55 0.02 260)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.20 0.022 260)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
      style={{ color: "oklch(0.45 0.02 260)", border: "1px solid oklch(0.20 0.022 260)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.65 0.22 25)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.65 0.22 25 / 0.4)"; (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.65 0.22 25 / 0.08)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.45 0.02 260)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.20 0.022 260)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

function NeonEmptyState({ icon: Icon, color, title, description, href, cta }: { icon: typeof Magnet; color: string; title: string; description: string; href: string; cta: string }) {
  return (
    <div
      className="rounded-2xl py-20 flex flex-col items-center justify-center text-center"
      style={{ background: "oklch(0.09 0.014 260)", border: `1px dashed ${color.replace(")", " / 0.2)")}` }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color.replace(")", " / 0.1)")}`, border: `1px solid ${color.replace(")", " / 0.25)")}`, boxShadow: `0 0 20px ${color.replace(")", " / 0.1)")}` }}>
        <Icon className="w-5 h-5" style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-6">{description}</p>
      <Link href={href}>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ background: `${color.replace(")", " / 0.1)")}`, border: `1px solid ${color.replace(")", " / 0.3)")}`, color, boxShadow: `0 0 16px ${color.replace(")", " / 0.15)")}` }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color.replace(")", " / 0.18)")}`; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 24px ${color.replace(")", " / 0.25)")}`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color.replace(")", " / 0.1)")}`; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 16px ${color.replace(")", " / 0.15)")}`; }}
        >
          {cta} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );
}
