import { Prisma } from "@/generated/prisma/client";
import { prisma } from "../../prisma";
import { User } from "@/types/user.types";
import { Tsukimi_Rounded } from "next/font/google";

export async function createNewUser(user: User) {
    // id | name | email | joinedAt | profilePicture | password
    return await prisma.$transaction(async (tx) => {
        let userRow = Prisma.sql`()`;
        if (user.profilePic != undefined) {
            userRow = Prisma.sql`
            (${user.id},
            ${user.firstName + ' ' + user.lastName},
            ${user.email}, 
            NOW(),
            ${user.profilePic},
            ${user.passwordHash},)`;
        }
        else {
            userRow = Prisma.sql`
            (${user.id},
            ${user.firstName + ' ' + user.lastName},
            ${user.email}, 
            NOW(),
            NULL,
            ${user.passwordHash},)`;
        }

        await tx.$executeRaw`
        INSERT INTO "User" VALUE ${userRow}
        `
    })


}