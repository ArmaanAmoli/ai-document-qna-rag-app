import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { verifyToken , generateToken } from "@/lib/auth_utils/jwtTokenUtil";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request:Request){
    try{
        const formData = await request.formData();
        const credential = formData.get('credential') as string; // this is the Google JWT token

        if(!credential){
            return NextResponse.json({error: 'No credential found'} , {status:400});
        }

        //verify the id token
        const ticket = await client.verifyIdToken({
            idToken:credential,
            audience:process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID // ensure the token was generated for this app
        });

        const payload = ticket.getPayload();

        if(!payload){
            return NextResponse.json({error:'Invalid token payload'} , {status:401});
        }

        if(!payload.email_verified){ // checking if google verified the email before login.
            return NextResponse.json({error:'Email not verified'} , {status:401});
        }

        const userId = payload.sub; //21 digit google account id
        const eamil = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        const Name:string[] = name!.split(' ');

        /* Now save these credential to database as new user or if exist let the user login */

    }
    catch(error){
        return NextResponse.json({error:'Authentication failed'} , {status:500});
    }
}