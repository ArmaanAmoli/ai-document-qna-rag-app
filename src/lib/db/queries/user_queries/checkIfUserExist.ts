import { Prisma } from "@/generated/prisma/client";
import {prisma} from "../../prisma";
import { User } from "@/types/user.types";

export async function searchUser(userId: string){
    const user = await prisma.$queryRaw`(SELECT id , name , email , "joinedAt" FROM "User" WHERE id=${userId})`;
    return user;
}
// returns an array of record objects if array size zero user does not exist;