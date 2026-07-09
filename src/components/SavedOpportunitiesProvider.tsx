"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SaveOpportunityType } from "@/app/actions/save";

interface SavedOpportunitiesContextType {
  savedIds: Set<string>;
  addSavedId: (id: string) => void;
  removeSavedId: (id: string) => void;
  isLoggedIn: boolean;
  userRole: string | null;
}

const SavedOpportunitiesContext = createContext<SavedOpportunitiesContextType>({
  savedIds: new Set(),
  addSavedId: () => {},
  removeSavedId: () => {},
  isLoggedIn: false,
  userRole: null,
});

export const useSavedOpportunities = () => useContext(SavedOpportunitiesContext);

export function SavedOpportunitiesProvider({
  children,
  initialSavedIds,
  isLoggedIn,
  userRole,
}: {
  children: React.ReactNode;
  initialSavedIds: string[];
  isLoggedIn: boolean;
  userRole: string | null;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));

  // Sync state if initial changes (e.g. on navigation)
  useEffect(() => {
    setSavedIds(new Set(initialSavedIds));
  }, [initialSavedIds]);

  const addSavedId = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const removeSavedId = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <SavedOpportunitiesContext.Provider value={{ savedIds, addSavedId, removeSavedId, isLoggedIn, userRole }}>
      {children}
    </SavedOpportunitiesContext.Provider>
  );
}
