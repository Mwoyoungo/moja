'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Sync user to Firestore if missing (Backfill for existing users)
            const userRef = doc(db, 'users', userCredential.user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    displayName: userCredential.user.displayName || 'Unknown User',
                    email: userCredential.user.email,
                    createdAt: new Date().toISOString(),
                    role: 'user'
                });
            }

            router.push('/');
        } catch (err: any) {
            setError(err.message.replace('Firebase:', '').trim());
            setIsLoading(false);
        }
    };

    return (
        <main className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center p-6 bg-background-dark text-white font-display selection:bg-primary/30">
            {/* Abstract Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col gap-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface mb-4 border border-white/5 shadow-2xl p-3">
                        <img src="/logo.png" alt="Moja Events Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-muted-grey text-sm">Sign in to access your digital tickets</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="sr-only" htmlFor="email">Email</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-grey group-focus-within:text-white transition-colors material-symbols-outlined text-[20px]">mail</span>
                                <input
                                    required
                                    type="email"
                                    id="email"
                                    placeholder="Email address"
                                    className="w-full bg-surface border border-white/5 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:ring-0 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="sr-only" htmlFor="password">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-grey group-focus-within:text-white transition-colors material-symbols-outlined text-[20px]">lock</span>
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Password"
                                    className="w-full bg-surface border border-white/5 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/30 focus:ring-0 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-grey hover:text-white transition-colors outline-none cursor-pointer flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" className="text-xs text-muted-grey hover:text-primary transition-colors font-medium">Forgot Password?</button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-background-dark py-4 rounded-full font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-all hover:shadow-primary/40 mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1"></div>
                    <span className="text-xs text-muted-grey font-medium uppercase tracking-wider">Or continue with</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1"></div>
                </div>

                {/* Social Auth */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-surface border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                        <span className="text-sm font-semibold text-white/90">Google</span>
                    </button>
                    <button className="flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-surface border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
                        <img src="https://www.svgrepo.com/show/475633/apple-color.svg" className="w-5 h-5 invert group-hover:scale-110 transition-transform" alt="Apple" />
                        <span className="text-sm font-semibold text-white/90">Apple</span>
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-grey">
                    Don't have an account?
                    <Link href="/auth/signup" className="text-primary font-bold hover:underline underline-offset-4 decoration-2 decoration-primary/30 ml-1">Create Account</Link>
                </p>
            </div>
        </main>
    )
}
