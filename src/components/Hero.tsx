// Typeface: Inter (already loaded via index.html). No new fonts in this iteration.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CanvasText } from "@/components/ui/canvas-text";
import { cn } from "@/lib/utils";

type Combo = { industry: string; func: string };

const COMBOS: Combo[] = [
  { industry: "Financial Services", func: "Finance" },
  { industry: "Private Equity", func: "Legal" },
  { industry: "Technology", func: "Data & AI" },
  { industry: "Consumer", func: "Marketing" },
  { industry: "Industrials", func: "Procurement" },
  { industry: "Healthcare", func: "HR" },
  { industry: "Professional Services", func: "Sales" },
];

const ROTATE_MS = 4500;

/* ------------------------ ontology ribbon ----------------------- */
/*
  A slowly rotating torus rendered as a constellation of nodes
  connected by thin lines. Cursor acts as a local sage attractor.
  Combination changes fire a sonar-style pulse from the form's centre.
*/

interface RibbonProps {
  pulseKey: number;
  reducedOpacity?: boolean;
  disableCursor?: boolean;
}

type Node = {
  // torus parameterisation
  u: number; // around big ring
  v: number; // around tube
  // jitter / oscillation
  phase: number;
  jitter: number;
  // computed each frame
  sx: number;
  sy: number;
  depth: number;
  alpha: number;
};

export const Ribbon = ({ pulseKey, reducedOpacity, disableCursor }: RibbonProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const pulseRef = useRef({ t: 0, active: false });
  const rafRef = useRef<number>();

  useEffect(() => {
    if (pulseKey === 0) return;
    pulseRef.current = { t: performance.now(), active: true };
  }, [pulseKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let R = 0; // big radius
    let r = 0; // tube radius
    let nodes: Node[] = [];
    let neighbours: number[][] = [];

    const isMobile = () => window.innerWidth < 640;
    const isTablet = () => window.innerWidth < 1024;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = width * 0.5;
      cy = height * 0.5;
      const base = Math.min(width, height);
      R = base * 0.32;
      r = base * 0.11;

      const uSteps = isMobile() ? 44 : isTablet() ? 64 : 88;
      const vSteps = isMobile() ? 8 : isTablet() ? 11 : 14;

      nodes = [];
      for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
          nodes.push({
            u: (i / uSteps) * Math.PI * 2,
            v: (j / vSteps) * Math.PI * 2,
            phase: Math.random() * Math.PI * 2,
            jitter: 0.6 + Math.random() * 0.8,
            sx: 0,
            sy: 0,
            depth: 0,
            alpha: 0,
          });
        }
      }

      // precompute ring neighbours along u (next i, same j)
      neighbours = nodes.map((_, idx) => {
        const i = Math.floor(idx / vSteps);
        const j = idx % vSteps;
        const nextI = (i + 1) % uSteps;
        return [nextI * vSteps + j];
      });
    };

    build();
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      build();
    };
    window.addEventListener("resize", onResize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    if (!disableCursor) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseleave", onLeave);
    }

    const ATTRACT_RADIUS = disableCursor || isMobile() ? 0 : 130;
    const ATTRACT_RADIUS_SQ = ATTRACT_RADIUS * ATTRACT_RADIUS;
    const baseOpacity = reducedOpacity ? 0.4 : 1;

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = now * 0.001;

      // Soft amber bleed at outer edge of form (very subtle, only outer wash)
      const bleed = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.9);
      bleed.addColorStop(0, "rgba(212,165,116,0)");
      bleed.addColorStop(0.55, "rgba(212,165,116,0.05)");
      bleed.addColorStop(1, "rgba(212,165,116,0)");
      ctx.fillStyle = bleed;
      ctx.fillRect(0, 0, width, height);

      // slow rotation: ~one cycle every 38s
      const rotY = t * ((Math.PI * 2) / 38);
      const rotX = Math.sin(t * 0.06) * 0.35 + 0.45;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // pulse
      let pulseR = 0;
      let pulseStrength = 0;
      if (pulseRef.current.active) {
        const elapsed = (now - pulseRef.current.t) / 1000;
        if (elapsed > 0.85) {
          pulseRef.current.active = false;
        } else {
          pulseR = elapsed * R * 4.0;
          pulseStrength = Math.max(0, 1 - elapsed / 0.85);
        }
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cursorActive = mouseRef.current.active && ATTRACT_RADIUS > 0;

      // project nodes
      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k];
        const osc = Math.sin(t * 0.9 + n.phase) * n.jitter;
        const rr = r + osc * 0.6;
        // torus -> 3D
        const x3 = (R + rr * Math.cos(n.v)) * Math.cos(n.u);
        const y3 = rr * Math.sin(n.v);
        const z3 = (R + rr * Math.cos(n.v)) * Math.sin(n.u);
        // rotate Y
        const xr = x3 * cosY - z3 * sinY;
        const zr = x3 * sinY + z3 * cosY;
        // rotate X
        const yr = y3 * cosX - zr * sinX;
        const zr2 = y3 * sinX + zr * cosX;
        // perspective
        const persp = 800 / (800 + zr2);
        n.sx = cx + xr * persp;
        n.sy = cy + yr * persp;
        n.depth = (zr2 + R * 1.5) / (R * 3); // 0..1 roughly

        // density / fade by depth — sparser-feeling at edges
        const depthAlpha = 0.35 + n.depth * 0.55;

        // distance to centre on screen (for outer-edge fade)
        const ddx = n.sx - cx;
        const ddy = n.sy - cy;
        const dCenter = Math.sqrt(ddx * ddx + ddy * ddy);
        const edgeFade = 1 - Math.min(1, Math.max(0, (dCenter - R * 0.7) / (R * 1.3)));
        n.alpha = depthAlpha * (0.55 + 0.45 * edgeFade) * baseOpacity;
      }

      /* ---- draw connecting lines (along u ring) ---- */
      ctx.lineWidth = 0.6;
      for (let k = 0; k < nodes.length; k++) {
        const a = nodes[k];
        const targets = neighbours[k];
        for (let ti = 0; ti < targets.length; ti++) {
          const b = nodes[targets[ti]];
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const segLen = Math.sqrt(dx * dx + dy * dy);
          if (segLen > 90) continue; // skip wrap-around stretches
          const breath = 0.14 + Math.sin(t * 0.7 + a.phase) * 0.05;
          let lineA = Math.min(a.alpha, b.alpha) * breath * 1.4;

          // cursor brightening on segments
          if (cursorActive) {
            const midX = (a.sx + b.sx) * 0.5;
            const midY = (a.sy + b.sy) * 0.5;
            const cdx = midX - mx;
            const cdy = midY - my;
            const cd2 = cdx * cdx + cdy * cdy;
            if (cd2 < ATTRACT_RADIUS_SQ) {
              const f = 1 - Math.sqrt(cd2) / ATTRACT_RADIUS;
              lineA = Math.min(0.65, lineA + f * 0.45);
            }
          }

          // pulse brightening
          if (pulseRef.current.active) {
            const midX = (a.sx + b.sx) * 0.5;
            const midY = (a.sy + b.sy) * 0.5;
            const pdx = midX - cx;
            const pdy = midY - cy;
            const pd = Math.sqrt(pdx * pdx + pdy * pdy);
            const band = Math.abs(pd - pulseR);
            if (band < 60) {
              const k2 = (1 - band / 60) * pulseStrength;
              lineA = Math.min(0.85, lineA + k2 * 0.5);
            }
          }

          ctx.strokeStyle = `rgba(255,255,255,${lineA})`;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
      }

      /* ---- cursor sage glow halo ---- */
      if (cursorActive) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, ATTRACT_RADIUS);
        glow.addColorStop(0, "rgba(140,170,150,0.22)");
        glow.addColorStop(0.5, "rgba(140,170,150,0.08)");
        glow.addColorStop(1, "rgba(140,170,150,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(mx - ATTRACT_RADIUS, my - ATTRACT_RADIUS, ATTRACT_RADIUS * 2, ATTRACT_RADIUS * 2);
      }

      /* ---- draw nodes ---- */
      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k];
        let alpha = Math.min(0.85, 0.5 + n.alpha * 0.4);
        let radius = 0.9 + n.depth * 0.9;
        let useColor = `rgba(255,255,255,${alpha})`;

        // cursor attractor
        if (cursorActive) {
          const dx = n.sx - mx;
          const dy = n.sy - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < ATTRACT_RADIUS_SQ) {
            const dist = Math.sqrt(d2);
            const f = 1 - dist / ATTRACT_RADIUS;
            // pull subtly toward cursor
            const pull = f * 9;
            n.sx -= (dx / (dist || 1)) * pull;
            n.sy -= (dy / (dist || 1)) * pull;
            alpha = Math.min(1, alpha + f * 0.3);
            radius += f * 1.2;
            // sage glow on near nodes
            const sg = Math.floor(180 + 60 * (1 - f));
            useColor = `rgba(${Math.floor(160 + 60 * (1 - f))}, ${sg}, ${Math.floor(170 + 50 * (1 - f))}, ${alpha})`;
          }
        }

        // pulse highlight
        if (pulseRef.current.active) {
          const pdx = n.sx - cx;
          const pdy = n.sy - cy;
          const pd = Math.sqrt(pdx * pdx + pdy * pdy);
          const band = Math.abs(pd - pulseR);
          if (band < 50) {
            const k2 = (1 - band / 50) * pulseStrength;
            alpha = Math.min(1, alpha + k2 * 0.6);
            radius += k2 * 1.5;
            useColor = `rgba(255,255,255,${alpha})`;
          }
        }

        ctx.beginPath();
        ctx.arc(n.sx, n.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = useColor;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      if (!disableCursor) {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [reducedOpacity, disableCursor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
};

/* ---------------------------- hero ------------------------------ */

const fade = {
  initial: { opacity: 0, y: 14, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};
const ease = [0.16, 1, 0.3, 1] as const;

interface ChipProps {
  value: string;
  ariaLabel: string;
}

const Chip = ({ value, ariaLabel }: ChipProps) => {
  return (
    <span
      role="text"
      aria-label={`${ariaLabel}: ${value}`}
      aria-live="polite"
      className={cn(
        "relative inline-flex items-baseline align-baseline",
        "px-1 -mx-1 text-foreground",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-1 -bottom-0.5 h-px bg-foreground/30"
        style={{
          backgroundImage: "linear-gradient(to right, currentColor 60%, transparent 0)",
          backgroundSize: "5px 1px",
          backgroundRepeat: "repeat-x",
        }}
      />
      <span className="relative inline-block">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "0.5em", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-0.5em", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block whitespace-nowrap"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};

// Sonar pulse fires once on mount so the ribbon visibly "wakes up" when the
// landing screen renders. No auto-rotation in presentation mode — selection
// happens explicitly on the next screen.
const Hero = () => {
  const [comboIndex, setComboIndex] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const combo: Combo = COMBOS[comboIndex];

  useEffect(() => {
    const id = window.setInterval(() => {
      setComboIndex((i) => (i + 1) % COMBOS.length);
      setPulseKey((k) => k + 1);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="dark relative isolate min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Atmospheric gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-atmosphere)" }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 50%, transparent 40%, hsl(225 50% 3% / 0.7) 100%)",
        }}
      />

      {/* ---------- Mobile (<640px): ribbon sits behind text, ~30% opacity, no cursor ---------- */}
      <div className="pointer-events-none absolute inset-0 opacity-75 sm:hidden">
        <Ribbon pulseKey={pulseKey} reducedOpacity disableCursor />
      </div>

      {/* ---------- Tablet (640–1023px): stacked — ribbon occupies the bottom 55vh ---------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[55vh] sm:block lg:hidden">
        <Ribbon pulseKey={pulseKey} />
      </div>

      {/* ---------- Desktop (≥1024px): single wide canvas, centre at ~70% viewport X, 55% Y, bleeds off right and slightly off bottom ---------- */}
      {/* Container: left 15% → right -25% viewport → canvas width 110vw, centre X at 70vw.
          top 0 → bottom -12vh → canvas height 112vh, centre Y at ~56vh. No overflow-hidden
          on this wrapper — the outer <section> already clips to prevent horizontal page scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute hidden lg:block"
        style={{ top: 0, bottom: "-12vh", left: "15%", right: "-25%" }}
      >
        <Ribbon pulseKey={pulseKey} />
      </div>

      {/* Desktop amber glow behind the ribbon's outer bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse 45% 45% at 88% 85%, hsl(32 60% 55% / 0.13), transparent 65%)",
        }}
      />

      {/* Desktop left-mask: keeps the text column clean of ribbon nodes and dissolves
          any residual canvas edge. Covers 55vw, solid up to 30%, transparent by 100%. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] lg:block"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background)) 30%, hsl(var(--background) / 0.6) 65%, transparent 100%)",
        }}
      />

      {/* Top hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-[2] h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
      />

      {/* ---------- Content grid — 40% text / 60% animation on desktop ---------- */}
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)]">
        {/* LEFT — text column, anchored below the top bar */}
        <div className="flex flex-col justify-start px-6 pt-[20vh] pb-24 sm:px-10 lg:pl-[8vw] lg:pr-6 lg:pt-[24vh]">
          {/* Eyebrow pill */}
          <motion.div
            {...fade}
            transition={{ duration: 0.6, ease, delay: 0.06 }}
            className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.03] px-3.5 py-1.5 backdrop-blur-md"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/50 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/70" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">
              Experts <span className="mx-1 text-foreground/50">×</span> AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fade}
            transition={{ duration: 0.7, ease, delay: 0.14 }}
            className="text-balance text-[2.6rem] font-bold leading-[1.02] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.4rem] xl:text-[5rem]"
          >
            <span className="block">
              <CanvasText>Expert</CanvasText>
              <span> AI for</span>
            </span>
            <span className="mt-2 block leading-[1.1]">
              <Chip value={combo.industry} ariaLabel="Industry" />{" "}
              <Chip value={combo.func} ariaLabel="Function" />
              <span className="text-foreground">.</span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fade}
            transition={{ duration: 0.7, ease, delay: 0.22 }}
            className="mt-7 max-w-md text-balance text-base leading-relaxed tracking-[0.005em] text-foreground/70 sm:text-lg md:text-[1.18rem]"
          >
            One platform. Human expertise directing AI delivery.
          </motion.p>
        </div>

        {/* RIGHT — reserved for animation on desktop. Empty on mobile. */}
        <div className="hidden lg:block" aria-hidden />
      </div>

      {/* Bottom hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
      />
    </section>
  );
};

export default Hero;
