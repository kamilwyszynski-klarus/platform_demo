import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useCallback, useState } from "react";
import { useAppState } from "@/components/shell/AppStateContext";
import { cn } from "@/lib/utils";
import { EXCEPTIONS_HEADER } from "@/data/journal";
import LiveFeedTab from "./LiveFeedTab";
import ExceptionsTab from "./ExceptionsTab";
import AssuranceDashboardTab from "./AssuranceDashboardTab";
import JournalDetailPopup, { type PopupSource } from "./JournalDetailPopup";

const EASE = [0.16, 1, 0.3, 1] as const;

export type JournalTab = "live-feed" | "exceptions" | "dashboard";

const TABS: Array<{ id: JournalTab; label: string }> = [
  { id: "live-feed", label: "Live feed" },
  { id: "exceptions", label: "Exceptions" },
  { id: "dashboard", label: "Assurance dashboard" },
];

interface PopupState {
  jeId: string;
  source: PopupSource;
}

const JournalDetail = () => {
  const { closeDetail } = useAppState();
  const [activeTab, setActiveTab] = useState<JournalTab>("live-feed");
  const [popup, setPopup] = useState<PopupState | null>(null);

  const openPopup = useCallback((jeId: string, source: PopupSource) => {
    setPopup({ jeId, source });
  }, []);

  const closePopup = useCallback(() => setPopup(null), []);

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Workspace header — matches InvoiceDetail / CddDetail rhythm */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-3 lg:px-10"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeDetail}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/65 transition-colors hover:border-white/25 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2} />
            Catalog
          </button>
          <div className="hidden h-3 w-px bg-foreground/15 md:block" />
          <div className="hidden items-center gap-2 md:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary-glow">
              <ClipboardList className="h-3.5 w-3.5" strokeWidth={1.6} />
            </span>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
                Client-deployable agent
              </div>
              <div className="text-[13px] font-semibold tracking-tight text-foreground">
                Manual Journal Testing
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 text-[11px] text-foreground/45 md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/85" />
          </span>
          Agent live · v1.0
        </div>
      </motion.div>

      {/* Tab bar — sits inside the workspace body, just under the header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="border-b border-white/[0.06] px-6 lg:px-10"
      >
        <div className="flex items-end gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === "exceptions";
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className={cn(
                  "group relative inline-flex items-center gap-2 px-3 py-2.5 text-[12.5px] font-medium tracking-tight transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-primary-glow/60",
                  isActive
                    ? "text-foreground"
                    : "text-foreground/55 hover:text-foreground/85",
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                {tab.label}
                {showBadge && (
                  <span
                    className={cn(
                      "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums tracking-tight transition-colors",
                      isActive
                        ? "border border-amber-300/40 bg-amber-300/15 text-amber-200"
                        : "border border-amber-300/25 bg-amber-300/[0.08] text-amber-200/85",
                    )}
                  >
                    {EXCEPTIONS_HEADER.total}
                  </span>
                )}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-all duration-300",
                    isActive
                      ? "bg-primary-glow shadow-[0_0_10px_hsl(var(--primary-glow)/0.55)]"
                      : "bg-transparent",
                  )}
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab body */}
      <div className="relative flex flex-1 flex-col">
        {activeTab === "live-feed" && <LiveFeedTab onOpenJournal={(id) => openPopup(id, "live-feed")} onJumpToTab={setActiveTab} />}
        {activeTab === "exceptions" && <ExceptionsTab onOpenJournal={(id) => openPopup(id, "exceptions")} />}
        {activeTab === "dashboard" && <AssuranceDashboardTab />}
      </div>

      {popup && (
        <JournalDetailPopup
          jeId={popup.jeId}
          source={popup.source}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default JournalDetail;
