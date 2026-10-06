import { prisma } from '../../prisma';

interface UserRow {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  password?: string;
}

export async function searchUserById(userId: string): Promise<UserRow[]> {
  const user = await prisma.$queryRaw<UserRow[]>`
    SELECT id, name, email, "joinedAt", password FROM "User" WHERE id=${userId}
  `;
  return user;
}

export async function searchUserByEmail(email: string): Promise<UserRow[]> {
  const user = await prisma.$queryRaw<UserRow[]>`
    SELECT id, name, email, "joinedAt", password FROM "User" WHERE email=${email}
  `;
  return user;
}

// Backward compatibility
export async function searchUser(userId: string): Promise<UserRow[]> {
  return searchUserById(userId);
}
// returns an array of record objects if array size zero user does not exist;
