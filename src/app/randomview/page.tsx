
import { redirect } from 'next/navigation';
import { getAllUrls } from '@/services/urlService';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function RandomViewRedirectPage() {
    try {
        const urls = await getAllUrls();

        if (urls.length === 0) {
            return (
                 <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                    <div className="text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                        <h1 className="mt-4 text-2xl font-bold">No URLs Found</h1>
                        <p className="mt-2 text-muted-foreground">
                            There are no websites submitted by any user yet.
                        </p>
                        <Button asChild className="mt-6">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </div>
                </div>
            );
        }

        const randomIndex = Math.floor(Math.random() * urls.length);
        const randomUrl = urls[randomIndex];
        
        redirect(randomUrl);

    } catch (error) {
        console.error("Failed to fetch URLs for redirect:", error);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <h1 className="mt-4 text-2xl font-bold">An Error Occurred</h1>
                    <p className="mt-2 text-muted-foreground">
                        We couldn't load the websites. Please try again later.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }
}
