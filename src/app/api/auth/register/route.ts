import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth_utils/passwordUtil';
import { generateToken } from '@/lib/auth_utils/jwtTokenUtil';
import { User } from '@/types/user.types';
import { searchUser } from '@/lib/db/queries/user_queries/checkIfUserExist';
import { createNewUser } from '@/lib/db/queries/user_queries/createNewUser';
import { cookies } from 'next/headers';

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

export async function POST(request: Request) {
  const cookieStore = await cookies();

  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required: firstName, lastName, email, password' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await searchUser(email);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
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

    return NextResponse.json({ authSuccess: true }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ authSuccess: false, error: 'Registration failed' }, { status: 500 });
  }
}
