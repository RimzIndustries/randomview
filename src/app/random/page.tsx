
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllUrls } from '@/services/urlService';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function RandomViewPage() {
    const router = useRouter();
    const [urls, setUrls] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'viewing' | 'no-urls' | 'error'>('loading');

    const pickRandomUrl = () => {
        if (urls.length > 0) {
            const randomIndex = Math.floor(Math.random() * urls.length);
            setCurrentUrl(urls[randomIndex]);
            setStatus('viewing');
        } else {
            // This case is handled by the initial fetch, but as a fallback
            setStatus('no-urls');
        }
    };

    useEffect(() => {
        async function fetchAndSetUrls() {
            setStatus('loading');
            try {
                const fetchedUrls = await getAllUrls();
                setUrls(fetchedUrls);
                if (fetchedUrls.length === 0) {
                    setStatus('no-urls');
                } else {
                    const randomIndex = Math.floor(Math.random() * fetchedUrls.length);
                    setCurrentUrl(fetchedUrls[randomIndex]);
                    setStatus('viewing');
                }
            } catch (error) {
                console.error("Failed to fetch all URLs", error);
                setStatus('error');
            }
        }
        fetchAndSetUrls();
    }, []);


    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Loading websites from all users...</p>
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
                            ? "There are no websites submitted by any user yet."
                            : "We couldn't load the websites. Please try again later."
                        }
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center justify-between p-4 border-b bg-card">
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <Home className="mr-2 h-4 w-4" />
                        Go to App
                    </Link>
                </Button>
                <div className="text-sm text-muted-foreground truncate px-4 hidden sm:block">
                    Viewing a random site from the community!
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
