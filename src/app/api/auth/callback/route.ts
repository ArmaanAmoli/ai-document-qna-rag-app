import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "@/lib/auth_utils/jwtTokenUtil";
import { User } from "@/types/user.types";
import { searchUser } from "@/lib/db/queries/user_queries/checkIfUserExist";
import { createNewUser } from "@/lib/db/queries/user_queries/createNewUser";

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
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;
        const Name:string[] = name!.split(' ');
        /* Now save these credential to database as new user or if exist let the user login */

        const user:User = {
            id:userId,
            firstName: Name[0],
            lastName: Name[1],
            email: email!,
        }

        const searchedUser:any = await searchUser(userId);
        if(searchedUser.length === 0){
            //create new user then return the jwt token
            try{
                await createNewUser(user);
            }catch(error){
                console.log("New User Creation Failed: ",error);
                throw new Error("New User Creation Failed.");
            }
        }
        //just return the jwt token
        const token = generateToken(user);

        return NextResponse.json({authSuccess:true , token} , {status:200});
        

    }
    catch(error){
        return NextResponse.json({authSuccess:false , error:'Authentication failed'} , {status:500});
    }
}