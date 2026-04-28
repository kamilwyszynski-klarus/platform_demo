import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import Landing from "@/components/landing/Landing";
import SelectionScreen from "@/components/selection/SelectionScreen";
import GridScreen from "@/components/grid/GridScreen";
import DetailScreen from "@/components/detail/DetailScreen";
import { useAppState } from "./AppStateContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const AppShell = () => {
  const { phase, signOut } = useAppState();

  // Global ESC = fast reset back to landing. Demo affordance for Alper to
  // restart the flow between tries. ESC inside the login modal is intercepted
  // there first (close the modal), so this only fires post-auth.
  useEffect(() => {
    if (phase === "landing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") signOut();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, signOut]);

  return (
    <div className="dark min-h-screen w-full bg-background text-foreground">
      <AnimatePresence mode="wait" initial={false}>
        {phase === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <Landing />
          </motion.div>
        )}

        {phase === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <SelectionScreen />
          </motion.div>
        )}

        {phase === "grid" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <GridScreen />
          </motion.div>
        )}

        {phase === "detail" && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <DetailScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppShell;
