"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shuffle, Loader2 } from 'lucide-react';
import { UrlManager } from '@/components/UrlManager';
import { useToast } from "@/hooks/use-toast";
import { limitFrequency } from '@/ai/flows/frequency-limiter';
import { Separator } from '@/components/ui/separator';

const URLS_KEY = 'random-view-urls';
const RECENT_URLS_KEY = 'random-view-recent-urls';
const MAX_RECENT_URLS = 10; // Keep track of the last 10 viewed URLs

export default function Home() {
    const [urls, setUrls] = useState<string[]>([]);
    const [recentUrls, setRecentUrls] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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

    const handleRandomView = async () => {
        if (urls.length === 0) {
            toast({
                variant: "destructive",
                title: "No URLs in List",
                description: "Please add some websites to your list before trying to view one.",
            });
            return;
        }

        setIsLoading(true);

        const shuffledUrls = [...urls].sort(() => 0.5 - Math.random());
        let foundUrl = false;

        for (const url of shuffledUrls) {
            try {
                const { shouldDisplay } = await limitFrequency({
                    url,
                    recentUrls,
                    maxFrequency: Math.max(1, Math.floor(urls.length / 3)), // Allow more frequency for smaller lists
                });

                if (shouldDisplay) {
                    setCurrentUrl(url);
                    const newRecent = [url, ...recentUrls].slice(0, MAX_RECENT_URLS);
                    updateRecentUrls(newRecent);
                    foundUrl = true;
                    break;
                }
            } catch (error) {
                 console.error("AI frequency check failed, using fallback.", error);
                 // If AI fails, just proceed with the URL
                 setCurrentUrl(url);
                 const newRecent = [url, ...recentUrls].slice(0, MAX_RECENT_URLS);
                 updateRecentUrls(newRecent);
                 foundUrl = true;
                 break;
            }
        }

        if (!foundUrl) {
            toast({
                title: "All Sites Viewed Recently",
                description: "Displaying a random site as a fallback. Add more sites for better variety.",
            });
            const fallbackUrl = urls[Math.floor(Math.random() * urls.length)];
            setCurrentUrl(fallbackUrl);
            const newRecent = [fallbackUrl, ...recentUrls].slice(0, MAX_RECENT_URLS);
            updateRecentUrls(newRecent);
        }

        setIsLoading(false);
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
            <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
                <header className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary animate-fade-in-down">
                        Random View
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground animate-fade-in-up">
                        Discover websites from your list, one random click at a time.
                    </p>
                </header>

                <UrlManager urls={urls} onAddUrl={handleAddUrl} onDeleteUrl={handleDeleteUrl} isLoaded={isStoreLoaded} />

                <Separator className="my-4" />

                <div className="w-full flex flex-col items-center gap-4">
                    <Button onClick={handleRandomView} disabled={isLoading || !isStoreLoaded} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md transition-transform transform hover:scale-105">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Shuffle className="mr-2 h-5 w-5" />
                        )}
                        View a Random Site
                    </Button>

                    <Card className="w-full aspect-video shadow-lg relative overflow-hidden transition-all duration-300 border-2">
                        <CardContent className="p-0 w-full h-full">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                </div>
                            )}
                            {currentUrl ? (
                                 <iframe
                                    src={currentUrl}
                                    title="Random Website View"
                                    className="w-full h-full border-0 transition-opacity duration-500"
                                    key={currentUrl}
                                    onError={() => toast({ variant: "destructive", title: "Display Error", description: `Could not load ${currentUrl}. Some websites may block being embedded.` })}
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                    <p className="text-muted-foreground text-center p-4">Click the button to start exploring!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
