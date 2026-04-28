import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import Hero from "@/components/Hero";
import TopBar from "@/components/shell/TopBar";
import LoginCard from "./LoginCard";

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="dark relative min-h-screen w-full bg-background text-foreground">
      <TopBar onSignInClick={() => setShowLogin(true)} />
      <Hero />
      <AnimatePresence>
        {showLogin && <LoginCard onClose={() => setShowLogin(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
