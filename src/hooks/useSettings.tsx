"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
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

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore corrupt data
  }
  return DEFAULT_SETTINGS;
}

const SettingsContext = createContext<SettingsContextValue>({
  ...DEFAULT_SETTINGS,
  updateSettings: () => {},
});

let settingsSnapshot = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

function getSnapshot(): Settings {
  return settingsSnapshot;
}

function getServerSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

function subscribe(callback: () => void): () => void {
  // Re-read localStorage on mount so tests (and late subscribers) pick up current values
  settingsSnapshot = loadSettings();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function writeSettings(next: Settings) {
  settingsSnapshot = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    writeSettings({ ...settingsSnapshot, ...patch });
  }, []);

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
