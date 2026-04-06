import React from "react";

import type { ServerUser } from "@/lib/serverApi";
import {
  clearServerUser as clearServerUserPersisted,
  loadServerUser,
  saveServerUser,
} from "@/lib/serverUserStore";

type ServerUserContextValue = {
  user: ServerUser | null;
  setUser: (user: ServerUser | null) => Promise<void>;
  loading: boolean;
  clear: () => Promise<void>;
};

const ServerUserContext = React.createContext<ServerUserContextValue | null>(
  null,
);

export function ServerUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUserState] = React.useState<ServerUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const persisted = await loadServerUser();
      if (!mounted) return;
      setUserState(persisted);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setUser = React.useCallback(async (next: ServerUser | null) => {
    setUserState(next);
    if (next) {
      await saveServerUser(next);
    } else {
      await clearServerUserPersisted();
    }
  }, []);

  const clear = React.useCallback(async () => {
    setUserState(null);
    await clearServerUserPersisted();
  }, []);

  const value = React.useMemo<ServerUserContextValue>(
    () => ({ user, setUser, loading, clear }),
    [user, setUser, loading, clear],
  );

  return (
    <ServerUserContext.Provider value={value}>
      {children}
    </ServerUserContext.Provider>
  );
}

export function useServerUser() {
  const ctx = React.useContext(ServerUserContext);
  if (!ctx) {
    throw new Error("useServerUser must be used within ServerUserProvider");
  }
  return ctx;
}
