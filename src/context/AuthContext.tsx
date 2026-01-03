/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, startTransition } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useDataCache } from "@/context/DataCacheContext";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    role: string | null;
    isDark: boolean;
    toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    role: null,
    isDark: false,
    toggleTheme: () => {},
});

const resolveRole = (nextUser: User | null): string | null => {
    if (!nextUser) return null;

    const { user_metadata, app_metadata } = nextUser;
    const metadataRole = typeof user_metadata?.role === "string" ? user_metadata.role : null;
    if (metadataRole) return metadataRole;

    const appRole = typeof app_metadata?.role === "string" ? app_metadata.role : null;
    if (appRole) return appRole;

    if (Array.isArray(app_metadata?.roles)) {
        const [firstRole] = app_metadata.roles;
        if (typeof firstRole === "string") {
            return firstRole;
        }
    }

    return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [isDark, setIsDark] = useState<boolean>(true);
    const { clear: clearCache } = useDataCache();
    const lastUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                const nextSession = data.session ?? null;
                const nextUser = nextSession?.user ?? null;
                const nextRole = resolveRole(nextUser);

                // Batch all state updates together using React's automatic batching
                startTransition(() => {
                    setSession(nextSession);
                    setUser(nextUser);
                    setRole(nextRole);
                    setLoading(false);
                });
            } catch (err) {
                console.error("Failed to fetch auth session", err);
                startTransition(() => {
                    setSession(null);
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                });
            }
        };
        init();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            const nextUser = currentSession?.user ?? null;

            setSession(currentSession);
            setUser(nextUser);
            setRole(resolveRole(nextUser));
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const currentId = user?.id ?? null;
        if (lastUserIdRef.current !== currentId) {
            clearCache();
            lastUserIdRef.current = currentId;
        }
    }, [user, clearCache]);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        try {
            const stored = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const initial = stored ? stored === 'dark' : prefersDark
            setIsDark(initial)
            if (initial) document.documentElement.classList.add('dark')
            else document.documentElement.classList.remove('dark')
        } catch {
            // ignore theme read errors
        }
    }, [])

    // Apply theme side-effects whenever theme changes
    useEffect(() => {
        try {
            localStorage.setItem("theme", isDark ? "dark" : "light");
        } catch {
            // ignore write errors
        }
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return (
        <AuthContext.Provider value={{ session, user, loading, role, isDark, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
