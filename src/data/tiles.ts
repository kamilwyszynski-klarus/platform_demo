import {
  ClipboardList,
  Database,
  FileSearch,
  Gauge,
  GitCompare,
  Globe,
  Network,
  PiggyBank,
  Receipt,
  SearchCheck,
  ScrollText,
  ShoppingCart,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { AcceleratorType, Func, Industry, TileCategory } from "@/components/shell/types";

/**
 * Tile descriptors that drive the presentation catalog.
 * Each tile carries explicit filter metadata so the post-login selections map
 * directly to what appears in the catalog.
 */
export type TileStatus = "available" | "coming-soon" | "contact-team";

export interface TileDef {
  id: string;
  title: string;
  description: string;
  category: TileCategory;
  accelerator_types: AcceleratorType[];
  industries: Industry[];
  functions: Func[];
  status: TileStatus;
  has_detail_screen: boolean;
  pinned?: boolean;
  icon: LucideIcon;
}

export const TILE_CATEGORY_LABELS: Record<TileCategory, string> = {
  "advisory-accelerators": "Advisory accelerators",
  "technical-accelerators": "Technical accelerators",
  "client-deployable": "Client-deployable",
};

export const TILE_CATEGORY_BLURBS: Record<TileCategory, string> = {
  "advisory-accelerators":
    "Codified advisory playbooks. Expert-shaped workflows our partners run on engagements.",
  "technical-accelerators":
    "Reusable technical building blocks. Pipelines, integrations, and tooling our engineers ship.",
  "client-deployable":
    "Production-ready agents that live inside your client's systems and run continuously.",
};

const ALL_INDUSTRIES: Industry[] = [
  "Financial Services",
  "Healthcare",
  "Industrials",
  "Consumer",
  "Technology",
  "Energy",
  "Real Estate",
  "Professional Services",
  "Hospitality",
  "Private Equity",
];

const ALL_FUNCTIONS: Func[] = [
  "Finance",
  "Procurement",
  "HR",
  "Legal",
  "Sales",
  "Marketing",
  "Data & AI",
];

export const TILES: TileDef[] = [
  // --- Advisory accelerators -----------------------------------------------
  {
    id: "operating-model-design",
    title: "Operating Model Design",
    description: "Map capabilities, decision rights, and operating rhythms into a target model.",
    category: "advisory-accelerators",
    accelerator_types: ["advisory-accelerators"],
    industries: ["Financial Services", "Professional Services", "Technology", "Private Equity"],
    functions: ["Finance", "HR", "Data & AI"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: Workflow,
  },
  {
    id: "cost-transformation-playbook",
    title: "Cost Transformation Playbook",
    description: "Structured levers, benchmarks, and initiative templates for margin improvement.",
    category: "advisory-accelerators",
    accelerator_types: ["advisory-accelerators"],
    industries: ["Industrials", "Consumer", "Hospitality", "Private Equity"],
    functions: ["Finance", "Procurement", "HR"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: PiggyBank,
  },
  {
    id: "procurement-maturity-assessment",
    title: "Procurement Maturity Assessment",
    description: "Score sourcing, supplier governance, and spend controls against a maturity model.",
    category: "advisory-accelerators",
    accelerator_types: ["advisory-accelerators"],
    industries: ["Financial Services", "Industrials", "Consumer", "Energy"],
    functions: ["Procurement", "Finance"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: ShoppingCart,
  },
  {
    id: "gtm-diagnostic",
    title: "GTM Diagnostic",
    description: "Assess pipeline quality, channel motion, and commercial coverage by segment.",
    category: "advisory-accelerators",
    accelerator_types: ["advisory-accelerators"],
    industries: ["Technology", "Professional Services", "Consumer", "Private Equity"],
    functions: ["Sales", "Marketing"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: TrendingUp,
  },
  {
    id: "org-design-accelerator",
    title: "Org Design Accelerator",
    description: "Rapidly shape spans, layers, role catalogues, and transition options.",
    category: "advisory-accelerators",
    accelerator_types: ["advisory-accelerators"],
    industries: ["Healthcare", "Professional Services", "Technology", "Consumer"],
    functions: ["HR", "Finance"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: Users,
  },

  // --- Technical accelerators ----------------------------------------------
  {
    id: "data-platform-blueprint",
    title: "Data Platform Blueprint",
    description: "Reference architecture and implementation backlog for modern analytics stacks.",
    category: "technical-accelerators",
    accelerator_types: ["technical-accelerators"],
    industries: ALL_INDUSTRIES,
    functions: ["Data & AI", "Finance", "Sales", "Marketing"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: Database,
  },
  {
    id: "etl-accelerator",
    title: "ETL Accelerator",
    description: "Reusable ingestion, validation, and transformation patterns for source systems.",
    category: "technical-accelerators",
    accelerator_types: ["technical-accelerators"],
    industries: ALL_INDUSTRIES,
    functions: ["Data & AI", "Finance", "Procurement"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: GitCompare,
  },
  {
    id: "model-evaluation-framework",
    title: "Model Evaluation Framework",
    description: "Test harnesses for quality, robustness, regression, and business acceptance.",
    category: "technical-accelerators",
    accelerator_types: ["technical-accelerators"],
    industries: ["Financial Services", "Technology", "Professional Services", "Healthcare"],
    functions: ["Data & AI", "Legal"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: Gauge,
  },
  {
    id: "agent-observability-stack",
    title: "Agent Observability Stack",
    description: "Tracing, evaluation logs, escalation metrics, and operator dashboards for agents.",
    category: "technical-accelerators",
    accelerator_types: ["technical-accelerators"],
    industries: ALL_INDUSTRIES,
    functions: ["Data & AI", "Legal", "Finance"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: Network,
  },

  // --- Client-deployable agents --------------------------------------------
  {
    id: "invoice-processing",
    title: "Invoice Processing",
    description: "Live agent: extract, validate, flag and route inbound invoices end-to-end.",
    category: "client-deployable",
    accelerator_types: ["client-deployable"],
    industries: ["Financial Services", "Professional Services", "Industrials", "Consumer"],
    functions: ["Finance", "Procurement"],
    status: "available",
    has_detail_screen: true,
    pinned: true,
    icon: ScrollText,
  },
  {
    id: "manual-journal-testing",
    title: "Manual Journal Testing",
    description: "Score every journal entry for risk and surface anomalies for review.",
    category: "client-deployable",
    accelerator_types: ["client-deployable"],
    industries: ["Financial Services", "Professional Services", "Industrials", "Private Equity"],
    functions: ["Finance"],
    status: "available",
    has_detail_screen: true,
    icon: ClipboardList,
  },
  {
    id: "commercial-dd",
    title: "Commercial Due Diligence",
    description: "Revenue quality, customer concentration, and counterparty risk in one pack.",
    category: "client-deployable",
    accelerator_types: ["client-deployable"],
    industries: ["Private Equity"],
    functions: ALL_FUNCTIONS,
    status: "available",
    has_detail_screen: true,
    icon: SearchCheck,
  },
  {
    id: "counterparty-intelligence",
    title: "Counterparty Intelligence",
    description: "Monitor adverse media, ownership changes, and relationship risk across entities.",
    category: "client-deployable",
    accelerator_types: ["client-deployable"],
    industries: ["Financial Services", "Private Equity", "Professional Services", "Energy"],
    functions: ["Legal", "Finance", "Procurement"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: Globe,
  },
  {
    id: "contract-clause-analysis",
    title: "Contract Clause Analysis",
    description: "Identify clause deviations, obligations, and negotiation hotspots in contracts.",
    category: "client-deployable",
    accelerator_types: ["client-deployable"],
    industries: ["Professional Services", "Technology", "Financial Services", "Healthcare"],
    functions: ["Legal", "Procurement"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: FileSearch,
  },
  {
    id: "forecasting-agent",
    title: "Forecasting Agent",
    description: "Continuously refresh demand, revenue, and cash forecasts from source data.",
    category: "client-deployable",
    accelerator_types: ["client-deployable"],
    industries: ["Consumer", "Industrials", "Technology", "Hospitality"],
    functions: ["Finance", "Sales", "Marketing"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: TrendingUp,
  },
  {
    id: "procurement-buyer",
    title: "Procurement Buyer",
    description: "RFQ orchestration, supplier outreach, and quote normalisation.",
    category: "client-deployable",
    accelerator_types: ["client-deployable"],
    industries: ["Industrials", "Consumer", "Energy", "Healthcare"],
    functions: ["Procurement"],
    status: "coming-soon",
    has_detail_screen: false,
    icon: Receipt,
  },
];

export const FUNCTIONAL_TILE_IDS = TILES.filter((t) => t.has_detail_screen).map(
  (t) => t.id,
);
