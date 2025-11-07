import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/connection";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user ?? null;

        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.user_metadata?.name ?? null,
            role: sessionUser.user_metadata?.rol ?? sessionUser.user_metadata?.role ?? null,
            contact: sessionUser.user_metadata?.contact ?? null,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error obteniendo sesión:", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sUser = session?.user ?? null;
      if (sUser) {
        setUser({
          id: sUser.id,
          email: sUser.email,
          name: sUser.user_metadata?.name ?? null,
          role: sUser.user_metadata?.rol ?? sUser.user_metadata?.role ?? null,
          contact: sUser.user_metadata?.contact ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
