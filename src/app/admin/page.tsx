
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminPage() {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || userRole !== 'admin') {
                router.push('/dashboard');
            }
        }
    }, [user, loading, userRole, router]);

    if (loading || userRole !== 'admin') {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <p>Loading or redirecting...</p>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
            <Card className="w-full max-w-lg neumorphism-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Shield className="h-6 w-6" />
                        Admin Panel
                    </CardTitle>
                    <CardDescription>
                        Welcome, admin. This is the admin panel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">You have special privileges.</p>
                    <Button asChild>
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
