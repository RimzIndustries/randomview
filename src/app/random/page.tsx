
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllUrls } from '@/services/urlService';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function RandomRedirectPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'redirecting' | 'no-urls' | 'error'>('loading');

    useEffect(() => {
        const timer = setTimeout(() => {
             getAllUrls().then(urls => {
                if (urls.length > 0) {
                    const randomIndex = Math.floor(Math.random() * urls.length);
                    const randomUrl = urls[randomIndex];
                    setStatus('redirecting');
                    router.push(randomUrl);
                } else {
                    setStatus('no-urls');
                }
            }).catch(error => {
                console.error("Failed to fetch all URLs", error);
                setStatus('error');
            });
        }, 1500); // Wait 1.5 seconds before redirecting

        return () => clearTimeout(timer);
    }, [router]);

    if (status === 'loading' || status === 'redirecting') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground animate-pulse">
                    Finding a random website for you...
                </p>
            </div>
        );
    }
    
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
