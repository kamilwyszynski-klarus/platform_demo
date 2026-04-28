import { motion } from "framer-motion";
import { ArrowRight, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/components/shell/AppStateContext";
import type { DemoUser } from "@/components/shell/types";

const EASE = [0.16, 1, 0.3, 1] as const;

const DEMO_USER: DemoUser = {
  name: "Alper Gunaydin",
  email: "alper.gunaydin@klarus.com",
  initials: "AG",
  title: "Director",
};

interface LoginCardProps {
  onClose: () => void;
}

const LoginCard = ({ onClose }: LoginCardProps) => {
  const { signIn } = useAppState();
  const [email, setEmail] = useState(DEMO_USER.email);
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Drop straight into the password field — email is pre-populated for speed.
  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  // ESC closes the card while not authenticating; once mid-auth we let the
  // mock flow complete so Alper can talk over it without backing out by accident.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !authenticating) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [authenticating, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (authenticating) return;
    if (!email.trim() || !password.trim()) return;
    setAuthenticating(true);
    // Mocked auth: scripted 1.2s pause then transition to selection screen.
    window.setTimeout(() => signIn(DEMO_USER), 1200);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      onClick={onClose}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-background/55 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
      />

      <motion.div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
        transition={{ duration: 0.45, ease: EASE }}
        className={cn(
          "relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl",
          "border border-white/10",
          "bg-card/70 p-8 backdrop-blur-2xl",
        )}
        style={{
          boxShadow:
            "0 40px 120px -30px hsl(140 30% 8% / 0.55), 0 0 0 1px hsl(220 30% 25% / 0.32) inset",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(140 30% 14% / 0.32), transparent 60%), hsl(var(--card) / 0.7)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          disabled={authenticating}
          className={cn(
            "absolute right-4 top-4 rounded-full border border-white/10 p-1.5 text-foreground/50",
            "transition-colors duration-200 hover:border-white/30 hover:text-foreground",
            "disabled:cursor-not-allowed disabled:opacity-30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/60",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-6 inline-flex items-center gap-2.5">
          <span className="h-3 w-px bg-foreground/55" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/85">
            Klarus AI Platform
          </span>
        </div>

        <h2 className="text-[1.5rem] font-bold leading-[1.1] tracking-[-0.015em] text-foreground">
          Sign in to continue.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/55">
          Use your Klarus credentials.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={setEmail}
            disabled={authenticating}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            disabled={authenticating}
            inputRef={passwordRef}
          />

          <button
            type="submit"
            disabled={authenticating || !password.trim() || !email.trim()}
            className={cn(
              "group relative mt-2 inline-flex items-center justify-center gap-2",
              "rounded-full px-5 py-3 text-sm font-medium tracking-tight text-primary-foreground",
              "bg-[linear-gradient(135deg,hsl(var(--primary-deep)),hsl(var(--primary)))]",
              "shadow-[var(--shadow-sage)]",
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "hover:translate-y-[-1px] hover:shadow-[0_14px_50px_-10px_hsl(var(--primary)/0.6),0_0_0_1px_hsl(var(--primary-glow)/0.35)_inset]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-glow/70",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
            )}
          >
            {authenticating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[11px] text-foreground/40">
          <span>SSO via Microsoft Entra</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-1 w-1 rounded-full bg-emerald-400/80"
              aria-hidden
            />
            All systems operational
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const Field = ({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  disabled,
  inputRef,
}: FieldProps) => (
  <label
    htmlFor={id}
    className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/45"
  >
    {label}
    <input
      ref={inputRef}
      id={id}
      type={type}
      value={value}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "w-full rounded-lg border border-white/10 bg-white/[0.025] px-3.5 py-2.5",
        "text-sm font-normal tracking-tight text-foreground placeholder:text-foreground/30",
        "outline-none transition-colors duration-200",
        "hover:border-white/20",
        "focus:border-primary-glow/60 focus:bg-white/[0.04] focus:ring-2 focus:ring-primary-glow/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
      style={{ textTransform: "none", letterSpacing: "0" }}
    />
  </label>
);

export default LoginCard;
