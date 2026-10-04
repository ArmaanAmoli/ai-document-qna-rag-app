import { prisma } from '../../prisma';

interface UserRow {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
}

export async function searchUser(userId: string): Promise<UserRow[]> {
  const user = await prisma.$queryRaw<UserRow[]>`
    SELECT id, name, email, "joinedAt" FROM "User" WHERE id=${userId}
  `;
  return user;
}
// returns an array of record objects if array size zero user does not exist;
