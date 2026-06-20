"use client";

import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin} from "@react-oauth/google";

type EnterMode = 'login' | 'signup';

export default function LandingPage() {

    const [mode, setMode] = useState<EnterMode>('login');
    return (
        <>
            <GoogleOAuthProvider clientId={process.env.NEXT_GOOGLE_CLIENT_ID!}>
                <div className="h-screen w-screen overflow-hidden flex p-8 items-center justify-center gap-24 font-mono">
                    <h1 className="text-5xl font-mono animate-typewriter">Welcome to Recall.ai</h1>
                    <div className="flex flex-col border border-white/20 h-[460px] w-[400px] rounded-xl px-4 py-8 gap-4 justify-center">

                        <div className="flex h-[40px] w-full gap-1 overflow-hidden rounded-md">
                            <button className={`flex flex-1 border border-white/20 justify-center items-center rounded-md
                            ${mode === 'login' ? 'bg-white/90 text-black' : 'bg-white/20 text-white'} hover:bg-white hover:text-black transition-color ease-in-out duration-300
                            text-lg`} onClick={() => { setMode('login') }}>Login</button>

                            <button className={`flex flex-1 border border-white/20 justify-center items-center rounded-md
                            ${mode === 'signup' ? 'bg-white/90 text-black' : 'bg-white/20 text-white'} hover:bg-white hover:text-black transition-color ease-in-out duration-300
                            text-lg`} onClick={() => { setMode('signup') }}>Signup</button>
                        </div>

                        {mode === 'login' && <div className="flex flex-col w-full py-4 gap-4">
                            <input type="text" placeholder="Email"
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>
                            <input type="password" placeholder="Password"
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>
                        </div>}

                        {mode === 'signup' && <div className="flex flex-col w-full py-4 gap-4">
                            <input type="text" placeholder="Email"
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>
                            <input type="password" placeholder="Password"
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>
                            <input type="password" placeholder="Confirm password"
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>
                        </div>}

                        <h1 className="w-full border-b border-white/20 flex justify-center">or</h1>

                        <div>
                            <GoogleLogin onSuccess={credentialResponse=>{console.log(credentialResponse)}} theme="filled_black"
                                 shape="pill"></GoogleLogin>
                        </div>

                    </div>
                </div>
            </GoogleOAuthProvider>

        </>)
}