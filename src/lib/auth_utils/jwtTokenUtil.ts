import * as jwt from 'jsonwebtoken';
import { User } from '@/types/user.types';
const secretKey: string = process.env.JWT_SECRET!;

export function generateToken(payload: User | Record<string, unknown>): string {
  const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });
  return token;
}

export function verifyToken(token: string) {
  try {
    const decodedPayload = jwt.verify(token, secretKey);
    return { success: true, decodedPayload: decodedPayload };
  } catch (error) {
    console.log(
      'invalid or expired token received',
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
