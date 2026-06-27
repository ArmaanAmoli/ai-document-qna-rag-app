import { NextRequest } from "next/server";
import { verifyToken } from "../auth_utils/jwtTokenUtil";
import { User } from "@/types/user.types";

export function getUserInfoFromCookies(req:NextRequest):User{
    const tokenCookie = req.cookies.get('session')?.value;
    const userInfo = verifyToken(tokenCookie!).decoadedPayload! as User;
    return userInfo;
}