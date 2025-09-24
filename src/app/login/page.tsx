
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const signUpSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signInSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;

export default function LoginPage() {
    const { loginWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const signUpForm = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { email: '', password: '' },
    });

    const signInForm = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: '', password: '' },
    });

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            router.push('/dashboard');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Could not log in with Google. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (data: SignUpFormValues) => {
        setIsLoading(true);
        const result = await signUpWithEmail(data.email, data.password);
        if (result.code) {
             toast({
                variant: "destructive",
                title: "Sign Up Failed",
                description: result.message || "An unknown error occurred.",
            });
        } else {
            toast({
                title: "Success",
                description: "Account created successfully! Redirecting to dashboard...",
            });
            router.push('/dashboard');
        }
        setIsLoading(false);
    };
    
    const handleSignIn = async (data: SignInFormValues) => {
        setIsLoading(true);
        const result = await signInWithEmail(data.email, data.password);
        if (result.code) {
            toast({
                variant: "destructive",
                title: "Sign In Failed",
                description: "Invalid email or password.",
            });
        } else {
            router.push('/dashboard');
        }
        setIsLoading(false);
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
            <Tabs defaultValue="signin" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin">
                    <Card className="neumorphism-card">
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>Enter your credentials to access your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...signInForm}>
                                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                                    <FormField
                                        control={signInForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signInForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sign In
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <p className="text-xs text-muted-foreground">OR</p>
                            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                                Sign In with Google
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                     <Card className="neumorphism-card">
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                            <CardDescription>Create a new account to get started.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...signUpForm}>
                                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                                    <FormField
                                        control={signUpForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signUpForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Account
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                         <CardFooter className="flex flex-col gap-4">
                            <p className="text-xs text-muted-foreground">OR</p>
                            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                                Sign Up with Google
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    );
}
