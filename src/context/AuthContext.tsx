/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    role: string | null;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    role: null,
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

    useEffect(() => {
        const init = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                const nextSession = data.session ?? null;
                const nextUser = nextSession?.user ?? null;

                setSession(nextSession);
                setUser(nextUser);
                setRole(resolveRole(nextUser));
            } catch (err) {
                console.error("Failed to fetch auth session", err);
                setSession(null);
                setUser(null);
                setRole(null);
            }
            setLoading(false);
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

    return (
        <AuthContext.Provider value={{ session, user, loading, role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
