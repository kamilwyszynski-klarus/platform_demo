import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  ListFilter,
  Rocket,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import TopBar from "@/components/shell/TopBar";
import { useAppState } from "@/components/shell/AppStateContext";
import { INDUSTRIES } from "@/data/industries";
import { FUNCTIONS } from "@/data/functions";
import type { AcceleratorType, Func, Industry } from "@/components/shell/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTO_ADVANCE_MS = 280;

const ACCELERATOR_TYPES: Array<{
  id: AcceleratorType;
  label: string;
  blurb: string;
  icon: LucideIcon;
}> = [
  {
    id: "advisory-accelerators",
    label: "Advisory accelerators",
    blurb: "Frameworks and playbooks that augment expert judgement.",
    icon: BookOpen,
  },
  {
    id: "technical-accelerators",
    label: "Technical accelerators",
    blurb: "Engineering tools that compress build cycles.",
    icon: Wrench,
  },
  {
    id: "client-deployable",
    label: "Client-deployable",
    blurb: "Agents and systems we deploy into client environments.",
    icon: Rocket,
  },
];

const SelectionScreen = () => {
  const {
    user,
    acceleratorTypes,
    industry,
    industrySelectionMade,
    func,
    funcSelectionMade,
    toggleAcceleratorType,
    setIndustry,
    setFunc,
    confirmContext,
  } = useAppState();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const paneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [edgeFade, setEdgeFade] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const RAMP = 64;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) {
        setEdgeFade({ left: 0, right: 0 });
        return;
      }
      setEdgeFade({
        left: Math.min(1, el.scrollLeft / RAMP),
        right: Math.min(1, (max - el.scrollLeft) / RAMP),
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "there";
  const acceleratorValue = useMemo(
    () =>
      ACCELERATOR_TYPES.filter((def) => acceleratorTypes.includes(def.id))
        .map((def) => def.label.replace(" accelerators", ""))
        .join(" + "),
    [acceleratorTypes],
  );

  const industryDone = industrySelectionMade;
  const functionDone = funcSelectionMade;
  const acceleratorDone = acceleratorTypes.length > 0;
  const ready = industryDone && functionDone && acceleratorDone;

  const scrollToPane = useCallback((index: number) => {
    window.setTimeout(() => {
      paneRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }, AUTO_ADVANCE_MS);
  }, []);

  const handleIndustrySelect = (next: Industry | null) => {
    const shouldAdvance = !industrySelectionMade;
    setIndustry(next);
    if (shouldAdvance) scrollToPane(2);
  };

  const handleFunctionSelect = (next: Func | null) => {
    setFunc(next);
  };

  const handleAcceleratorToggle = (next: AcceleratorType) => {
    const shouldAdvance = acceleratorTypes.length === 0;
    toggleAcceleratorType(next);
    if (shouldAdvance) scrollToPane(1);
  };

  return (
    <div className="dark relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <TopBar />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-atmosphere)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 30%, transparent 35%, hsl(225 50% 3% / 0.55) 100%)",
        }}
      />

      <main className="relative z-10 mx-auto flex h-[100dvh] min-h-[100dvh] w-full max-w-[1280px] flex-col px-6 pb-4 pt-[calc(3.5rem+1.2vh)] sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-glow/60 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-glow/80" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/55">
              Set your context
            </span>
          </div>
          <h1 className="mt-3 text-[2.05rem] font-bold leading-[1.05] tracking-[-0.02em] text-foreground md:text-[2.55rem]">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/60">
            Tell the platform how you're working today. Your accelerator type,
            industry and function shape what we surface next.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.12 }}
          className="mt-4 flex items-center gap-5 border-y border-white/[0.06] py-3"
        >
          <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5 pr-4">
            <StepIndicator
              index={1}
              label="Accelerator Type"
              value={acceleratorDone ? acceleratorValue : null}
              done={acceleratorDone}
              active={!acceleratorDone}
            />
            <StepConnector lit={acceleratorDone} />
            <StepIndicator
              index={2}
              label="Industry"
              value={industryDone ? industry ?? "All" : null}
              done={industryDone}
              active={acceleratorDone && !industryDone}
            />
            <StepConnector lit={industryDone} />
            <StepIndicator
              index={3}
              label="Function"
              value={functionDone ? func ?? "All" : null}
              done={functionDone}
              active={industryDone && !functionDone}
            />
          </div>

          <motion.button
            type="button"
            onClick={confirmContext}
            disabled={!ready}
            whileTap={ready ? { scale: 0.98 } : undefined}
            className={cn(
              "group relative inline-flex shrink-0 items-center justify-center gap-2",
              "rounded-full px-5 py-2.5 text-sm font-medium tracking-tight",
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/70",
              ready
                ? cn(
                    "text-primary-foreground",
                    "bg-[linear-gradient(135deg,hsl(var(--primary-deep)),hsl(var(--primary)))]",
                    "shadow-[var(--shadow-sage)]",
                    "hover:translate-y-[-1px] hover:shadow-[0_14px_50px_-10px_hsl(var(--primary)/0.6),0_0_0_1px_hsl(var(--primary-glow)/0.35)_inset]",
                  )
                : "cursor-not-allowed border border-white/10 bg-white/[0.02] text-foreground/35 opacity-55",
            )}
          >
            <span>Enter platform</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.25}
            />
          </motion.button>
        </motion.div>

        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-40 w-32 bg-background backdrop-blur-md transition-opacity duration-200 ease-out"
            style={{
              opacity: edgeFade.left,
              maskImage: "linear-gradient(to right, black, transparent)",
              WebkitMaskImage: "linear-gradient(to right, black, transparent)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-40 w-32 bg-background backdrop-blur-md transition-opacity duration-200 ease-out"
            style={{
              opacity: edgeFade.right,
              maskImage: "linear-gradient(to left, black, transparent)",
              WebkitMaskImage: "linear-gradient(to left, black, transparent)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-5 bg-gradient-to-b from-background/85 via-background/40 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-background via-background/75 to-transparent backdrop-blur-[2px]"
          />
          <div
            ref={scrollRef}
            className="flex h-full min-h-0 snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden scroll-pl-32 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Pane
              refCallback={(node) => {
                paneRefs.current[0] = node;
              }}
              step="01"
              label="Accelerator Type"
              description="Select one or more accelerator types for this working session."
              state={acceleratorDone ? "complete" : "active"}
              value={acceleratorDone ? acceleratorValue : null}
              hideValueLabel
              compact
            >
              <div className="grid max-w-md grid-cols-1 gap-1.5">
                {ACCELERATOR_TYPES.map((def, i) => (
                  <SelectionCard
                    key={def.id}
                    index={i}
                    label={def.label}
                    blurb={def.blurb}
                    icon={def.icon}
                    active={acceleratorTypes.includes(def.id)}
                    onClick={() => handleAcceleratorToggle(def.id)}
                    mode="checkbox"
                  />
                ))}
              </div>
            </Pane>

            <Pane
              refCallback={(node) => {
                paneRefs.current[1] = node;
              }}
              step="02"
              label="Industry"
              description="Choose the sector this engagement sits in, or select All to keep the catalog broad."
              state={!acceleratorDone ? "locked" : industryDone ? "complete" : "active"}
              value={industryDone ? industry ?? "All" : null}
            >
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                <SelectionCard
                  index={0}
                  label="All"
                  blurb="No industry filter."
                  icon={ListFilter}
                  active={industrySelectionMade && industry === null}
                  onClick={() => handleIndustrySelect(null)}
                />
                {INDUSTRIES.map((def, i) => (
                  <SelectionCard
                    key={def.id}
                    index={i + 1}
                    label={def.label}
                    blurb={def.blurb}
                    icon={def.icon}
                    active={industry === def.id}
                    onClick={() => handleIndustrySelect(def.id as Industry)}
                  />
                ))}
              </div>
            </Pane>

            <Pane
              refCallback={(node) => {
                paneRefs.current[2] = node;
              }}
              step="03"
              label="Function"
              description="Choose the functional lens, or select All to avoid applying a function filter."
              state={!industryDone ? "locked" : functionDone ? "complete" : "active"}
              value={functionDone ? func ?? "All" : null}
            >
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                <SelectionCard
                  index={0}
                  label="All"
                  blurb="Show every function."
                  icon={ListFilter}
                  active={funcSelectionMade && func === null}
                  onClick={() => handleFunctionSelect(null)}
                />
                {FUNCTIONS.map((def, i) => (
                  <SelectionCard
                    key={def.id}
                    index={i + 1}
                    label={def.label}
                    blurb={def.blurb}
                    icon={def.icon}
                    active={func === def.id}
                    onClick={() => handleFunctionSelect(def.id as Func)}
                  />
                ))}
              </div>
            </Pane>
          </div>
        </div>
      </main>
    </div>
  );
};

interface StepIndicatorProps {
  index: number;
  label: string;
  value: string | null;
  done: boolean;
  active: boolean;
}

const StepIndicator = ({ index, label, value, done, active }: StepIndicatorProps) => (
  <div className="flex min-w-0 shrink items-center gap-2.5">
    <span
      className={cn(
        "shrink-0 text-[13px] font-semibold tracking-tight transition-colors duration-300",
        done ? "text-primary-glow" : active ? "text-foreground/85" : "text-foreground/35",
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.7} /> : `${index}.`}
    </span>
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="text-[9.5px] font-medium uppercase tracking-[0.2em] text-foreground/40">
        {label}
      </span>
      <span
        className={cn(
          "truncate text-[12.5px] font-medium tracking-tight transition-colors duration-300",
          value
            ? "text-foreground/95"
            : active
              ? "text-foreground/55"
              : "text-foreground/30",
        )}
      >
        {value ?? "Pending"}
      </span>
    </div>
  </div>
);

const StepConnector = ({ lit }: { lit: boolean }) => (
  <div className="relative h-px w-6 shrink-0 overflow-hidden">
    <div
      className={cn(
        "absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        lit
          ? "bg-gradient-to-r from-primary-glow/55 via-primary-glow/35 to-white/[0.08]"
          : "bg-white/[0.07]",
      )}
    />
  </div>
);

type PaneState = "active" | "complete" | "locked";

interface PaneProps {
  refCallback: (node: HTMLDivElement | null) => void;
  step: string;
  label: string;
  description: string;
  state: PaneState;
  value: string | null;
  children: ReactNode;
  hideValueLabel?: boolean;
  compact?: boolean;
}

const Pane = ({
  refCallback,
  step,
  label,
  description,
  state,
  value,
  children,
  hideValueLabel = false,
  compact = false,
}: PaneProps) => (
  <motion.section
    ref={refCallback}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
    className={cn(
      "relative flex h-full shrink-0 flex-col overflow-hidden p-3",
      compact
        ? "w-[calc(100%-2.5rem)] snap-end sm:w-[30rem]"
        : "w-[calc(100%-2.5rem)] snap-start sm:w-[82%] lg:w-[72%]",
      "border border-transparent bg-transparent",
      "transition-[filter,opacity,transform,border-color] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
      state === "active" && "opacity-100 blur-0",
      state === "complete" && "opacity-50 blur-0",
      state === "locked" &&
        "pointer-events-none select-none opacity-[0.18] blur-[3px]",
    )}
  >
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/35">
          {step} · {label}
        </div>
        <h2 className="mt-1.5 text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {label}
        </h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-foreground/50">
          {description}
        </p>
      </div>
      {!hideValueLabel && (
        <div className="shrink-0 text-right text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/30">
          {value ? <span className="text-primary-glow/85">{value}</span> : "Pending"}
        </div>
      )}
    </div>
    <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
  </motion.section>
);

interface SelectionCardProps {
  index: number;
  label: string;
  blurb: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  mode?: "radio" | "checkbox";
  lead?: boolean;
}

const SelectionCard = ({
  index,
  label,
  blurb,
  icon: Icon,
  active,
  onClick,
  mode = "radio",
  lead = false,
}: SelectionCardProps) => (
  <motion.button
    type="button"
    role={mode}
    aria-checked={active}
    onClick={onClick}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: EASE, delay: 0.2 + index * 0.035 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "group relative flex flex-col items-start rounded-xl border text-left",
      "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
      lead ? "gap-2 p-4" : "gap-1 p-2",
      active
        ? cn(
            "border-primary-glow/60 bg-primary/[0.08]",
            lead
              ? "shadow-[0_10px_36px_-12px_hsl(var(--primary)/0.7),0_0_0_1px_hsl(var(--primary-glow)/0.5)_inset,0_0_28px_hsl(var(--primary-glow)/0.08)_inset]"
              : "shadow-[0_8px_28px_-12px_hsl(var(--primary)/0.55),0_0_0_1px_hsl(var(--primary-glow)/0.35)_inset]",
          )
        : "border-white/[0.08] bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.035]",
    )}
  >
    {active && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(circle at 30% 0%, hsl(var(--primary-glow) / 0.18), transparent 60%)",
        }}
      />
    )}

    <Icon
      strokeWidth={1.6}
      className={cn(
        "relative transition-colors",
        lead ? "h-5 w-5" : "h-4 w-4",
        active
          ? "text-primary-glow"
          : "text-foreground/55 group-hover:text-foreground/85",
      )}
    />
    <div className="relative">
      <div
        className={cn(
          lead
            ? "text-[13.5px] font-semibold tracking-tight"
            : "text-[12px] font-semibold tracking-tight",
          active ? "text-foreground" : "text-foreground/85",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 leading-snug text-foreground/45",
          lead ? "text-[11px]" : "text-[10px]",
        )}
      >
        {blurb}
      </div>
    </div>
  </motion.button>
);

export default SelectionScreen;
