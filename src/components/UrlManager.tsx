"use client";

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Globe } from 'lucide-react';

interface UrlManagerProps {
    urls: string[];
    onAddUrl: (url: string) => void;
    onDeleteUrl: (url: string) => void;
    isLoaded: boolean;
}

const urlSchema = z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." });

export function UrlManager({ urls, onAddUrl, onDeleteUrl, isLoaded }: UrlManagerProps) {
    const [newUrl, setNewUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        const result = urlSchema.safeParse(newUrl);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }
        if (urls.includes(result.data)) {
            setError('This URL is already in the list.');
            return;
        }
        onAddUrl(result.data);
        setNewUrl('');
        setError(null);
    };

    const handleDelete = (urlToDelete: string) => {
        onDeleteUrl(urlToDelete);
    }

    return (
        <Card className="w-full max-w-2xl shadow-lg border-2">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                    <Globe className="h-6 w-6" />
                    Manage Your URLs
                </CardTitle>
                <CardDescription>Add or remove websites from your random view list. Note that some websites may block being embedded.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <div className="flex-grow">
                        <Input 
                            value={newUrl}
                            onChange={(e) => { setNewUrl(e.target.value); setError(null); }}
                            placeholder="https://example.com"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            aria-label="New URL"
                            aria-invalid={!!error}
                            aria-describedby="url-error"
                        />
                         {error && <p id="url-error" className="text-sm text-destructive mt-1">{error}</p>}
                    </div>
                    <Button onClick={handleAdd} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Add URL
                    </Button>
                </div>
               

                <h3 className="text-lg font-medium mb-2 mt-6">Your List</h3>
                <ScrollArea className="h-48 rounded-md border p-2 bg-muted/30">
                    {isLoaded ? (
                        urls.length > 0 ? (
                            <ul aria-label="List of URLs">
                                {urls.map((url) => (
                                    <li key={url} className="flex items-center justify-between p-2 rounded-md hover:bg-background transition-colors duration-200">
                                        <span className="truncate font-mono text-sm" title={url}>{url}</span>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(url)} aria-label={`Delete ${url}`}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground p-4">
                                Your list is empty. Add some URLs to get started.
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Loading URLs...</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
