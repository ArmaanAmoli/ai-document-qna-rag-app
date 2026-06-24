"use client";

import { SetStateAction, useState , Dispatch} from "react";
import { GoogleLogin} from "@react-oauth/google";
import { ChangeEvent } from "react";

type EnterMode = 'login' | 'signup';

export default function LandingPage() {

    const [mode, setMode] = useState<EnterMode>('login');
    const [email , setEmail] = useState<string>('');
    const [firstName , setFirstName] = useState<string>('');
    const [lastName , setLastName] = useState<string>('');
    const [password , setPassword] = useState<string>('');
    const [cpassword , setCpassword] = useState<string>('');


    const setter = (callback:Dispatch<SetStateAction<string>> , event:ChangeEvent<HTMLInputElement, HTMLInputElement>)=>{
        callback(event.target.value);
    }

    return (
        <>
                <div className="h-screen w-screen overflow-hidden flex p-8 items-center justify-center gap-24 font-mono">
                    <h1 className="text-5xl font-mono animate-typewriter">Welcome to Recall.ai</h1>
                    <div className="flex flex-col border border-white/20 w-[400px] rounded-xl px-4 py-4 gap-4 justify-center">

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
                            <div className=" flex rounded-xl h-[40px] gap-2">
                                <input type="text" placeholder="First Name" value={firstName} onChange={(event)=>{setter(setFirstName , event)}}
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>

                                <input type="text" placeholder="Last Name" value={lastName} onChange={(event)=>{setter(setLastName , event)}}
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>
                            </div>
                            <input type="text" placeholder="Email" value={email} onChange={(event)=>{setter(setEmail , event)}}
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>

                            <input type="password" placeholder="Password" value={password} onChange = {(event)=>{setter(setPassword , event)}}
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>

                            <input type="password" placeholder="Confirm password" value={cpassword} onChange = {(event)=>{setter(setCpassword , event)}}
                                className="flex w-full rounded-xl border border-white/20 h-[40px] px-4 focus:outline-none resize-none"></input>
                        </div>
                        
                        }

                        <button className={`flex border border-white/20 justify-center items-center rounded-3xl h-[40px]
                            bg-white/90 text-black hover:bg-white hover:text-black transition-all ease-in-out duration-300
                            text-lg`} >Continue</button>

                        <h1 className="w-full border-b border-white/20 flex justify-center">or</h1>

                        <div>
                            <GoogleLogin onSuccess={credentialResponse=>{console.log(credentialResponse)}} theme="filled_black"
                                 shape="pill" ux_mode="redirect" login_uri="http://localhost:3000/api/auth/callback"></GoogleLogin>
                        </div>

                    </div>
                </div>

        </>)
}