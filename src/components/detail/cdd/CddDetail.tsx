import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  ChevronDown,
  Clock,
  Database,
  FileText,
  Globe,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AGENT_RUN_LOG,
  CDD_META,
  CDD_TARGET,
  COMPETITORS,
  CONCENTRATION,
  GROWTH_DRIVERS,
  MARKET_SIZING,
  RED_FLAGS,
  type RedFlag,
} from "@/data/cdd";
import { useAppState } from "@/components/shell/AppStateContext";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const PIE_COLORS = [
  "hsl(var(--primary-glow))",
  "hsl(var(--category-agents))",
  "hsl(var(--category-technical))",
  "hsl(var(--category-advisory))",
  "hsl(var(--primary))",
  "hsl(0 0% 100% / 0.18)",
];

const CddDetail = () => {
  const { closeDetail } = useAppState();
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Workspace header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4 lg:px-10"
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
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
            </span>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
                Advisory accelerator
              </div>
              <div className="text-[13px] font-semibold tracking-tight text-foreground">
                Commercial Due Diligence
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 text-[11px] text-foreground/55 md:flex">
          <Clock className="h-3 w-3 text-foreground/45" strokeWidth={1.8} />
          {CDD_META.completedAgo}
          <span className="text-foreground/20">·</span>
          <Database className="h-3 w-3 text-foreground/45" strokeWidth={1.8} />
          {CDD_META.sourcesReviewed}
        </div>
      </motion.div>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-8 lg:px-10">
        <ProfileCard />

        <div className="mt-9">
          <Tabs defaultValue="market" className="w-full">
            <TabsList className="bg-white/[0.025] border border-white/[0.06] backdrop-blur-md">
              <TabsTrigger value="market">Market sizing</TabsTrigger>
              <TabsTrigger value="competitors">Competitive landscape</TabsTrigger>
              <TabsTrigger value="concentration">Customer concentration</TabsTrigger>
              <TabsTrigger value="growth">Growth drivers</TabsTrigger>
              <TabsTrigger value="flags">Red flags</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="mt-6">
              <MarketSizingTab />
            </TabsContent>
            <TabsContent value="competitors" className="mt-6">
              <CompetitorsTab />
            </TabsContent>
            <TabsContent value="concentration" className="mt-6">
              <ConcentrationTab />
            </TabsContent>
            <TabsContent value="growth" className="mt-6">
              <GrowthTab />
            </TabsContent>
            <TabsContent value="flags" className="mt-6">
              <FlagsTab />
            </TabsContent>
          </Tabs>
        </div>

        <AgentLog open={logOpen} onToggle={() => setLogOpen((v) => !v)} />
      </main>
    </div>
  );
};

/* ----------------------------- Profile card ----------------------------- */

const ProfileCard = () => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE }}
    className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 lg:p-8"
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 0% 0%, hsl(var(--primary-glow) / 0.12), transparent 60%)",
      }}
    />
    <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
          <Building2 className="h-3 w-3" strokeWidth={1.75} />
          Target company
        </div>
        <h1 className="mt-2 text-[1.85rem] font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-[2.1rem]">
          CDD Analysis: {CDD_TARGET.name}
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-foreground/55">
          {CDD_TARGET.subSector} · {CDD_TARGET.geography} · founded{" "}
          {CDD_TARGET.founded}.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 self-end sm:grid-cols-3">
        <Stat icon={Activity} label="Revenue" value={CDD_TARGET.revenue} />
        <Stat icon={TrendingUp} label="EBITDA" value={CDD_TARGET.ebitda} />
        <Stat icon={Sparkles} label="Margin" value={CDD_TARGET.ebitdaMargin} />
        <Stat icon={Globe} label="Geography" value={CDD_TARGET.hq} />
        <Stat icon={Users} label="Headcount" value={CDD_TARGET.headcount} />
        <Stat icon={FileText} label="Ownership" value={CDD_TARGET.ownership} />
      </dl>
    </div>
  </motion.section>
);

const Stat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) => (
  <div className="min-w-0">
    <dt className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
      <Icon className="h-3 w-3" strokeWidth={1.75} />
      {label}
    </dt>
    <dd className="mt-0.5 text-[12.5px] font-medium tabular-nums tracking-tight text-foreground/85">
      {value}
    </dd>
  </div>
);

/* ----------------------------- Market sizing ---------------------------- */

const MarketSizingTab = () => (
  <ChartCard
    title="Market sizing — TAM / SAM / SOM"
    subtitle="UK & Northern Europe 3PL freight market, £m, 7-year window with FY25–27 forecasts."
  >
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={MARKET_SIZING}
          margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="cdd-tam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="cdd-sam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--category-technical))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--category-technical))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="cdd-som" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--category-agents))" stopOpacity={0.45} />
              <stop offset="95%" stopColor="hsl(var(--category-agents))" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tick={{ fill: "hsl(0 0% 100% / 0.45)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(0 0% 100% / 0.1)" }}
          />
          <YAxis
            tick={{ fill: "hsl(0 0% 100% / 0.45)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(0 0% 100% / 0.1)" }}
            tickFormatter={(v: number) => `£${v >= 1000 ? `${(v / 1000).toFixed(1)}b` : `${v}m`}`}
          />
          <Tooltip content={<ChartTooltip suffix="m" />} />
          <Area
            type="monotone"
            dataKey="tam"
            stroke="hsl(var(--primary-glow))"
            strokeWidth={1.5}
            fill="url(#cdd-tam)"
            name="TAM"
          />
          <Area
            type="monotone"
            dataKey="sam"
            stroke="hsl(var(--category-technical))"
            strokeWidth={1.5}
            fill="url(#cdd-sam)"
            name="SAM"
          />
          <Area
            type="monotone"
            dataKey="som"
            stroke="hsl(var(--category-agents))"
            strokeWidth={2}
            fill="url(#cdd-som)"
            name="SOM (Meridian)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <ChartLegend
      items={[
        { color: "hsl(var(--primary-glow))", label: "TAM — total UK+NW Europe 3PL" },
        { color: "hsl(var(--category-technical))", label: "SAM — temp-controlled segment" },
        { color: "hsl(var(--category-agents))", label: "SOM — Meridian addressable" },
      ]}
    />
    <BulletList
      items={[
        {
          label: "TAM CAGR FY21–FY24",
          detail: "8.1% — driven by Brexit-led nearshoring and refrigerated demand growth.",
        },
        {
          label: "Meridian SOM CAGR",
          detail:
            "+15.6% FY21–FY24, projected to outpace SAM through FY27E on temp-controlled lane build-out.",
        },
      ]}
    />
  </ChartCard>
);

/* --------------------------- Competitive landscape ---------------------- */

const CompetitorsTab = () => (
  <ChartCard
    title="Competitive landscape"
    subtitle="Top 6 players in UK temp-controlled 3PL by FY24 revenue. Meridian highlighted."
  >
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={COMPETITORS}
          layout="vertical"
          margin={{ top: 10, right: 24, left: 8, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "hsl(0 0% 100% / 0.45)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(0 0% 100% / 0.1)" }}
            tickFormatter={(v: number) => `£${v}m`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "hsl(0 0% 100% / 0.65)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(0 0% 100% / 0.1)" }}
            width={170}
          />
          <Tooltip content={<ChartTooltip suffix="m" />} cursor={{ fill: "hsl(0 0% 100% / 0.04)" }} />
          <Bar dataKey="revenueGbpM" name="Revenue" radius={[0, 4, 4, 0]}>
            {COMPETITORS.map((c, i) => (
              <Cell
                key={i}
                fill={
                  c.highlight
                    ? "hsl(var(--primary-glow))"
                    : "hsl(var(--category-technical) / 0.55)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 overflow-x-auto rounded-lg border border-white/[0.07] bg-white/[0.012]">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-foreground/45">
            <th className="px-4 py-2.5 text-left font-medium">Player</th>
            <th className="px-4 py-2.5 text-right font-medium">Share</th>
            <th className="px-4 py-2.5 text-right font-medium">Revenue (£m)</th>
            <th className="px-4 py-2.5 text-right font-medium">3-yr growth</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {COMPETITORS.map((c) => (
            <tr
              key={c.name}
              className={cn(c.highlight && "bg-primary/[0.05] text-foreground")}
            >
              <td className="px-4 py-2.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-2",
                    c.highlight && "text-primary-glow",
                  )}
                >
                  {c.highlight && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-glow" />
                  )}
                  {c.name}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-foreground/75">
                {c.share.toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-foreground/75">
                £{c.revenueGbpM}m
              </td>
              <td
                className={cn(
                  "px-4 py-2.5 text-right tabular-nums",
                  c.growth3yPct < 0
                    ? "text-rose-300/85"
                    : c.growth3yPct >= 15
                      ? "text-emerald-300/95"
                      : "text-foreground/75",
                )}
              >
                {c.growth3yPct > 0 ? "+" : ""}
                {c.growth3yPct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ChartCard>
);

/* --------------------------- Customer concentration --------------------- */

const ConcentrationTab = () => (
  <ChartCard
    title="Customer concentration"
    subtitle="Top 5 customers as % of FY24 revenue. Tier-1 grocer dominates the book."
  >
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={CONCENTRATION}
              dataKey="value"
              nameKey="name"
              innerRadius={66}
              outerRadius={108}
              paddingAngle={2}
              stroke="hsl(225 50% 4%)"
              strokeWidth={2}
            >
              {CONCENTRATION.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip suffix="%" />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col justify-center gap-2.5">
        {CONCENTRATION.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center justify-between gap-3 rounded-md border border-white/[0.05] bg-white/[0.015] px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                aria-hidden
              />
              <span className="truncate text-[12px] tracking-tight text-foreground/85">
                {c.name}
              </span>
            </div>
            <span className="shrink-0 text-[12px] tabular-nums text-foreground/65">
              {c.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  </ChartCard>
);

/* ------------------------------ Growth drivers -------------------------- */

const GrowthTab = () => (
  <ChartCard
    title="Growth drivers"
    subtitle="What's compounding the +15.6% revenue CAGR through FY24."
  >
    <BulletList items={GROWTH_DRIVERS} />
  </ChartCard>
);

/* --------------------------------- Flags -------------------------------- */

const FlagsTab = () => (
  <ChartCard
    title="Red flags"
    subtitle="Issues the agent surfaced for partner review. None fatal — all merit deeper diligence."
  >
    <div className="flex flex-col gap-2.5">
      {RED_FLAGS.map((flag, i) => (
        <RedFlagRow key={i} flag={flag} />
      ))}
    </div>
  </ChartCard>
);

const SEV_TINT: Record<RedFlag["severity"], string> = {
  high: "text-rose-200 bg-rose-400/10 ring-rose-400/30",
  medium: "text-amber-200 bg-amber-300/10 ring-amber-300/30",
  low: "text-sky-200 bg-sky-300/10 ring-sky-300/25",
};

const RedFlagRow = ({ flag }: { flag: RedFlag }) => (
  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1",
          SEV_TINT[flag.severity],
        )}
      >
        <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.22em]",
              SEV_TINT[flag.severity].split(" ")[0],
            )}
          >
            {flag.severity}
          </span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/30">·</span>
          <span className="text-[12.5px] font-medium tracking-tight text-foreground">
            {flag.title}
          </span>
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/60">{flag.detail}</p>
      </div>
    </div>
  </div>
);

/* ------------------------------ Agent log ------------------------------- */

interface AgentLogProps {
  open: boolean;
  onToggle: () => void;
}

const AgentLog = ({ open, onToggle }: AgentLogProps) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
    className="mt-9 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.012]"
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60"
      aria-expanded={open}
    >
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/40">
          Agent run log
        </div>
        <div className="mt-0.5 text-[13px] tracking-tight text-foreground/85">
          {AGENT_RUN_LOG.length} steps · run completed in 4m 51s
        </div>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-foreground/55 transition-transform duration-300",
          open && "rotate-180 text-foreground/85",
        )}
      />
    </button>

    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="border-t border-white/[0.06]"
      >
        <ol
          className="px-5 py-4 font-mono text-[12px] leading-[1.7]"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" }}
        >
          {AGENT_RUN_LOG.map((line, i) => (
            <li key={i} className="flex items-baseline gap-3">
              <span className="w-12 shrink-0 tabular-nums text-foreground/35">{line.step}</span>
              <span
                className={cn(
                  "shrink-0 text-[10px] uppercase tracking-[0.18em]",
                  line.status === "flag" ? "text-amber-300/85" : "text-emerald-300/75",
                )}
              >
                {line.status === "flag" ? "flag" : "ok"}
              </span>
              <span className="text-foreground/70">{line.detail}</span>
            </li>
          ))}
        </ol>
        <div className="border-t border-white/[0.06] px-5 py-3 text-[11px] text-foreground/45">
          Source pack: {CDD_META.documentTypes.join(" · ")}
        </div>
      </motion.div>
    )}
  </motion.section>
);

/* --------------------------- Shared chart shell ------------------------- */

interface ChartCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: EASE }}
    className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 lg:p-7"
  >
    <header className="mb-5">
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/55">{subtitle}</p>
    </header>
    {children}
  </motion.section>
);

const ChartTooltip = ({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  suffix?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-background/95 px-3 py-2 text-[11px] shadow-xl backdrop-blur-xl">
      {label && (
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/45">
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="mt-1 flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-sm"
            style={{ backgroundColor: p.color }}
            aria-hidden
          />
          <span className="text-foreground/65">{p.name}</span>
          <span className="tabular-nums text-foreground/95">
            {suffix === "%"
              ? `${p.value?.toFixed(1)}%`
              : `£${p.value?.toLocaleString()}${suffix}`}
          </span>
        </div>
      ))}
    </div>
  );
};

const ChartLegend = ({ items }: { items: { color: string; label: string }[] }) => (
  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
    {items.map((it, i) => (
      <span key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/55">
        <span
          className="h-1.5 w-3 rounded-sm"
          style={{ backgroundColor: it.color }}
          aria-hidden
        />
        {it.label}
      </span>
    ))}
  </div>
);

const BulletList = ({
  items,
}: {
  items: { label: string; detail: string }[];
}) => (
  <ul className="mt-4 flex flex-col gap-3">
    {items.map((b, i) => (
      <li
        key={i}
        className="rounded-lg border border-white/[0.06] bg-white/[0.012] p-4"
      >
        <div className="flex items-baseline gap-3">
          <span
            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary-glow"
            aria-hidden
          />
          <div>
            <div className="text-[12.5px] font-medium tracking-tight text-foreground">
              {b.label}
            </div>
            <div className="mt-1 text-[12.5px] leading-relaxed text-foreground/60">
              {b.detail}
            </div>
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default CddDetail;
