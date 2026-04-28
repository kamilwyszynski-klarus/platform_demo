import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import TopBar from "@/components/shell/TopBar";
import { useAppState } from "@/components/shell/AppStateContext";
import { TILES, TILE_CATEGORY_BLURBS } from "@/data/tiles";
import type { TileCategory } from "@/components/shell/types";
import Sidebar, { type SidebarFilter } from "./Sidebar";
import TileCard from "./TileCard";

const EASE = [0.16, 1, 0.3, 1] as const;

const GridScreen = () => {
  const { acceleratorTypes, industry, func, openTile } = useAppState();
  const [filter, setFilter] = useState<SidebarFilter>("all");

  const matchedTiles = useMemo(() => {
    return TILES.filter((tile) => {
      const matchesAccelerator = intersects(tile.accelerator_types, acceleratorTypes);
      const matchesIndustry = !industry || tile.industries.includes(industry);
      const matchesFunction = !func || tile.functions.includes(func);
      return matchesAccelerator && matchesIndustry && matchesFunction;
    }).sort((a, b) => {
      const aAvailable = a.status === "available";
      const bAvailable = b.status === "available";
      if (aAvailable !== bAvailable) return Number(bAvailable) - Number(aAvailable);
      return Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    });
  }, [acceleratorTypes, industry, func]);

  const counts = useMemo<Record<TileCategory, number>>(
    () => ({
      "advisory-accelerators": matchedTiles.filter(
        (t) => t.category === "advisory-accelerators",
      ).length,
      "technical-accelerators": matchedTiles.filter(
        (t) => t.category === "technical-accelerators",
      ).length,
      "client-deployable": matchedTiles.filter(
        (t) => t.category === "client-deployable",
      ).length,
    }),
    [matchedTiles],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? matchedTiles
        : matchedTiles.filter((t) => t.category === filter),
    [filter, matchedTiles],
  );

  const handleTileClick = (tileId: string) => {
    const tile = TILES.find((t) => t.id === tileId);
    if (!tile) return;
    if (tile.has_detail_screen && tile.status === "available") {
      openTile(tileId);
    } else {
      toast(`${tile.title}`, {
        description: "This accelerator is in active development. Contact the team to discuss.",
      });
    }
  };

  return (
    <div className="dark relative min-h-screen w-full bg-background text-foreground">
      <TopBar />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(140 30% 18% / 0.32), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 100%, hsl(35 50% 25% / 0.18), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen pt-14">
        <Sidebar
          active={filter}
          counts={counts}
          totalCount={matchedTiles.length}
          onChange={setFilter}
        />

        <main className="flex-1 px-5 py-8 sm:px-8 md:px-10 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-[1280px]">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mb-9"
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/40">
                <span>Workspace</span>
                {(industry || func) && (
                  <>
                    <span className="text-foreground/25">·</span>
                    <span className="text-foreground/55">
                      {industry ?? "All industries"}
                    </span>
                    <span className="text-foreground/25">·</span>
                    <span className="text-foreground/55">
                      {func ?? "All functions"}
                    </span>
                  </>
                )}
              </div>
              <h1 className="mt-3 text-[1.85rem] font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-[2.2rem]">
                {filter === "all"
                  ? "Your Klarus AI platform catalog."
                  : sectionTitleFor(filter)}
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-foreground/55">
                {filter === "all"
                  ? "Every accelerator, every agent. Pick a tile to open the workspace."
                  : TILE_CATEGORY_BLURBS[filter]}
              </p>
            </motion.div>

            {/* Mobile filter chips (sidebar hidden < lg) */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              <MobileFilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label="All"
                count={matchedTiles.length}
              />
              <MobileFilterChip
                active={filter === "advisory-accelerators"}
                onClick={() => setFilter("advisory-accelerators")}
                label="Advisory"
                count={counts["advisory-accelerators"]}
              />
              <MobileFilterChip
                active={filter === "technical-accelerators"}
                onClick={() => setFilter("technical-accelerators")}
                label="Technical"
                count={counts["technical-accelerators"]}
              />
              <MobileFilterChip
                active={filter === "client-deployable"}
                onClick={() => setFilter("client-deployable")}
                label="Client-deployable"
                count={counts["client-deployable"]}
              />
            </div>

            {/* Tile grid */}
            {visible.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
                {visible.map((tile, i) => (
                  <TileCard
                    key={tile.id}
                    tile={tile}
                    index={i}
                    onClick={() => handleTileClick(tile.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-sm text-foreground/55">
                No accelerators match this selection yet. Try All industry or All
                function to broaden the catalog.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const sectionTitleFor = (filter: TileCategory): string => {
  switch (filter) {
    case "advisory-accelerators":
      return "Advisory accelerators.";
    case "technical-accelerators":
      return "Technical accelerators.";
    case "client-deployable":
      return "Client-deployable.";
  }
};

const intersects = <T,>(left: T[], right: T[]) =>
  right.length > 0 && left.some((value) => right.includes(value));

interface MobileFilterChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

const MobileFilterChip = ({
  active,
  onClick,
  label,
  count,
}: MobileFilterChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium tracking-tight",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
      active
        ? "border-primary-glow/60 bg-primary/10 text-primary-glow"
        : "border-white/10 text-foreground/65 hover:border-white/25 hover:text-foreground/90",
    ].join(" ")}
  >
    {label}
    <span className="ml-2 text-[10px] tabular-nums opacity-60">{count}</span>
  </button>
);

export default GridScreen;
