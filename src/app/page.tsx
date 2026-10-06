'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

type EnterMode = 'login' | 'signup';

export default function LandingPage() {
  const [mode, setMode] = useState<EnterMode>('login');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Registration failed');
          setIsLoading(false);
          return;
        }
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Login failed');
          setIsLoading(false);
          return;
        }
      }

      // Success - redirect to chat
      router.push('/chat');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    // The GoogleLogin component handles the redirect to /api/auth/callback
    // which will set the cookie and we can redirect
    console.log('Google auth success');
  };

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center gap-24 overflow-hidden p-8 font-mono">
        <h1 className="animate-typewriter font-mono text-5xl">Welcome to Recall.ai</h1>
        <div className="flex w-[400px] flex-col justify-center gap-4 rounded-xl border border-white/20 px-4 py-4">
          <div className="flex h-[40px] w-full gap-1 overflow-hidden rounded-md">
            <button
              type="button"
              className={`flex flex-1 items-center justify-center rounded-md border border-white/20 ${mode === 'login' ? 'bg-white/90 text-black' : 'bg-white/20 text-white'} transition-color text-lg duration-300 ease-in-out hover:bg-white hover:text-black`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={`flex flex-1 items-center justify-center rounded-md border border-white/20 ${mode === 'signup' ? 'bg-white/90 text-black' : 'bg-white/20 text-white'} transition-color text-lg duration-300 ease-in-out hover:bg-white hover:text-black`}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 py-4">
            {mode === 'signup' && (
              <div className="flex h-[40px] gap-2 rounded-xl">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setFirstName(event.target.value)
                  }
                  className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
                  required
                  autoComplete="given-name"
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setLastName(event.target.value)
                  }
                  className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
                  required
                  autoComplete="family-name"
                />
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
              className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
              required
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
              className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            {mode === 'signup' && (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(event.target.value)
                }
                className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
                required
                autoComplete="new-password"
              />
            )}

            {error && (
              <div className="text-center text-sm text-red-500" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`flex h-[40px] items-center justify-center rounded-3xl border border-white/20 bg-white/90 text-lg text-black transition-all duration-300 ease-in-out hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-zinc-50 px-2 text-zinc-500 dark:bg-black dark:text-zinc-400">
                or
              </span>
            </div>
          </div>

          <div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              theme="filled_black"
              shape="pill"
              ux_mode="redirect"
              login_uri="/api/auth/callback"
            />
          </div>
        </div>
      </div>
    </>
  );
}
