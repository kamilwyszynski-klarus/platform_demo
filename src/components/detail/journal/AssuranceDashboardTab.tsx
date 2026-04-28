import { motion } from "framer-motion";
import { FileDown, Download, ShieldCheck } from "lucide-react";
import { DASHBOARD, type EvidenceRow } from "@/data/journal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const AssuranceDashboardTab = () => {
  const maxBar = Math.max(...DASHBOARD.assertionCounts.map((a) => a.count));

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

        {/* Risk concentration heat-map */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
            Risk concentration
          </div>
          <div className="text-[12px] tracking-tight text-foreground/55">
            heat-map · user × GL account × posting time
          </div>

          <div
            className="mt-4 grid gap-1"
            style={{ gridTemplateColumns: `repeat(${DASHBOARD.heatmap.cols}, minmax(0, 1fr))` }}
            aria-hidden
          >
            {DASHBOARD.heatmap.cells.map((intensity, idx) => {
              const isHotspot = idx === DASHBOARD.heatmap.hotspotIndex;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE, delay: 0.4 + idx * 0.012 }}
                  className={cn(
                    "aspect-square rounded-sm",
                    isHotspot && "ring-1 ring-rose-400/70 shadow-[0_0_16px_rgba(251,113,133,0.35)]",
                  )}
                  style={{
                    backgroundColor: isHotspot
                      ? `rgba(244, 113, 113, ${0.15 + intensity * 0.65})`
                      : `hsla(140, 22%, 60%, ${0.05 + intensity * 0.45})`,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[10.5px] tracking-tight text-foreground/40">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "hsla(140, 22%, 60%, 0.12)" }} />
                low
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "hsla(140, 22%, 60%, 0.45)" }} />
                medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "rgba(244, 113, 113, 0.55)" }} />
                hotspot
              </span>
            </div>
            <span className="text-rose-200/80">
              T.Banks · provisions · after-hours
            </span>
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
