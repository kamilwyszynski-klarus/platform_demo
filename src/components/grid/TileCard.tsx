import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { TileDef, TileStatus } from "@/data/tiles";
import { TILE_CATEGORY_LABELS } from "@/data/tiles";
import { categoryTintVar } from "./categoryTint";

const EASE = [0.16, 1, 0.3, 1] as const;
const HOVER_MS = 400;
const MAX_TILT = 5;
const LIFT_PX = 6;

interface TileCardProps {
  tile: TileDef;
  index: number;
  onClick: () => void;
}

/**
 * Adapted from `expert-ai-bloom`'s PlaybookTile. Keeps the cursor-tracked 3D
 * tilt + sheen, the lift-on-hover, and the category-tinted border glow.
 */
const TileCard = ({ tile, index, onClick }: TileCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const tint = categoryTintVar(tile.category);
  const Icon = tile.icon;

  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useMotionValue(50);
  const sy = useMotionValue(50);
  const rotateX = useTransform(ny, [-1, 1], [MAX_TILT, -MAX_TILT]);
  const rotateY = useTransform(nx, [-1, 1], [-MAX_TILT, MAX_TILT]);
  const sheenBackground = useTransform([sx, sy], (latest) => {
    const [x, y] = latest as number[];
    return `radial-gradient(circle 280px at ${x}px ${y}px, hsl(${tint} / 0.22), transparent 60%)`;
  });

  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      nx.set((px / rect.width) * 2 - 1);
      ny.set((py / rect.height) * 2 - 1);
      sx.set(px);
      sy.set(py);
    },
    [nx, ny, sx, sy, prefersReducedMotion],
  );

  const handleMouseEnter = useCallback(() => setHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    animate(nx, 0, { duration: HOVER_MS / 1000, ease: EASE });
    animate(ny, 0, { duration: HOVER_MS / 1000, ease: EASE });
  }, [nx, ny]);

  const liftAmount = prefersReducedMotion ? 3 : LIFT_PX;

  const restShadow = "0 0 0 0 rgba(0,0,0,0)";
  const hoverShadow = `0 ${liftAmount * 2}px ${liftAmount * 5}px -${liftAmount}px hsl(${tint} / 0.10)`;
  const restBorder = "hsl(0 0% 100% / 0.08)";
  const hoverBorder = `hsl(${tint} / 0.42)`;

  const innerStyle: Record<string, unknown> = {
    ["--tile-tint" as string]: `hsl(${tint})`,
  };
  if (!prefersReducedMotion) {
    innerStyle.rotateX = rotateX;
    innerStyle.rotateY = rotateY;
    innerStyle.transformStyle = "preserve-3d";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: EASE,
        delay: Math.min(index * 0.025, 0.4),
      }}
      style={prefersReducedMotion ? undefined : { perspective: 1000 }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          y: hovering ? -liftAmount : 0,
          boxShadow: hovering ? hoverShadow : restShadow,
          borderColor: hovering ? hoverBorder : restBorder,
        }}
        transition={{ duration: HOVER_MS / 1000, ease: EASE }}
        style={innerStyle}
        className={cn(
          "group relative block h-full w-full overflow-hidden rounded-2xl",
          "border bg-white/[0.02] p-6 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
          "cursor-pointer",
        )}
        aria-label={`Open ${tile.title}`}
      >
        {/* Cursor-tracked sheen */}
        {!prefersReducedMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ background: sheenBackground, mixBlendMode: "screen" }}
          />
        )}

        <div className="relative flex min-h-[180px] flex-col">
          <Icon
            aria-hidden
            strokeWidth={1.5}
            size={20}
            className={cn(
              "mb-5 transition-[color,opacity]",
              "text-foreground/65 group-hover:text-[color:var(--tile-tint)] group-hover:opacity-100",
            )}
            style={{
              transitionDuration: "400ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: `hsl(${tint} / 0.8)` }}
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">
              {TILE_CATEGORY_LABELS[tile.category]}
            </span>
          </div>

          <h3 className="mt-3.5 text-[1.05rem] font-semibold leading-[1.2] tracking-tight text-foreground">
            {tile.title}
          </h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/55">
            {tile.description}
          </p>

          <div className="mt-auto flex items-end justify-between pt-7">
            <span
              aria-hidden
              className="translate-y-1 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/0 transition-all group-hover:translate-y-0 group-hover:text-foreground/55"
              style={{
                transitionDuration: "400ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Open →
            </span>
            <StatusPill status={tile.status} />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};

const STATUS_COPY: Record<TileStatus, string> = {
  available: "Available",
  "coming-soon": "Coming soon",
  "contact-team": "Contact the team",
};

const StatusPill = ({ status }: { status: TileStatus }) => {
  const available = status === "available";
  const comingSoon = status === "coming-soon";

  return (
    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.22em] text-foreground/55">
      {available ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-glow/65 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-glow shadow-[0_0_8px_hsl(var(--primary-glow)/0.7)]" />
        </span>
      ) : (
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            comingSoon ? "bg-amber-300/55" : "bg-foreground/25",
          )}
        />
      )}
      {STATUS_COPY[status]}
    </span>
  );
};

export default TileCard;
