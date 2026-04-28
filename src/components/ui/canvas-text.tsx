import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------- canvas text ------------------------------ */
/*
  Renders the given text entirely on a canvas: a soft sage base fill plus
  densely packed animated bezier curves, all clipped to the glyph shape.
  The HTML text underneath is kept `text-transparent` so the word is still
  in the DOM (selectable, copy-pasteable, accessible) while the canvas
  glyphs supply the visual.

  Can be called either as:

    <CanvasText>Expert</CanvasText>
    <CanvasText text="Expert" />

  Children takes precedence if both are provided. Children must be a plain
  string — the canvas needs a flat glyph string to render.
*/

interface CanvasTextProps {
  /** Text to render. Alternative to `children`. */
  text?: string;
  /** String child. Preferred over `text` when both are provided. */
  children?: string;
  className?: string;
  /**
   * Hex / rgb / hsl / css-var colour strings. Cycled across lines.
   * Defaults match the Klarus palette (sage-led with amber accents).
   */
  colors?: string[];
  /** Seconds per full animation cycle. */
  animationDuration?: number;
  /** Line stroke width in CSS pixels. */
  lineWidth?: number;
  /** Vertical gap between lines in CSS pixels. */
  lineGap?: number;
  /** Peak vertical amplitude of the bezier wobble. */
  curveIntensity?: number;
  /** Soft fill behind the lines so the glyph stays legible between strokes. */
  baseFill?: string;
  /** Global opacity multiplier applied to the curves (0–1). */
  lineOpacity?: number;
  /** Gaussian blur radius (CSS px) for the per-line glow. 0 disables. */
  lineGlow?: number;
  /**
   * Vertical fade grouping. Lines are bucketed into repeating groups of
   * this size; within each group the first line is fully opaque and each
   * subsequent line is slightly more transparent, resetting at the next
   * group. Creates a banded "stack-of-sheets" feel.
   */
  fadeGroupSize?: number;
  /**
   * Minimum alpha reached at the bottom of each fade group (0–1). The top
   * of the group is always 1. Default 0.35.
   */
  fadeGroupMin?: number;
}

// Sage-led balanced palette. Primary + primary-glow + primary-deep, a teal
// bridge from finance, and a single amber accent tuned to the hero's warm
// bottom-right bleed. Kept short so the cycle reads as sage with a hint of
// warmth rather than a rainbow.
const DEFAULT_COLORS = [
  "hsl(140, 22%, 60%)", // primary-glow (sage light)
  "hsl(140, 11%, 47%)", // primary (sage)
  "hsl(170, 14%, 55%)", // category-finance (teal-sage)
  "hsl(140, 22%, 60%)",
  "hsl(35, 70%, 60%)",  // accent (amber) — single warm note
  "hsl(150, 18%, 52%)", // sage mid (keeps the last stroke in group bright)
];

export const CanvasText = ({
  text,
  children,
  className,
  colors = DEFAULT_COLORS,
  animationDuration = 9,
  lineWidth = 1.1,
  lineGap = 4,
  curveIntensity = 22,
  baseFill = "hsl(140 22% 58% / 0.5)",
  lineOpacity = 0.7,
  lineGlow = 3,
  fadeGroupSize = 6,
  fadeGroupMin = 0.55,
}: CanvasTextProps) => {
  const resolvedText = typeof children === "string" ? children : text ?? "";

  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!canvas || !container || !measure || !resolvedText) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let font = "";
    let rafId = 0;
    const start = performance.now();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const rect = measure.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cs = window.getComputedStyle(measure);
      font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(measure);

    const onDpr = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resize();
    };
    window.addEventListener("resize", onDpr);

    const render = (now: number) => {
      if (width === 0 || height === 0) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const t = prefersReducedMotion
        ? 0
        : ((now - start) / 1000) / animationDuration;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, width, height);

      // Soft base fill so the glyph reads as a coherent shape even where
      // the lines happen to thin out. Clipped to the text at the end.
      ctx.fillStyle = baseFill;
      ctx.fillRect(0, 0, width, height);

      // Animated curved lines filling the full bounding box. A little
      // padding above and below so curves never reveal straight edges.
      const lineCount = Math.ceil(height / lineGap) + 6;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.globalAlpha = lineOpacity;

      if (lineGlow > 0) {
        ctx.shadowBlur = lineGlow;
      }

      const groupSize = Math.max(1, Math.floor(fadeGroupSize));
      const groupMin = Math.min(1, Math.max(0, fadeGroupMin));

      for (let i = 0; i < lineCount; i++) {
        const y = i * lineGap - lineGap * 3;
        // Small per-line phase offset so the band reads as a coherent
        // wave rather than independent strands crossing each other.
        const phase = t * Math.PI * 2 + i * 0.08;
        const color = colors[i % colors.length];

        // Grouped vertical fade: top of each group is full opacity, each
        // subsequent line steps down toward `groupMin`, then resets.
        const posInGroup = groupSize > 1 ? (i % groupSize) / (groupSize - 1) : 0;
        const groupAlpha = 1 - posInGroup * (1 - groupMin);
        ctx.globalAlpha = lineOpacity * groupAlpha;

        ctx.strokeStyle = color;
        if (lineGlow > 0) ctx.shadowColor = color;
        ctx.beginPath();
        ctx.moveTo(-20, y);
        ctx.bezierCurveTo(
          width * 0.33,
          y + Math.sin(phase) * curveIntensity,
          width * 0.66,
          y + Math.cos(phase + 0.6) * curveIntensity,
          width + 20,
          y,
        );
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Clip to the text shape. Draw the glyphs as an alpha mask; only the
      // pixels already painted (the curves) that overlap the glyphs survive.
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "#000";
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillText(resolvedText, 0, 0);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", onDpr);
    };
  }, [
    resolvedText,
    animationDuration,
    lineWidth,
    lineGap,
    curveIntensity,
    colors,
    baseFill,
    lineOpacity,
    lineGlow,
    fadeGroupSize,
    fadeGroupMin,
  ]);

  if (!resolvedText) return null;

  return (
    <span
      ref={containerRef}
      className={cn("relative inline-block align-baseline", className)}
    >
      {/* Real text — transparent so the canvas glyphs show through, but
          still present in the DOM for layout, selection, copy/paste, and
          screen readers. `text-transparent` (rather than `invisible`)
          keeps it selectable like the surrounding text. */}
      <span
        ref={measureRef}
        className="inline-block whitespace-pre text-transparent"
      >
        {resolvedText}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0"
      />
    </span>
  );
};

export default CanvasText;
