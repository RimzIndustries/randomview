
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUrls } from '@/services/urlService';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function RandomViewPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [urls, setUrls] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'viewing' | 'no-urls' | 'error'>('loading');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const pickRandomUrl = useCallback(() => {
        if (urls.length > 0) {
            const randomIndex = Math.floor(Math.random() * urls.length);
            setCurrentUrl(urls[randomIndex]);
            setStatus('viewing');
        } else {
            setStatus('no-urls');
        }
    }, [urls]);

    useEffect(() => {
        async function fetchUrls() {
            if (user?.uid) {
                try {
                    const fetchedUrls = await getUrls(user.uid);
                    setUrls(fetchedUrls);
                    if (fetchedUrls.length === 0) {
                        setStatus('no-urls');
                    }
                } catch (error) {
                    console.error("Failed to fetch URLs", error);
                    setStatus('error');
                }
            }
        }
        if (user) {
            fetchUrls();
        }
    }, [user]);

    useEffect(() => {
        if (status !== 'loading' && urls.length > 0) {
            pickRandomUrl();
        }
    }, [urls, status, pickRandomUrl]);

    if (loading || status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Loading your websites...</p>
            </div>
        );
    }

    if (status === 'no-urls' || status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <h1 className="mt-4 text-2xl font-bold">
                        {status === 'no-urls' ? 'No URLs Found' : 'An Error Occurred'}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {status === 'no-urls' 
                            ? "Your list is empty. Add some URLs on the dashboard."
                            : "We couldn't load your URLs. Please try again later."
                        }
                    </p>
                    <Button asChild className="mt-6">
                        <a onClick={() => router.push('/dashboard')}>Go to Dashboard</a>
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center justify-between p-4 border-b bg-card">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                <div className="text-sm text-muted-foreground truncate px-4 hidden sm:block">
                    Viewing: {currentUrl}
                </div>
                <Button onClick={pickRandomUrl} className="neumorphism-button">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Next Random Site
                </Button>
            </header>
            <main className="flex-1">
                {currentUrl ? (
                     <iframe
                        src={currentUrl}
                        title="Random Website"
                        className="w-full h-full border-0"
                        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
                     ></iframe>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </main>
        </div>
    );
}
