import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from 'firebase/auth';

// Demo account credentials
export const DEMO_EMAIL = "demo@jobly.ai";
export const DEMO_PASSWORD = "demo123";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authRequired, setAuthRequired] = useState(false);

    // Sign in with email/password
    async function login(email, password) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            // For demo purposes, allow the demo account even if Firebase fails
            if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
                const demoUser = {
                    uid: 'demo-user-123',
                    email: DEMO_EMAIL,
                    displayName: 'Demo User',
                    isDemo: true
                };
                setCurrentUser(demoUser);
                localStorage.setItem('demoUser', JSON.stringify(demoUser));
                return { success: true, user: demoUser };
            }
            return { success: false, error: error.message };
        }
    }

    // Sign up with email/password
    async function signup(email, password) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async function logout() {
        try {
            await signOut(auth);
            setCurrentUser(null);
            localStorage.removeItem('demoUser');
            return { success: true };
        } catch (error) {
            setCurrentUser(null);
            localStorage.removeItem('demoUser');
            return { success: true };
        }
    }

    // Trigger auth requirement
    function requireAuth() {
        setAuthRequired(true);
    }

    // Clear auth requirement
    function clearAuthRequirement() {
        setAuthRequired(false);
    }

    // Check for demo user on load
    useEffect(() => {
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
            setCurrentUser(JSON.parse(demoUser));
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        authRequired,
        requireAuth,
        clearAuthRequirement,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading...</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
