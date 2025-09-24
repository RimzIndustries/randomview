
"use client";

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Globe, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface UrlManagerProps {
    urls: string[];
    onAddUrl: (url: string) => void;
    onDeleteUrl: (url: string) => void;
    onUpdateUrl: (oldUrl: string, newUrl: string) => void;
    isLoaded: boolean;
}

const urlSchema = z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." });

export function UrlManager({ urls, onAddUrl, onDeleteUrl, onUpdateUrl, isLoaded }: UrlManagerProps) {
    const [newUrl, setNewUrl] = useState('');
    const [editUrl, setEditUrl] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [addError, setAddError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleAdd = () => {
        const result = urlSchema.safeParse(newUrl);
        if (!result.success) {
            setAddError(result.error.issues[0].message);
            return;
        }
        if (urls.includes(result.data)) {
            setAddError('This URL is already in the list.');
            return;
        }
        onAddUrl(result.data);
        setNewUrl('');
        setAddError(null);
    };

    const handleEdit = (url: string) => {
        setCurrentUrl(url);
        setEditUrl(url);
        setIsEditDialogOpen(true);
    }
    
    const handleUpdate = () => {
        const result = urlSchema.safeParse(editUrl);
        if (!result.success) {
            setEditError(result.error.issues[0].message);
            return;
        }
        if (urls.includes(result.data) && result.data !== currentUrl) {
            setEditError('This URL is already in the list.');
            return;
        }
        onUpdateUrl(currentUrl, result.data);
        setEditUrl('');
        setEditError(null);
        setCurrentUrl('');
        setIsEditDialogOpen(false);
    }

    return (
        <TooltipProvider>
            <Card className="w-full max-w-2xl neumorphism-card">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                        <Globe className="h-6 w-6" />
                        Manage Your URLs
                    </CardTitle>
                    <CardDescription>Add, edit, or remove websites from your random view list.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <div className="flex-grow">
                            <Input 
                                value={newUrl}
                                onChange={(e) => { setNewUrl(e.target.value); setAddError(null); }}
                                placeholder="https://example.com"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                aria-label="New URL"
                                aria-invalid={!!addError}
                                aria-describedby="url-add-error"
                            />
                            {addError && <p id="url-add-error" className="text-sm text-destructive mt-1">{addError}</p>}
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
                                        <li key={url} className="flex items-center justify-between p-2 rounded-md hover:bg-background transition-colors duration-200 group">
                                            <div className="flex items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(url)} aria-label={`Edit ${url}`}>
                                                            <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Edit URL</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <AlertDialog>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" aria-label={`Delete ${url}`}>
                                                                    <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete URL</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the URL <span className="font-medium">{url}</span> from your list.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => onDeleteUrl(url)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                 <span className="truncate font-mono text-sm ml-2" title={url}>{url}</span>
                                            </div>
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
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit URL</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    value={editUrl}
                                    onChange={(e) => { setEditUrl(e.target.value); setEditError(null); }}
                                    aria-label="Edit URL"
                                    aria-invalid={!!editError}
                                    aria-describedby="url-edit-error"
                                />
                                {editError && <p id="url-edit-error" className="text-sm text-destructive">{editError}</p>}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleUpdate}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
