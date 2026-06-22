import * as jwt from 'jsonwebtoken'
    const secretKey:string = process.env.JWT_SECRET!;

export function generateToken(payload:Record<string,unknown>):string{
    const token = jwt.sign(payload , secretKey , {expiresIn:'30d'} )
    return token;
}

export function verifyToken(token:string){
    try{
       const decoadedPayload = jwt.verify(token , secretKey);
       return {"success":true , "decoadedPayload":decoadedPayload};
    }catch(error:any){
        console.log('invalid or expired token received' , error.message);
        return {"success":false , "error":error.message};
    }
}