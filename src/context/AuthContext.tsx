
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
    signUpWithEmail: (email: string, pass: string) => Promise<User | AuthError>;
    signInWithEmail: (email: string, pass: string) => Promise<User | AuthError>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    userRole: null,
    loginWithGoogle: async () => {},
    signUpWithEmail: async () => new Promise(() => {}),
    signInWithEmail: async () => new Promise(() => {}),
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
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role);
                } else {
                    // Create user doc if it doesn't exist (e.g., first login)
                    await setDoc(userDocRef, {
                        email: user.email,
                        role: 'user', // Default role
                    });
                    setUserRole('user');
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleUserCreation = async (user: User) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                role: 'user',
            });
            setUserRole('user');
        } else {
            setUserRole(userDoc.data().role);
        }
    }

    const loginWithGoogle = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleUserCreation(result.user);
        } catch (error) {
            console.error("Google login error", error);
        } finally {
            setLoading(false);
        }
    };

    const signUpWithEmail = async (email: string, pass: string) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await handleUserCreation(userCredential.user);
            return userCredential.user;
        } catch (error) {
            return error as AuthError;
        } finally {
            setLoading(false);
        }
    };
    
    const signInWithEmail = async (email: string, pass: string) => {
        setLoading(true);
        try {
             const userCredential = await signInWithEmailAndPassword(auth, email, pass);
             const userDocRef = doc(db, 'users', userCredential.user.uid);
             const userDoc = await getDoc(userDocRef);
             if (userDoc.exists()) {
                setUserRole(userDoc.data().role);
             }
             return userCredential.user;
        } catch (error) {
            return error as AuthError;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, userRole, loginWithGoogle, signUpWithEmail, signInWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
