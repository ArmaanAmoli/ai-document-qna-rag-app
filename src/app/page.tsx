'use client';

import { SetStateAction, useState, Dispatch } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ChangeEvent } from 'react';

type EnterMode = 'login' | 'signup';

export default function LandingPage() {
  const [mode, setMode] = useState<EnterMode>('login');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [cpassword, setCpassword] = useState<string>('');

  const setter = (
    callback: Dispatch<SetStateAction<string>>,
    event: ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    callback(event.target.value);
  };

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center gap-24 overflow-hidden p-8 font-mono">
        <h1 className="animate-typewriter font-mono text-5xl">Welcome to Recall.ai</h1>
        <div className="flex w-[400px] flex-col justify-center gap-4 rounded-xl border border-white/20 px-4 py-4">
          <div className="flex h-[40px] w-full gap-1 overflow-hidden rounded-md">
            <button
              className={`flex flex-1 items-center justify-center rounded-md border border-white/20 ${mode === 'login' ? 'bg-white/90 text-black' : 'bg-white/20 text-white'} transition-color text-lg duration-300 ease-in-out hover:bg-white hover:text-black`}
              onClick={() => {
                setMode('login');
              }}
            >
              Login
            </button>

            <button
              className={`flex flex-1 items-center justify-center rounded-md border border-white/20 ${mode === 'signup' ? 'bg-white/90 text-black' : 'bg-white/20 text-white'} transition-color text-lg duration-300 ease-in-out hover:bg-white hover:text-black`}
              onClick={() => {
                setMode('signup');
              }}
            >
              Signup
            </button>
          </div>

          {mode === 'login' && (
            <div className="flex w-full flex-col gap-4 py-4">
              <input
                type="text"
                placeholder="Email"
                className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
              ></input>
              <input
                type="password"
                placeholder="Password"
                className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
              ></input>
            </div>
          )}

          {mode === 'signup' && (
            <div className="flex w-full flex-col gap-4 py-4">
              <div className="flex h-[40px] gap-2 rounded-xl">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={event => {
                    setter(setFirstName, event);
                  }}
                  className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
                ></input>

                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={event => {
                    setter(setLastName, event);
                  }}
                  className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
                ></input>
              </div>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={event => {
                  setter(setEmail, event);
                }}
                className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
              ></input>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={event => {
                  setter(setPassword, event);
                }}
                className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
              ></input>

              <input
                type="password"
                placeholder="Confirm password"
                value={cpassword}
                onChange={event => {
                  setter(setCpassword, event);
                }}
                className="flex h-[40px] w-full resize-none rounded-xl border border-white/20 px-4 focus:outline-none"
              ></input>
            </div>
          )}

          <button
            className={`flex h-[40px] items-center justify-center rounded-3xl border border-white/20 bg-white/90 text-lg text-black transition-all duration-300 ease-in-out hover:bg-white hover:text-black`}
          >
            Continue
          </button>

          <h1 className="flex w-full justify-center border-b border-white/20">or</h1>

          <div>
            <GoogleLogin
              onSuccess={credentialResponse => {
                console.log(credentialResponse);
              }}
              theme="filled_black"
              shape="pill"
              ux_mode="redirect"
              login_uri="http://localhost:3000/api/auth/callback"
            ></GoogleLogin>
          </div>
        </div>
      </div>
    </>
  );
}
