
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { getUrls } from '@/services/urlService';

export default function RandomPage() {
    const [status, setStatus] = useState<'loading' | 'redirecting' | 'no-urls' | 'error'>('loading');

    useEffect(() => {
        const fetchAndRedirect = async () => {
            try {
                const urls = await getUrls();

                if (urls.length > 0) {
                    setStatus('redirecting');
                    const randomUrl = urls[Math.floor(Math.random() * urls.length)];
                    // Redirect the entire page to the external URL
                    window.location.href = randomUrl;
                } else {
                    setStatus('no-urls');
                }
            } catch (error) {
                console.error("Failed to process URLs from Firestore", error);
                setStatus('error');
            }
        };

        fetchAndRedirect();
    }, []);

    if (status === 'loading' || status === 'redirecting') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground text-center">
                    {status === 'loading' ? 'Finding a random website...' : 'Redirecting you...'}
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
                        ? "Your list is empty. Please add some websites to get started."
                        : "We couldn't load your URLs. Please try again."
                    }
                </p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard">Go Back to Homepage</Link>
                </Button>
            </div>
        </div>
    );
}
