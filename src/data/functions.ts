import {
  Banknote,
  Megaphone,
  Scale,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Func } from "@/components/shell/types";

export interface FuncDef {
  id: Func;
  label: Func;
  blurb: string;
  icon: LucideIcon;
}

export const FUNCTIONS: FuncDef[] = [
  {
    id: "Finance",
    label: "Finance",
    blurb: "Reporting, controls, close, audit.",
    icon: Banknote,
  },
  {
    id: "Procurement",
    label: "Procurement",
    blurb: "Sourcing, vendors, spend.",
    icon: ShoppingCart,
  },
  {
    id: "HR",
    label: "HR",
    blurb: "People, talent, payroll.",
    icon: Users,
  },
  {
    id: "Legal",
    label: "Legal",
    blurb: "Contracts, compliance, disputes.",
    icon: Scale,
  },
  {
    id: "Sales",
    label: "Sales",
    blurb: "Pipeline, accounts, revenue.",
    icon: TrendingUp,
  },
  {
    id: "Marketing",
    label: "Marketing",
    blurb: "Brand, demand, content.",
    icon: Megaphone,
  },
  {
    id: "Data & AI",
    label: "Data & AI",
    blurb: "Architecture, data, models.",
    icon: Sparkles,
  },
];
