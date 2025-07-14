"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UrlManager } from '@/components/UrlManager';
import { useToast } from "@/hooks/use-toast";
import { Eye } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const URLS_KEY = 'random-view-urls';

export default function Home() {
    const [urls, setUrls] = useState<string[]>([]);
    const [isStoreLoaded, setIsStoreLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedUrls = localStorage.getItem(URLS_KEY);
            setUrls(storedUrls ? JSON.parse(storedUrls) : []);
        } catch (error) {
            console.error("Failed to parse from localStorage", error);
            setUrls([]);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load data from your browser's storage.",
            });
        }
        setIsStoreLoaded(true);
    }, [toast]);

    const updateUrls = (newUrls: string[]) => {
        setUrls(newUrls);
        localStorage.setItem(URLS_KEY, JSON.stringify(newUrls));
    };

    const handleAddUrl = (url: string) => {
        updateUrls([...urls, url]);
    };

    const handleDeleteUrl = (urlToDelete: string) => {
        updateUrls(urls.filter(url => url !== urlToDelete));
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
            <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
                <header className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary animate-fade-in-down">
                        Random View
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground animate-fade-in-up">
                        Manage your list of websites here.
                    </p>
                </header>

                <UrlManager urls={urls} onAddUrl={handleAddUrl} onDeleteUrl={handleDeleteUrl} isLoaded={isStoreLoaded} />

                <div className="w-full flex flex-col items-center gap-4 mt-4">
                     <Link href="/random" className={cn(
                        buttonVariants({ size: "lg" }),
                        "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md transition-transform transform hover:scale-105",
                        (!isStoreLoaded || urls.length === 0) && "pointer-events-none opacity-50"
                    )}
                    aria-disabled={!isStoreLoaded || urls.length === 0}
                    >
                        <Eye className="mr-2 h-5 w-5" />
                        Start Viewing
                    </Link>
                </div>

            </div>
        </main>
    );
}
