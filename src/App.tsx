import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/shell/AppShell";
import { AppStateProvider } from "@/components/shell/AppStateContext";

const App = () => (
  <AppStateProvider>
    <TooltipProvider delayDuration={150}>
      <Toaster />
      <Sonner />
      <AppShell />
    </TooltipProvider>
  </AppStateProvider>
);

export default App;
