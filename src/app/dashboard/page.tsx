
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UrlManager } from '@/components/UrlManager';
import { useToast } from "@/hooks/use-toast";
import { Eye, LogOut, Shield } from 'lucide-react';
import { getUrls, addUrl, deleteUrl } from '@/services/urlService';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const { user, loading, logout, userRole } = useAuth();
    const router = useRouter();
    const [urls, setUrls] = useState<string[]>([]);
    const [isStoreLoaded, setIsStoreLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchUrls() {
            if (user?.uid) {
                try {
                    const fetchedUrls = await getUrls(user.uid);
                    setUrls(fetchedUrls);
                } catch (error) {
                    console.error("Failed to fetch from Firestore", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load your URLs.",
                    });
                } finally {
                    setIsStoreLoaded(true);
                }
            }
        }
        if (user) {
            fetchUrls();
        }
    }, [user, toast]);

    const handleAddUrl = async (url: string) => {
        if (!user?.uid) return;
        try {
            await addUrl(user.uid, url);
            setUrls(prevUrls => [...prevUrls, url]);
            toast({
                title: "URL Added",
                description: "The new URL has been successfully added to your list.",
            });
        } catch (error) {
            console.error("Failed to add URL", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add the URL.",
            });
        }
    };

    const handleDeleteUrl = async (urlToDelete: string) => {
        if (!user?.uid) return;
        try {
            await deleteUrl(user.uid, urlToDelete);
            setUrls(prevUrls => prevUrls.filter(url => url !== urlToDelete));
            toast({
                variant: "default",
                title: "URL Removed",
                description: "The URL has been removed from your list."
            });
        } catch (error) {
            console.error("Failed to delete URL", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the URL.",
            });
        }
    };
    
    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="flex justify-between items-center w-full">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-80 w-full" />
                    <div className="flex justify-center">
                        <Skeleton className="h-12 w-48" />
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
            <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
                 <header className="w-full">
                    <div className="flex justify-between items-center w-full mb-2">
                        <h1 className="text-2xl font-bold text-foreground">
                           Welcome, {user.displayName || user.email}!
                        </h1>
                        <div className="flex items-center gap-2">
                            {userRole === 'admin' && (
                                <Button asChild variant="ghost" className="neumorphism-button">
                                    <Link href="/admin">
                                        <Shield className="mr-2 h-5 w-5" />
                                        Admin
                                    </Link>
                                </Button>
                            )}
                            <Button onClick={handleLogout} variant="ghost" className="neumorphism-button">
                                <LogOut className="mr-2 h-5 w-5" />
                                Logout
                            </Button>
                        </div>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Manage your list of websites below.
                    </p>
                </header>

                <UrlManager urls={urls} onAddUrl={handleAddUrl} onDeleteUrl={handleDeleteUrl} isLoaded={isStoreLoaded} />

                <div className="w-full flex flex-col items-center gap-4 mt-4">
                     <Button 
                        asChild 
                        size="lg" 
                        className="neumorphism-button"
                    >
                        <Link href="/random" target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-5 w-5" />
                            Start Viewing
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
