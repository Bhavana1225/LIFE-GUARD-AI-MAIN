import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AnalysisResult, HealthProfile, UploadResult } from "./api";

const KEY = "lifeguard.health";

interface Stored {
  profile: HealthProfile | null;
  result: AnalysisResult | null;
  uploads: UploadResult[];
}

interface HealthStoreValue extends Stored {
  ready: boolean;
  saveAssessment: (profile: HealthProfile, result: AnalysisResult) => void;
  addUpload: (upload: UploadResult) => void;
  reset: () => void;
}

const empty: Stored = { profile: null, result: null, uploads: [] };
const HealthContext = createContext<HealthStoreValue | null>(null);

export function HealthStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...(JSON.parse(raw) as Stored) });
    } catch {
      /* ignore corrupt cache */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Stored) => {
    setState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full / unavailable */
    }
  }, []);

  const value = useMemo<HealthStoreValue>(
    () => ({
      ...state,
      ready,
      saveAssessment: (profile, result) => persist({ ...state, profile, result }),
      addUpload: (upload) => persist({ ...state, uploads: [upload, ...state.uploads].slice(0, 12) }),
      reset: () => persist(empty),
    }),
    [state, ready, persist],
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealthStore() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealthStore must be used inside <HealthStoreProvider>");
  return ctx;
}