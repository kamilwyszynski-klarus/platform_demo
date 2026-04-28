import { motion } from "framer-motion";
import { Layers3, Server, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TileCategory } from "@/components/shell/types";
import { TILE_CATEGORY_LABELS } from "@/data/tiles";
import { categoryTintVar } from "./categoryTint";

const EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORY_ICONS: Record<TileCategory, LucideIcon> = {
  "advisory-accelerators": Sparkles,
  "technical-accelerators": Server,
  "client-deployable": Layers3,
};

const CATEGORIES: TileCategory[] = [
  "advisory-accelerators",
  "technical-accelerators",
  "client-deployable",
];

export type SidebarFilter = TileCategory | "all";

interface SidebarProps {
  active: SidebarFilter;
  counts: Record<TileCategory, number>;
  totalCount: number;
  onChange: (next: SidebarFilter) => void;
}

const Sidebar = ({ active, counts, totalCount, onChange }: SidebarProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
      className={cn(
        "sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[260px] shrink-0 flex-col",
        "border-r border-white/[0.06] bg-background/40 backdrop-blur-xl",
        "lg:flex",
      )}
    >
      <div className="flex flex-col gap-1 px-5 py-6">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/35">
          Catalog
        </div>
        <div className="text-[12px] text-foreground/55">
          Filter by capability type
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        <NavItem
          label="All capabilities"
          count={totalCount}
          active={active === "all"}
          onClick={() => onChange("all")}
        />
        <div className="my-2 mx-2 h-px bg-white/[0.06]" />
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const tint = categoryTintVar(cat);
          return (
            <NavItem
              key={cat}
              label={TILE_CATEGORY_LABELS[cat]}
              icon={Icon}
              tint={tint}
              count={counts[cat] ?? 0}
              active={active === cat}
              onClick={() => onChange(cat)}
            />
          );
        })}
      </nav>

      <div className="mt-auto px-5 pb-6 pt-8">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
            </span>
            Platform status
          </div>
          <div className="mt-1 text-[11px] leading-snug text-foreground/55">
            All systems operational. 3 agents currently active.
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

interface NavItemProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  tint?: string;
}

const NavItem = ({ label, count, active, onClick, icon: Icon, tint }: NavItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-2.5 overflow-hidden rounded-lg px-3 py-2 text-left",
      "transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
      active
        ? "bg-white/[0.05] text-foreground"
        : "text-foreground/65 hover:bg-white/[0.025] hover:text-foreground/90",
    )}
  >
    {/* Active indicator rail */}
    <span
      aria-hidden
      className={cn(
        "absolute inset-y-0 left-0 w-px transition-opacity",
        active ? "opacity-100" : "opacity-0",
      )}
      style={{
        background: tint
          ? `linear-gradient(to bottom, transparent 0%, hsl(${tint} / 0.85) 22%, hsl(${tint} / 0.85) 78%, transparent 100%)`
          : "linear-gradient(to bottom, transparent 0%, hsl(var(--primary-glow) / 0.7) 22%, hsl(var(--primary-glow) / 0.7) 78%, transparent 100%)",
      }}
    />

    {Icon ? (
      <Icon
        strokeWidth={1.6}
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-colors",
          active && tint ? "" : "text-foreground/55",
        )}
        style={active && tint ? { color: `hsl(${tint})` } : undefined}
      />
    ) : (
      <span className="h-3.5 w-3.5 shrink-0" aria-hidden />
    )}

    <span className="flex-1 text-[12px] font-medium tracking-tight">
      {label}
    </span>

    <span
      className={cn(
        "rounded-full px-1.5 py-px text-[10px] tabular-nums",
        active
          ? "bg-white/[0.08] text-foreground/85"
          : "bg-white/[0.03] text-foreground/45",
      )}
    >
      {count}
    </span>
  </button>
);

export default Sidebar;
