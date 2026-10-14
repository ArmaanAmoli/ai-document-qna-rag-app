import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth_utils/passwordUtil';
import { generateToken } from '@/lib/auth_utils/jwtTokenUtil';
import { User } from '@/types/user.types';
import { searchUser } from '@/lib/db/queries/user_queries/checkIfUserExist';
import { createNewUser } from '@/lib/db/queries/user_queries/createNewUser';
import { cookies } from 'next/headers';
import { asyncHandler, Errors } from '@/lib/middleware/error-handler';
import { logger } from '@/lib/logger';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export const POST = asyncHandler(async (request: NextRequest) => {
  const cookieStore = await cookies();
  const correlationId = request.headers.get('x-correlation-id');

  const body = await request.json();
  const { email, password, firstName, lastName } = body;

  // Input validation
  if (!email || !password || !firstName || !lastName) {
    throw Errors.validationMissingField('firstName, lastName, email, password', { fields: ['firstName', 'lastName', 'email', 'password'] }, correlationId);
  }

  if (!validateEmail(email)) {
    throw Errors.validationInvalidInput('Invalid email format', { email }, correlationId);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw Errors.validationInvalidInput(passwordValidation.error!, { email }, correlationId);
  }

  // Check if user already exists
  const existingUser = await searchUser(email);
  if (existingUser.length > 0) {
    logger.warn('Registration attempt with existing email', { email, correlationId });
    throw Errors.databaseConstraintViolation('email', { email }, undefined, correlationId);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user: User = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    passwordHash,
    tenantId: undefined,
    roles: [],
  };

  await createNewUser(user);

  // Generate token
  const token = generateToken(user);

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  }); // 30 days

  logger.info('User registered successfully', { userId: user.id, email: user.email, correlationId });

  return NextResponse.json({ authSuccess: true }, { status: 201 });
});
