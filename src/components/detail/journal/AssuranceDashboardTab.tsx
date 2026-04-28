import { motion } from "framer-motion";
import { FileDown, Download, ShieldCheck, MoonStar } from "lucide-react";
import { Fragment } from "react";
import { DASHBOARD, type EvidenceRow } from "@/data/journal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Map an exception count to a graduated background colour: cool/neutral at
 *  zero, sage at low values, amber mid, rose hot. Hue interpolates smoothly
 *  from sage (140°) down through amber (35°) to rose (0°). */
const heatColour = (count: number, maxCount: number) => {
  if (count === 0) return "hsla(220, 15%, 60%, 0.05)";
  const t = Math.min(1, count / maxCount);
  const hue = 140 - t * 140;
  const sat = 22 + t * 55;
  const alpha = 0.18 + t * 0.5;
  return `hsla(${hue}, ${sat}%, 60%, ${alpha})`;
};

const AssuranceDashboardTab = () => {
  const maxBar = Math.max(...DASHBOARD.assertionCounts.map((a) => a.count));
  const heatmap = DASHBOARD.heatmap;
  const maxCount = Math.max(...heatmap.counts.flat());

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
            <ShieldCheck className="h-3 w-3 text-primary-glow" strokeWidth={1.8} />
            Assurance dashboard
          </div>
          <div className="text-[15px] font-semibold tracking-tight text-foreground">
            Acme Holdings — Q1 close
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DASHBOARD.stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.05 + i * 0.06 }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
              {stat.label}
            </div>
            <div className="mt-2 text-[28px] font-semibold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </div>
            <div className="mt-1 text-[11px] tracking-tight text-foreground/45">
              {stat.caption}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Exceptions by assertion */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
            Exceptions by assertion
          </div>
          <div className="text-[12px] tracking-tight text-foreground/55">
            this quarter
          </div>

          <ul className="mt-4 flex flex-col gap-2.5">
            {DASHBOARD.assertionCounts.map((row, i) => {
              const widthPct = Math.max(8, (row.count / maxBar) * 100);
              return (
                <li key={row.label} className="grid grid-cols-[1fr_36px] items-center gap-3">
                  <div>
                    <div className="mb-1 text-[11.5px] tracking-tight text-foreground/80">
                      {row.label}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.35 + i * 0.06 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary-glow"
                      />
                    </div>
                  </div>
                  <div className="text-right text-[12px] font-medium tabular-nums tracking-tight text-foreground/85">
                    {row.count}
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* Risk concentration heat-map — Posted by × GL Category */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
                Risk concentration
              </div>
              <div className="text-[12px] tracking-tight text-foreground/55">
                Posted by × GL Category · this quarter
              </div>
            </div>

            {/* After-hours stat callout — replaces posting time as a grid axis. */}
            <div className="flex items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/[0.06] px-2.5 py-1.5">
              <MoonStar className="h-3.5 w-3.5 text-amber-200/85" strokeWidth={1.6} />
              <div className="leading-tight">
                <div className="text-[16px] font-semibold tabular-nums tracking-tight text-amber-100">
                  {DASHBOARD.afterHoursPostings}
                </div>
                <div className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-amber-200/75">
                  After-hours postings
                </div>
              </div>
            </div>
          </div>

          {/* Heat-map grid: row labels (users) on the left, column labels
           *  (GL categories) on top, exception counts inside each cell. */}
          <div
            className="mt-4 grid gap-1"
            style={{
              gridTemplateColumns: `minmax(72px, auto) repeat(${heatmap.categories.length}, minmax(0, 1fr))`,
            }}
          >
            {/* Top-left corner spacer */}
            <div aria-hidden />
            {/* Column header — GL Category names */}
            {heatmap.categories.map((cat) => (
              <div
                key={`col-${cat}`}
                className="px-1 pb-1 text-center text-[9.5px] font-medium uppercase tracking-[0.14em] text-foreground/45"
              >
                {cat}
              </div>
            ))}

            {/* Rows — one per user */}
            {heatmap.users.map((user, r) => (
              <Fragment key={user}>
                <div className="flex items-center pr-2 text-[11px] tracking-tight text-foreground/70">
                  {user}
                </div>
                {heatmap.counts[r].map((count, c) => {
                  const idx = r * heatmap.categories.length + c;
                  return (
                    <motion.div
                      key={`${user}-${heatmap.categories[c]}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: EASE, delay: 0.4 + idx * 0.02 }}
                      className="flex aspect-square items-center justify-center rounded-sm text-[12px] font-medium tabular-nums tracking-tight text-foreground/90"
                      style={{ backgroundColor: heatColour(count, maxCount) }}
                      aria-label={`${user} · ${heatmap.categories[c]} · ${count} exception${count === 1 ? "" : "s"}`}
                    >
                      {count > 0 ? count : <span className="text-foreground/20">·</span>}
                    </motion.div>
                  );
                })}
              </Fragment>
            ))}
          </div>

          {/* Axis labels + colour scale */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10.5px] tracking-tight text-foreground/40">
            <span>
              <span className="text-foreground/55">Posted by</span>
              {" — "}
              <span className="text-foreground/55">GL Category</span>
            </span>
            <div className="flex items-center gap-2">
              <span>low</span>
              <div className="flex h-2 w-32 overflow-hidden rounded-sm">
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <span
                    key={n}
                    className="flex-1"
                    style={{ backgroundColor: heatColour(n, 6) }}
                  />
                ))}
              </div>
              <span>hot</span>
            </div>
          </div>

          <div className="mt-2 text-[10.5px] tracking-tight text-rose-200/80">
            M.Patel · concentrated in Intercompany &amp; FX
          </div>
        </motion.div>
      </div>

      {/* Audit evidence store */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
              Audit evidence store
            </div>
            <div className="text-[12px] tracking-tight text-foreground/55">
              every journal · every artefact · every decision
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExportButton icon={<FileDown className="h-3 w-3" strokeWidth={2} />} label="Control effectiveness PDF" />
            <ExportButton icon={<Download className="h-3 w-3" strokeWidth={2} />} label="Full evidence extract CSV" />
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-1 font-mono text-[12px] leading-relaxed tabular-nums text-foreground/75">
          {DASHBOARD.evidenceStore.map((row, i) => (
            <motion.li
              key={row.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.55 + i * 0.05 }}
              className="flex items-center gap-2"
            >
              <span>{row.id}</span>
              <span className="text-foreground/30">·</span>
              <EvidenceStatus status={row.status} />
              <span className="text-foreground/30">·</span>
              <span>{row.artefactCount} artefact{row.artefactCount === 1 ? "" : "s"}</span>
              <span className="text-foreground/30">·</span>
              <span>{row.decision}</span>
              <span className="text-foreground/30">·</span>
              <span className="text-foreground/45">{row.timestamp}</span>
            </motion.li>
          ))}
          <li className="text-foreground/30"> [...]</li>
        </ul>
      </motion.div>
    </div>
  );
};

const EvidenceStatus = ({ status }: { status: EvidenceRow["status"] }) => {
  const tone =
    status === "passed"
      ? "text-primary-glow"
      : status === "review"
        ? "text-amber-200"
        : "text-rose-200";
  return <span className={cn("font-medium", tone)}>{status}</span>;
};

const ExportButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button
    type="button"
    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] font-medium tracking-tight text-foreground/75 transition-colors duration-200 hover:border-white/25 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
  >
    {icon}
    {label}
  </button>
);

export default AssuranceDashboardTab;
