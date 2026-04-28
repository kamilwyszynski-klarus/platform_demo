import { motion } from "framer-motion";
import { ChevronRight, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "./AppStateContext";
import type { AcceleratorType } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

interface TopBarProps {
  onSignInClick?: () => void;
  /** Override the default contextual right-cluster (used by landing). */
  rightSlot?: React.ReactNode;
}

const TopBar = ({ onSignInClick, rightSlot }: TopBarProps) => {
  const { phase, user, acceleratorTypes, industry, func, signOut, changeContext } =
    useAppState();

  const showBreadcrumb = phase === "grid" || phase === "detail";

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-14",
        "border-b border-white/[0.06]",
        "bg-background/55 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40",
      )}
      style={{
        boxShadow: "0 1px 0 0 hsl(220 30% 25% / 0.18) inset",
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-5 md:px-8">
        {/* Left: wordmark + optional breadcrumb */}
        <div className="flex items-center gap-4">
          <Wordmark />

          {showBreadcrumb && acceleratorTypes.length > 0 && (
            <div className="hidden items-center gap-1.5 md:flex">
              <span className="h-3 w-px bg-foreground/20" aria-hidden />
              <BreadcrumbPill
                label={acceleratorTypes.map(acceleratorLabel).join(" + ")}
                onClick={changeContext}
              />
              {industry && (
                <>
                  <ChevronRight
                    className="h-3 w-3 text-foreground/30"
                    strokeWidth={2}
                  />
                  <BreadcrumbPill label={industry} onClick={changeContext} />
                </>
              )}
              {func && (
                <>
                  <ChevronRight
                    className="h-3 w-3 text-foreground/30"
                    strokeWidth={2}
                  />
                  <BreadcrumbPill label={func} onClick={changeContext} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: contextual cluster */}
        <div className="flex items-center gap-3">
          {rightSlot ??
            (user ? (
              <>
                <UserChip user={user} />
                <button
                  type="button"
                  onClick={signOut}
                  aria-label="Sign out"
                  className={cn(
                    "group inline-flex items-center gap-1.5 rounded-full",
                    "border border-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/55",
                    "transition-colors duration-200",
                    "hover:border-white/25 hover:text-foreground/85",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
                  )}
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  <LogOut className="h-3 w-3" strokeWidth={2} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onSignInClick}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full",
                  "border border-foreground/20 bg-foreground/[0.04] px-4 py-1.5",
                  "text-[12px] font-medium tracking-tight text-foreground/85 backdrop-blur-md",
                  "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "hover:border-primary-glow/55 hover:text-foreground hover:bg-primary/[0.08]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
                )}
              >
                <span>Sign in</span>
                <LogIn className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
              </button>
            ))}
        </div>
      </div>
    </motion.header>
  );
};

const Wordmark = () => (
  <div className="inline-flex items-center gap-3">
    <span className="h-3 w-px bg-foreground/55" aria-hidden />
    <img
      src="/klarus-logo-white.svg"
      alt="Klarus"
      className="h-5 w-auto opacity-100"
      draggable={false}
    />
  </div>
);

const acceleratorLabel = (type: AcceleratorType): string => {
  switch (type) {
    case "advisory-accelerators":
      return "Advisory";
    case "technical-accelerators":
      return "Technical";
    case "client-deployable":
      return "Client-deployable";
  }
};

const BreadcrumbPill = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex items-center rounded-full border border-white/10",
      "bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium tracking-tight text-foreground/75",
      "transition-colors duration-200",
      "hover:border-primary-glow/45 hover:text-foreground hover:bg-primary/[0.08]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
    )}
    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    aria-label={`Change ${label}`}
  >
    {label}
  </button>
);

const UserChip = ({
  user,
}: {
  user: { name: string; initials: string; title: string };
}) => (
  <div className="hidden items-center gap-2.5 md:flex">
    <div className="text-right leading-tight">
      <div className="text-[12px] font-medium tracking-tight text-foreground/90">
        {user.name}
      </div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-foreground/45">
        {user.title}
      </div>
    </div>
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        "border border-white/15 bg-primary/15 text-[11px] font-semibold tracking-tight text-primary-glow",
      )}
      aria-hidden
    >
      {user.initials}
    </div>
  </div>
);

export default TopBar;
