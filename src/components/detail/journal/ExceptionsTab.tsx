import { motion } from "framer-motion";
import { ChevronRight, AlertTriangle, ArrowUpRight, UserCheck } from "lucide-react";
import { EXCEPTIONS, EXCEPTIONS_HEADER, type ExceptionFlag } from "@/data/journal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  onOpenJournal: (jeId: string) => void;
}

const formatGbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

const ExceptionsTab = ({ onOpenJournal }: Props) => {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-6 lg:px-10">
      {/* Header strip */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
            <AlertTriangle className="h-3 w-3 text-amber-200/85" strokeWidth={1.8} />
            Queue
          </div>
          <div className="text-[15px] font-semibold tracking-tight text-foreground">
            {EXCEPTIONS_HEADER.total} exceptions awaiting review
          </div>
          <div className="text-[11.5px] tracking-tight text-foreground/55">
            <span className="text-rose-200">{EXCEPTIONS_HEADER.highSeverity} high-severity</span>
            {" · "}
            oldest {EXCEPTIONS_HEADER.oldestAgo}
          </div>
        </div>
      </motion.div>

      {/* Queue list */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]"
      >
        <div className="grid grid-cols-[64px_72px_1fr_minmax(120px,auto)_minmax(180px,260px)_minmax(150px,180px)_24px] items-center gap-4 border-b border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/35">
          <span>Time</span>
          <span>Ref</span>
          <span>Narrative</span>
          <span className="text-right">Amount</span>
          <span>Flags</span>
          <span>Proposed action</span>
          <span aria-hidden />
        </div>

        <ul className="flex flex-col divide-y divide-white/[0.04]">
          {EXCEPTIONS.map((row, i) => {
            const isHigh = row.flags.some((f) => f.severity === "high");
            return (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.06 }}
              >
                <button
                  type="button"
                  onClick={() => onOpenJournal(row.id)}
                  className={cn(
                    "group grid w-full grid-cols-[64px_72px_1fr_minmax(120px,auto)_minmax(180px,260px)_minmax(150px,180px)_24px] items-center gap-4 px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:bg-white/[0.04]",
                  )}
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  <span className="text-[11px] tabular-nums text-foreground/40">
                    {row.time}
                  </span>
                  <span className="text-[11.5px] font-medium tabular-nums tracking-tight text-foreground/75">
                    {row.id}
                  </span>
                  <span className="min-w-0 truncate text-[12.5px] tracking-tight text-foreground/90">
                    {row.narrative}
                    <span className="ml-2 hidden text-[11px] text-foreground/40 lg:inline">
                      · {row.user}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-right text-[12px] tabular-nums tracking-tight",
                      isHigh ? "text-rose-100/95 font-medium" : "text-foreground/85",
                    )}
                  >
                    {formatGbp(row.amountGbp)}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {row.flags.map((flag) => (
                      <FlagPill key={flag.label} flag={flag} />
                    ))}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11.5px] tracking-tight text-foreground/70">
                    {row.proposedAction === "Escalate" ? (
                      <ArrowUpRight className="h-3 w-3 text-rose-200/85" strokeWidth={2} />
                    ) : (
                      <UserCheck className="h-3 w-3 text-amber-200/85" strokeWidth={2} />
                    )}
                    {row.proposedAction}
                  </span>
                  <ChevronRight className="h-3 w-3 text-foreground/25 opacity-60 transition-opacity group-hover:opacity-100" strokeWidth={2} />
                </button>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
        className="text-[11px] tracking-tight text-foreground/40"
      >
        Click any exception to inspect the journal, the evidence the agent
        gathered, and the assertion-by-assertion reasoning. Reviewers can
        accept the proposal or override.
      </motion.p>
    </div>
  );
};

const FlagPill = ({ flag }: { flag: ExceptionFlag }) => {
  const tone =
    flag.severity === "high"
      ? "border-rose-400/40 bg-rose-400/[0.10] text-rose-200"
      : "border-amber-300/40 bg-amber-300/[0.10] text-amber-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        tone,
      )}
    >
      {flag.label}
    </span>
  );
};

export default ExceptionsTab;
