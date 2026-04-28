import {
  Activity,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Cpu,
  Factory,
  Landmark,
  ShoppingBag,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Industry } from "@/components/shell/types";

export interface IndustryDef {
  id: Industry;
  label: Industry;
  blurb: string;
  icon: LucideIcon;
}

export const INDUSTRIES: IndustryDef[] = [
  {
    id: "Financial Services",
    label: "Financial Services",
    blurb: "Banks, asset managers, insurers, fintechs.",
    icon: Landmark,
  },
  {
    id: "Healthcare",
    label: "Healthcare",
    blurb: "Providers, payors, life sciences.",
    icon: Activity,
  },
  {
    id: "Industrials",
    label: "Industrials",
    blurb: "Manufacturing, logistics, supply chain.",
    icon: Factory,
  },
  {
    id: "Consumer",
    label: "Consumer",
    blurb: "Retail, FMCG, consumer goods.",
    icon: ShoppingBag,
  },
  {
    id: "Technology",
    label: "Technology",
    blurb: "Software, platforms, infrastructure.",
    icon: Cpu,
  },
  {
    id: "Energy",
    label: "Energy",
    blurb: "Utilities, oil & gas, renewables.",
    icon: Zap,
  },
  {
    id: "Real Estate",
    label: "Real Estate",
    blurb: "Owners, operators, developers.",
    icon: Building2,
  },
  {
    id: "Professional Services",
    label: "Professional Services",
    blurb: "Advisory, legal, accounting firms.",
    icon: Briefcase,
  },
  {
    id: "Hospitality",
    label: "Hospitality",
    blurb: "Hotels, restaurants, leisure operators.",
    icon: UtensilsCrossed,
  },
  {
    id: "Private Equity",
    label: "Private Equity",
    blurb: "PE firms, portfolio companies, deal teams.",
    icon: BriefcaseBusiness,
  },
];
