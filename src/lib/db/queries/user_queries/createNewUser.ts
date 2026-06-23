import { Prisma } from "@/generated/prisma/client";
import { prisma } from "../../prisma";
import { User } from "@/types/user.types";

export async function createNewUser(user: User) {
    // id | name | email | joinedAt | profilePicture | password
    const passwordHash = user.passwordHash !== undefined ? user.passwordHash : null;
    const profilePic = user.profilePic!==undefined ? user.profilePic : null;

    console.log(passwordHash);
    return await prisma.$transaction(async (tx) => {
        let userRow = Prisma.sql`
        (   ${user.id},
            ${user.firstName + ' ' + user.lastName},
            ${user.email}, 
            NOW(),
            ${profilePic}::bytea,
            ${passwordHash})
        `;

        await tx.$executeRaw`
        INSERT INTO "User" VALUES ${userRow}
        `
    });
}

