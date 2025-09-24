
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
    user: User | null;
    loading: boolean;
    userRole: string | null;
    loginWithGoogle: () => Promise<void>;
    signUpWithEmail: (email: string, pass: string) => Promise<Partial<AuthError>>;
    signInWithEmail: (email: string, pass: string) => Promise<Partial<AuthError>>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    userRole: null,
    loginWithGoogle: async () => {},
    signUpWithEmail: async () => ({}),
    signInWithEmail: async () => ({}),
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                setUserRole(userDoc.exists() ? userDoc.data().role : 'user');
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleUserDocument = async (user: User, role: string = 'user') => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                role,
            });
            setUserRole(role);
        } else {
            setUserRole(userDoc.data().role);
        }
    }

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await handleUserDocument(result.user);
    };

    const signUpWithEmail = async (email: string, pass: string): Promise<Partial<AuthError>> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await handleUserDocument(userCredential.user);
            return {};
        } catch (error) {
            const authError = error as AuthError;
            return { code: authError.code, message: authError.message };
        }
    };
    
    const signInWithEmail = async (email: string, pass: string): Promise<Partial<AuthError>> => {
        try {
             await signInWithEmailAndPassword(auth, email, pass);
             return {};
        } catch (error) {
            const authError = error as AuthError;
            return { code: authError.code, message: authError.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        user,
        loading,
        userRole,
        loginWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
