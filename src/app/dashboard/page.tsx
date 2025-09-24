
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UrlManager } from '@/components/UrlManager';
import { useToast } from "@/hooks/use-toast";
import { Eye, LogOut, Shield, User as UserIcon, KeyRound, Trash2 } from 'lucide-react';
import { getUrls, addUrl, deleteUrl, updateUrl } from '@/services/urlService';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
    const { user, loading, logout, userRole, resetPassword, deleteAccount } = useAuth();
    const router = useRouter();
    const [urls, setUrls] = useState<string[]>([]);
    const [isStoreLoaded, setIsStoreLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchUrls() {
            if (user?.uid) {
                try {
                    const fetchedUrls = await getUrls(user.uid);
                    setUrls(fetchedUrls);
                } catch (error) {
                    console.error("Failed to fetch from Firestore", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load your URLs.",
                    });
                } finally {
                    setIsStoreLoaded(true);
                }
            }
        }
        if (user) {
            fetchUrls();
        }
    }, [user, toast]);

    const handleAddUrl = async (url: string) => {
        if (!user?.uid) return;
        try {
            await addUrl(user.uid, url);
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
        if (!user?.uid) return;
        try {
            await deleteUrl(user.uid, urlToDelete);
            setUrls(prevUrls => prevUrls.filter(url => url !== urlToDelete));
            toast({
                variant: "default",
                title: "URL Removed",
                description: "The URL has been removed from your list."
            });
        } catch (error) {
            console.error("Failed to delete URL", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the URL.",
            });
        }
    };

    const handleUpdateUrl = async (oldUrl: string, newUrl: string) => {
        if (!user?.uid) return;
        try {
            await updateUrl(user.uid, oldUrl, newUrl);
            setUrls(prevUrls => prevUrls.map(url => (url === oldUrl ? newUrl : url)));
            toast({
                title: "URL Updated",
                description: "The URL has been successfully updated.",
            });
        } catch (error) {
            console.error("Failed to update URL", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update the URL.",
            });
        }
    }
    
    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleChangePassword = async () => {
        if (!user?.email) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No email address found for your account.",
            });
            return;
        }
        try {
            await resetPassword(user.email);
            toast({
                title: "Email Sent",
                description: "A password reset link has been sent to your email.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send password reset email.",
            });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            toast({
                title: "Account Deleted",
                description: "Your account has been permanently deleted.",
            });
            router.push('/login');
        } catch (error: any) {
            console.error("Failed to delete account", error);
            let description = "Failed to delete your account. Please try again.";
            if (error.code === 'auth/requires-recent-login') {
                description = "This is a sensitive operation. Please log out and log back in before deleting your account.";
            }
            toast({
                variant: "destructive",
                title: "Error",
                description: description,
            });
        }
    };

    if (loading || !isStoreLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="flex justify-between items-center w-full">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-80 w-full" />
                    <div className="flex justify-center">
                        <Skeleton className="h-12 w-48" />
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
            <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
                 <header className="w-full">
                    <div className="flex justify-between items-center w-full mb-2">
                        <h1 className="text-2xl font-bold text-foreground">
                           Welcome, {user?.displayName || user?.email?.split('@')[0]}!
                        </h1>
                        <div className="flex items-center gap-2">
                            {userRole === 'admin' && (
                                <Button asChild variant="ghost" className="neumorphism-button">
                                    <Link href="/admin">
                                        <Shield className="mr-2 h-5 w-5" />
                                        Admin
                                    </Link>
                                </Button>
                            )}
                             <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full neumorphism-button">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user?.photoURL ?? ""} alt={user?.displayName ?? ""} />
                                                <AvatarFallback>
                                                    {user?.email?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {user?.displayName || user?.email?.split('@')[0]}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleChangePassword}>
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            <span>Change Password</span>
                                        </DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                <span className="text-destructive">Delete Account</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            account and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete My Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Manage your list of websites below.
                    </p>
                </header>

                <UrlManager 
                    urls={urls} 
                    onAddUrl={handleAddUrl} 
                    onDeleteUrl={handleDeleteUrl} 
                    onUpdateUrl={handleUpdateUrl}
                    isLoaded={isStoreLoaded} 
                />

                <div className="w-full flex flex-col items-center gap-4 mt-4">
                     <Button 
                        asChild 
                        size="lg" 
                        className="neumorphism-button"
                    >
                        <Link href="/random">
                            <Eye className="mr-2 h-5 w-5" />
                            Start Viewing
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
