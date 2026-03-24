"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_LANG = process.env.NEXT_PUBLIC_DEFAULT_LANG ?? "no";

const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  // On mount, restore saved language — but only if it was saved by the user.
  // If no saved preference exists, fall back to the app's default language.
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLangState(saved);
  }, []);

  // Persist every time the user changes language
  const setLang = (newLang) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}