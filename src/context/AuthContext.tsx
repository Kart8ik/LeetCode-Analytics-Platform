import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    session: any;
    user: any;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (!error) {
                setSession(data.session);
                setUser(data.session?.user || null);
            }
            setLoading(false);
        };
        init();

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user || null);
        });

        return () => {
            data.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
