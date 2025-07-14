"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UrlManager } from '@/components/UrlManager';
import { useToast } from "@/hooks/use-toast";
import { Eye } from 'lucide-react';

const URLS_KEY = 'random-view-urls';
const RECENT_URLS_KEY = 'random-view-recent-urls';
const MAX_RECENT_URLS = 10;

export default function Home() {
    const [urls, setUrls] = useState<string[]>([]);
    const [recentUrls, setRecentUrls] = useState<string[]>([]);
    const [isStoreLoaded, setIsStoreLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedUrls = localStorage.getItem(URLS_KEY);
            setUrls(storedUrls ? JSON.parse(storedUrls) : []);
            
            const storedRecentUrls = localStorage.getItem(RECENT_URLS_KEY);
            setRecentUrls(storedRecentUrls ? JSON.parse(storedRecentUrls) : []);
        } catch (error) {
            console.error("Failed to parse from localStorage", error);
            setUrls([]);
            setRecentUrls([]);
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

    const updateRecentUrls = (newRecentUrls: string[]) => {
        setRecentUrls(newRecentUrls);
        localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(newRecentUrls));
    };

    const handleAddUrl = (url: string) => {
        updateUrls([...urls, url]);
    };

    const handleDeleteUrl = (urlToDelete: string) => {
        updateUrls(urls.filter(url => url !== urlToDelete));
    };
    
    const openRandomPage = () => {
        if (urls.length === 0) {
            toast({
                variant: "destructive",
                title: "No URLs in List",
                description: "Please add some websites to your list before trying to view one.",
            });
            return;
        }

        // Filter out URLs that have been recently viewed
        const availableUrls = urls.filter(url => !recentUrls.includes(url));

        let randomUrl;
        if (availableUrls.length > 0) {
            // Pick a random URL from the available list
            randomUrl = availableUrls[Math.floor(Math.random() * availableUrls.length)];
        } else {
            // If all URLs have been viewed recently, pick any URL and reset recent list
            toast({
                title: "All Sites Viewed Recently",
                description: "Displaying a random site and resetting history.",
            });
            randomUrl = urls[Math.floor(Math.random() * urls.length)];
            updateRecentUrls([]); // Reset recent URLs
        }

        // Update recent urls list
        const newRecent = [randomUrl, ...recentUrls].slice(0, MAX_RECENT_URLS);
        updateRecentUrls(newRecent);

        // Open in new tab
        window.open(randomUrl, '_blank');
    }

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
                    <Button onClick={openRandomPage} disabled={!isStoreLoaded || urls.length === 0} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md transition-transform transform hover:scale-105">
                        <Eye className="mr-2 h-5 w-5" />
                        Start Viewing
                    </Button>
                </div>

            </div>
        </main>
    );
}
