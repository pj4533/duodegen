"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { HandNameStyle } from "@/engine/hand-names";

export interface Settings {
  learningMode: boolean;
  handNameStyle: HandNameStyle;
}

interface SettingsContextValue extends Settings {
  updateSettings: (patch: Partial<Settings>) => void;
}

const DEFAULT_SETTINGS: Settings = {
  learningMode: false,
  handNameStyle: "crimsonDesert",
};

const STORAGE_KEY = "duodegen-settings";

const SettingsContext = createContext<SettingsContextValue>({
  ...DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <SettingsContext.Provider
      value={{ ...settings, updateSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
