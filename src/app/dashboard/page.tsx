
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UrlManager } from '@/components/UrlManager';
import { useToast } from "@/hooks/use-toast";
import { Eye } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getUrls, addUrl, deleteUrl } from '@/services/urlService';

export default function DashboardPage() {
    const [urls, setUrls] = useState<string[]>([]);
    const [isStoreLoaded, setIsStoreLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchUrls() {
            try {
                const fetchedUrls = await getUrls();
                setUrls(fetchedUrls);
            } catch (error) {
                console.error("Failed to fetch from Firestore", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load data from Firestore.",
                });
            } finally {
                setIsStoreLoaded(true);
            }
        }
        fetchUrls();
    }, [toast]);

    const handleAddUrl = async (url: string) => {
        try {
            await addUrl(url);
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
        try {
            await deleteUrl(urlToDelete);
            setUrls(prevUrls => prevUrls.filter(url => url !== urlToDelete));
             toast({
                variant: "default",
                title: "URL Removed",
                description: "The URL has been removed from your list."
            });
        } catch(error) {
            console.error("Failed to delete URL", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the URL.",
            });
        }
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
                    target="_blank" 
                    rel="noopener noreferrer"
                    >
                        <Eye className="mr-2 h-5 w-5" />
                        Start Viewing
                    </Link>
                </div>

            </div>
        </main>
    );
}
