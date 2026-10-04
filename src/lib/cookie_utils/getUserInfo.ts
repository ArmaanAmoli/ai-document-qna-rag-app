import { NextRequest } from 'next/server';
import { verifyToken } from '../auth_utils/jwtTokenUtil';
import { User } from '@/types/user.types';

export function getUserInfoFromCookies(req: NextRequest): User {
  const tokenCookie = req.cookies.get('session')?.value;
  if (!tokenCookie) {
    throw new Error('No session cookie found');
  }
  const verification = verifyToken(tokenCookie);
  if (!verification.success || !verification.decodedPayload) {
    throw new Error('Invalid or expired session');
  }
  return verification.decodedPayload as User;
}
