import { motion } from "framer-motion";
import { ChevronRight, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DETAIL_EXAMPLES,
  FEED_FILLER_POOL,
  FEED_HISTORY,
  FEED_INITIAL_TESTING,
  RISK_ENGINE_ASSERTIONS,
  type FeedRow,
  type FeedStatus,
} from "@/data/journal";
import { cn } from "@/lib/utils";
import type { JournalTab } from "./JournalDetail";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Total reveals for the scripted "pop in 3 extras then idle" cadence (Q4). */
const REVEAL_COUNT = 3;
/** Delay before the first new "testing" row appears. */
const FIRST_REVEAL_DELAY_MS = 5_500;
/** Spacing between subsequent reveals. */
const SUBSEQUENT_REVEAL_DELAY_MS = 5_000;

interface Props {
  onOpenJournal: (jeId: string) => void;
  onJumpToTab: (tab: JournalTab) => void;
}

const formatGbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_PILL: Record<FeedStatus, string> = {
  passed:
    "border-primary-glow/40 bg-primary-glow/[0.10] text-primary-glow",
  review:
    "border-amber-300/40 bg-amber-300/[0.10] text-amber-200",
  flagged:
    "border-rose-400/40 bg-rose-400/[0.10] text-rose-200",
  testing:
    "border-primary-glow/35 bg-primary-glow/[0.06] text-primary-glow/85",
};

const STATUS_LABEL: Record<FeedStatus, string> = {
  passed: "passed",
  review: "review",
  flagged: "flagged",
  testing: "· · · testing",
};

const LiveFeedTab = ({ onOpenJournal, onJumpToTab }: Props) => {
  /** revealCount is how many of the FILLER_POOL entries have been promoted in.
   *  - revealCount === 0 → topRow = FEED_INITIAL_TESTING (testing), history = FEED_HISTORY
   *  - revealCount === 1 → topRow = pool[0] (testing), history prepended with FEED_INITIAL_TESTING-as-passed
   *  - …
   *  After REVEAL_COUNT it stops; the topRow stays in testing forever. */
  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    if (revealCount >= REVEAL_COUNT) return;
    const delay = revealCount === 0 ? FIRST_REVEAL_DELAY_MS : SUBSEQUENT_REVEAL_DELAY_MS;
    const t = window.setTimeout(() => setRevealCount((c) => c + 1), delay);
    return () => window.clearTimeout(t);
  }, [revealCount]);

  /* Build the visible row sequence. */
  const topRow: FeedRow =
    revealCount === 0 ? FEED_INITIAL_TESTING : FEED_FILLER_POOL[revealCount - 1];

  /* The previously-testing rows that have already resolved to "passed". They
   * sit between topRow and FEED_HISTORY, newest first. */
  const resolvedRows: FeedRow[] = [];
  if (revealCount >= 1) {
    resolvedRows.push({ ...FEED_INITIAL_TESTING, status: "passed" });
  }
  for (let i = 0; i < revealCount - 1; i++) {
    resolvedRows.unshift({ ...FEED_FILLER_POOL[i], status: "passed" });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-6 lg:px-10">
      {/* Engagement context strip */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
            Engagement
          </div>
          <div className="text-[15px] font-semibold tracking-tight text-foreground">
            Acme Holdings — Q1 close
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] font-medium tracking-tight text-foreground/70 transition-colors hover:border-white/25 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
        >
          Q1 FY26
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </motion.div>

      {/* Two-column body */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Left: live feed */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary-glow" strokeWidth={1.6} />
              <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/45">
                Live feed
              </h2>
            </div>
            <span className="text-[10.5px] tabular-nums text-foreground/35">
              {resolvedRows.length + FEED_HISTORY.length} tested · 1 in flight
            </span>
          </div>

          <div className="flex flex-col divide-y divide-white/[0.04] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
            <FeedRowItem row={topRow} index={0} onOpen={onOpenJournal} />
            {resolvedRows.map((row, i) => (
              <FeedRowItem
                key={row.id}
                row={row}
                index={i + 1}
                onOpen={onOpenJournal}
              />
            ))}
            {FEED_HISTORY.map((row, i) => (
              <FeedRowItem
                key={row.id}
                row={row}
                index={resolvedRows.length + 1 + i}
                onOpen={onOpenJournal}
              />
            ))}
          </div>
        </motion.div>

        {/* Right: risk-engine rail */}
        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          <div>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/45">
              Risk engine
            </h2>
            <p className="mt-1 text-[11px] text-foreground/45">
              {RISK_ENGINE_ASSERTIONS.length} assertions running on every entry
            </p>
          </div>

          <ul className="flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-3">
            {RISK_ENGINE_ASSERTIONS.map((assertion, i) => (
              <motion.li
                key={assertion}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: 0.15 + i * 0.04 }}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[12px] text-foreground/75"
              >
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-glow/85"
                  aria-hidden
                />
                <span className="tracking-tight">{assertion}</span>
              </motion.li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => onJumpToTab("exceptions")}
            className="mt-1 inline-flex items-center justify-between rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2.5 text-left text-[11.5px] font-medium tracking-tight text-amber-200 transition-colors hover:border-amber-300/45 hover:bg-amber-300/[0.10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/70">
                Exceptions queue
              </span>
              <span>6 awaiting review · 3 high-severity</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </motion.aside>
      </div>
    </div>
  );
};

interface FeedRowProps {
  row: FeedRow;
  index: number;
  onOpen: (jeId: string) => void;
}

const FeedRowItem = ({ row, index, onOpen }: FeedRowProps) => {
  const isTesting = row.status === "testing";
  const isClickable = !isTesting && DETAIL_EXAMPLES[row.id] != null;

  return (
    <motion.button
      type="button"
      onClick={() => isClickable && onOpen(row.id)}
      disabled={!isClickable}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: Math.min(index * 0.04, 0.4) }}
      className={cn(
        "group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-200",
        isTesting && "cursor-default bg-primary/[0.04]",
        !isTesting && !isClickable && "cursor-default",
        isClickable &&
          "hover:bg-white/[0.03] focus-visible:outline-none focus-visible:bg-white/[0.04]",
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <span className="w-12 flex-shrink-0 text-[11px] tabular-nums text-foreground/40">
        {row.time}
      </span>

      <span className="w-[78px] flex-shrink-0 text-[11.5px] font-medium tabular-nums tracking-tight text-foreground/70">
        {row.id}
      </span>

      <span className="min-w-0 flex-1 truncate text-[12.5px] tracking-tight text-foreground/85">
        {row.narrative}
      </span>

      <span className="w-24 flex-shrink-0 text-right text-[12px] tabular-nums tracking-tight text-foreground/75">
        {formatGbp(row.amountGbp)}
      </span>

      <span className="hidden w-24 flex-shrink-0 text-[11px] tracking-tight text-foreground/45 md:block">
        {row.user}
      </span>

      <StatusPill status={row.status} />

      <ChevronRight
        className={cn(
          "h-3 w-3 flex-shrink-0 transition-opacity duration-200",
          isClickable
            ? "text-foreground/25 opacity-60 group-hover:opacity-100"
            : "opacity-0",
        )}
        strokeWidth={2}
      />
    </motion.button>
  );
};

const StatusPill = ({ status }: { status: FeedStatus }) => {
  const isTesting = status === "testing";
  return (
    <span
      className={cn(
        "relative inline-flex w-[88px] flex-shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
        STATUS_PILL[status],
      )}
    >
      {isTesting && (
        <span className="absolute -left-1 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-glow/70 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-glow/85" />
        </span>
      )}
      <span className={cn(isTesting && "ml-2")}>{STATUS_LABEL[status]}</span>
    </span>
  );
};

export default LiveFeedTab;
