export type Phase = "landing" | "selection" | "grid" | "detail";

export type Industry =
  | "Financial Services"
  | "Healthcare"
  | "Industrials"
  | "Consumer"
  | "Technology"
  | "Energy"
  | "Real Estate"
  | "Professional Services"
  | "Hospitality"
  | "Private Equity";

export type Func =
  | "Finance"
  | "Procurement"
  | "HR"
  | "Legal"
  | "Sales"
  | "Marketing"
  | "Data & AI";

export type AcceleratorType =
  | "advisory-accelerators"
  | "technical-accelerators"
  | "client-deployable";

export type TileCategory = AcceleratorType;

export interface DemoUser {
  name: string;
  email: string;
  initials: string;
  title: string;
}

export interface AppState {
  phase: Phase;
  user: DemoUser | null;
  acceleratorTypes: AcceleratorType[];
  industry: Industry | null;
  industrySelectionMade: boolean;
  func: Func | null;
  funcSelectionMade: boolean;
  selectedTileId: string | null;
}
