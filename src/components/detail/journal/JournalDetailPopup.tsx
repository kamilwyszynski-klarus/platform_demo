import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  FileText,
  Flag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DETAIL_EXAMPLES,
  type GlLine,
  type JournalDetailExample,
  type RiskStep,
  type PopupVerdictTone,
} from "@/data/journal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export type PopupSource = "live-feed" | "exceptions";

interface Props {
  jeId: string;
  source: PopupSource;
  onClose: () => void;
}

const VERDICT_PILL: Record<PopupVerdictTone, string> = {
  passed: "border-primary-glow/40 bg-primary-glow/[0.10] text-primary-glow",
  review: "border-amber-300/40 bg-amber-300/[0.10] text-amber-200",
  flagged: "border-rose-400/45 bg-rose-400/[0.10] text-rose-200",
};

const formatGbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);

const formatAmount = (line: GlLine) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(line.amount);

const JournalDetailPopup = ({ jeId, source, onClose }: Props) => {
  const data = DETAIL_EXAMPLES[jeId];

  /* ESC handling: AppShell listens at document-bubble for Escape→signOut.
   * Register at document-capture so we run first; close popup and stop the
   * event from bubbling to AppShell. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, { capture: true });
    return () => document.removeEventListener("keydown", onKey, { capture: true });
  }, [onClose]);

  /* Lock body scroll while popup is open. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={jeId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="journal-popup-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close journal detail"
            onClick={onClose}
            className="absolute inset-0 bg-background/75 backdrop-blur-md"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative flex max-h-[88vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[hsl(var(--popover))] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_hsl(220_30%_25%_/_0.4)_inset]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h2
                    id="journal-popup-title"
                    className="text-[14px] font-semibold tabular-nums tracking-tight text-foreground"
                  >
                    {data.id}
                  </h2>
                  <span className="text-foreground/30">·</span>
                  <span className="truncate text-[13.5px] tracking-tight text-foreground/85">
                    {data.narrative}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11.5px] tracking-tight text-foreground/55">
                  <span className="tabular-nums text-foreground/85">
                    {formatGbp(data.amountGbp)}
                  </span>
                  <span className="text-foreground/25">·</span>
                  <span>{data.user}</span>
                  <span className="text-foreground/25">·</span>
                  <span className="tabular-nums">{data.date} {data.time}</span>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em]",
                    VERDICT_PILL[data.verdict.tone],
                  )}
                >
                  {data.verdict.label}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-foreground/65 transition-colors hover:border-white/25 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Three-column body */}
            <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.05fr)]">
              <ColumnJournal data={data} />
              <ColumnEvidence data={data} />
              <ColumnRiskEngine data={data} />
            </div>

            {/* Footer */}
            <PopupFooter data={data} source={source} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------ columns === */

const ColumnHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
    {children}
  </h3>
);

const ColumnJournal = ({ data }: { data: JournalDetailExample }) => (
  <div className="flex flex-col gap-3 overflow-y-auto border-b border-white/[0.05] px-6 py-5 lg:border-b-0 lg:border-r">
    <ColumnHeading>Journal source</ColumnHeading>

    <div className="space-y-2.5 text-[12.5px] tracking-tight">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/40">
          Narrative
        </div>
        <div className="mt-0.5 text-foreground/90">{data.narrative}</div>
      </div>

      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/40">
          Posted by
        </div>
        <div className="mt-0.5 tabular-nums text-foreground/90">
          {data.user} · {data.postedDate}
        </div>
      </div>
    </div>

    <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-3">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/35">
        GL lines
      </div>
      <div className="font-mono text-[12px] leading-relaxed tabular-nums text-foreground/85">
        {data.glLines.map((line, i) => (
          <div key={i} className={cn("flex gap-2", line.side === "Cr" && "pl-6")}>
            <span className="text-primary-glow">{line.side}</span>
            <span className="flex-1 truncate text-foreground/90">{line.account}</span>
            <span className="text-foreground/55">{line.currency}</span>
            <span className="w-20 text-right text-foreground/95">{formatAmount(line)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ColumnEvidence = ({ data }: { data: JournalDetailExample }) => (
  <div className="flex flex-col gap-3 overflow-y-auto border-b border-white/[0.05] px-6 py-5 lg:border-b-0 lg:border-r">
    <ColumnHeading>Evidence bundle</ColumnHeading>

    <ul className="flex flex-col gap-2">
      {data.evidence.map((doc, i) => (
        <motion.li
          key={doc.filename}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.1 + i * 0.05 }}
          className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2.5"
        >
          <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary-glow/85" strokeWidth={1.6} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-medium tracking-tight text-foreground/90">
              {doc.filename}
            </div>
            <div className="mt-0.5 text-[11px] tracking-tight text-foreground/45">
              {doc.subtitle}
            </div>
          </div>
        </motion.li>
      ))}
    </ul>

    <p className="mt-1 text-[10.5px] tracking-tight text-foreground/40">
      Bundle linked back to the journal — agent-gathered, hash-stamped, retained
      in the audit evidence store.
    </p>
  </div>
);

const ColumnRiskEngine = ({ data }: { data: JournalDetailExample }) => (
  <div className="flex flex-col gap-3 overflow-y-auto px-6 py-5">
    <ColumnHeading>Risk engine — step-through</ColumnHeading>
    <ul className="flex flex-col gap-2">
      {data.riskSteps.map((step) => (
        <RiskStepRow key={step.assertion} step={step} />
      ))}
    </ul>
  </div>
);

const RiskStepRow = ({ step }: { step: RiskStep }) => {
  const isFlag = step.verdict === "flag";
  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5 transition-colors",
        step.emphasis
          ? "border-amber-300/45 bg-amber-300/[0.05]"
          : "border-white/[0.06] bg-white/[0.015]",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
            isFlag ? "bg-amber-300/15 text-amber-200" : "bg-primary-glow/15 text-primary-glow",
          )}
        >
          {isFlag ? (
            <Flag className="h-2.5 w-2.5" strokeWidth={2.2} />
          ) : (
            <Check className="h-2.5 w-2.5" strokeWidth={2.6} />
          )}
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.18em]",
            isFlag ? "text-amber-200" : "text-primary-glow",
          )}
        >
          {step.verdict}
        </span>
        <span
          className={cn(
            "text-[12.5px] tracking-tight text-foreground/90",
            step.emphasis && "font-semibold text-foreground",
          )}
        >
          {step.assertion}
        </span>
      </div>
      <p className="ml-6 mt-1 text-[11.5px] leading-relaxed tracking-tight text-foreground/65">
        {step.justification}
      </p>
    </li>
  );
};

/* ------------------------------------------------------------- footer === */

const PopupFooter = ({
  data,
  source,
  onClose,
}: {
  data: JournalDetailExample;
  source: PopupSource;
  onClose: () => void;
}) => {
  const [overrideText, setOverrideText] = useState("");
  const [submitted, setSubmitted] = useState<"accept" | "override" | null>(null);

  /* When the popup is opened from the live feed, the journal might already
   * be passed (no review needed). We hide override controls in that case. */
  const showOverride = data.verdict.tone !== "passed";

  if (submitted) {
    return (
      <div className="border-t border-white/[0.06] bg-primary/[0.04] px-6 py-3.5">
        <div className="flex items-center gap-2 text-[12px] tracking-tight text-primary-glow">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
          {submitted === "accept"
            ? `Action taken — "${data.proposedAction}" — recorded in audit evidence store.`
            : "Override submitted — agent will retrain on this journal."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] bg-white/[0.015] px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] tracking-tight text-foreground/70">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/40">
            Proposed action
          </span>
          <span className="text-foreground/30">·</span>
          <span className="font-medium text-foreground/95">{data.proposedAction}</span>
        </div>

        {showOverride && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSubmitted("accept")}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-glow/45 bg-primary-glow/[0.12] px-3 py-1.5 text-[11px] font-medium tracking-tight text-primary-glow transition-colors hover:border-primary-glow/65 hover:bg-primary-glow/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
            >
              <Check className="h-3 w-3" strokeWidth={2.4} />
              Accept proposal
            </button>
            <button
              type="button"
              onClick={() => overrideText.trim() && setSubmitted("override")}
              disabled={!overrideText.trim()}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60",
                overrideText.trim()
                  ? "border-amber-300/45 bg-amber-300/[0.10] text-amber-200 hover:border-amber-300/65 hover:bg-amber-300/[0.16]"
                  : "cursor-not-allowed border-white/[0.08] bg-white/[0.015] text-foreground/35",
              )}
            >
              Override with rationale
            </button>
          </div>
        )}

        {!showOverride && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] font-medium tracking-tight text-foreground/75 transition-colors hover:border-white/25 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
          >
            Close
          </button>
        )}
      </div>

      {showOverride && (
        <input
          type="text"
          value={overrideText}
          onChange={(e) => setOverrideText(e.target.value)}
          placeholder={
            source === "live-feed"
              ? "Override rationale (e.g. spoke to user, FX is correct…)"
              : "Override rationale (e.g. partner approved, escalation not needed…)"
          }
          className="w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[12px] tracking-tight text-foreground/90 placeholder:text-foreground/35 focus-visible:border-amber-300/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300/40"
        />
      )}
    </div>
  );
};

export default JournalDetailPopup;
