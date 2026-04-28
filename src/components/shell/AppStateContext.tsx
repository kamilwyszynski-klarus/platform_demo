import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  DemoUser,
  AcceleratorType,
  Func,
  Industry,
  Phase,
} from "./types";

interface AppStateContextValue extends AppState {
  signIn: (user: DemoUser) => void;
  signOut: () => void;
  toggleAcceleratorType: (type: AcceleratorType) => void;
  setIndustry: (i: Industry | null) => void;
  setFunc: (f: Func | null) => void;
  confirmContext: () => void;
  changeContext: () => void;
  openTile: (id: string) => void;
  closeDetail: () => void;
  goTo: (phase: Phase) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const initialState: AppState = {
  phase: "landing",
  user: null,
  acceleratorTypes: [],
  industry: null,
  industrySelectionMade: false,
  func: null,
  funcSelectionMade: false,
  selectedTileId: null,
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);

  const signIn = useCallback((user: DemoUser) => {
    setState((s) => ({ ...s, user, phase: "selection" }));
  }, []);

  const signOut = useCallback(() => {
    setState(initialState);
  }, []);

  const toggleAcceleratorType = useCallback((type: AcceleratorType) => {
    setState((s) => ({
      ...s,
      acceleratorTypes: s.acceleratorTypes.includes(type)
        ? s.acceleratorTypes.filter((t) => t !== type)
        : [...s.acceleratorTypes, type],
    }));
  }, []);

  const setIndustry = useCallback((industry: Industry | null) => {
    setState((s) => ({ ...s, industry, industrySelectionMade: true }));
  }, []);

  const setFunc = useCallback((func: Func | null) => {
    setState((s) => ({ ...s, func, funcSelectionMade: true }));
  }, []);

  const confirmContext = useCallback(() => {
    setState((s) => {
      const ready =
        s.industrySelectionMade &&
        s.funcSelectionMade &&
        s.acceleratorTypes.length > 0;
      return ready ? { ...s, phase: "grid" } : s;
    });
  }, []);

  const changeContext = useCallback(() => {
    setState((s) => ({ ...s, phase: "selection" }));
  }, []);

  const openTile = useCallback((id: string) => {
    setState((s) => ({ ...s, selectedTileId: id, phase: "detail" }));
  }, []);

  const closeDetail = useCallback(() => {
    setState((s) => ({ ...s, selectedTileId: null, phase: "grid" }));
  }, []);

  const goTo = useCallback((phase: Phase) => {
    setState((s) => ({ ...s, phase }));
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      signIn,
      signOut,
      toggleAcceleratorType,
      setIndustry,
      setFunc,
      confirmContext,
      changeContext,
      openTile,
      closeDetail,
      goTo,
    }),
    [
      state,
      signIn,
      signOut,
      toggleAcceleratorType,
      setIndustry,
      setFunc,
      confirmContext,
      changeContext,
      openTile,
      closeDetail,
      goTo,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
