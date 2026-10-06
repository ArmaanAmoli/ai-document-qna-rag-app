import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth_utils/passwordUtil';
import { generateToken } from '@/lib/auth_utils/jwtTokenUtil';
import { User } from '@/types/user.types';
import { searchUserByEmail } from '@/lib/db/queries/user_queries/checkIfUserExist';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  try {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const users = await searchUserByEmail(email);
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userRecord = users[0];

    // Check if user has a password (not OAuth-only)
    if (!userRecord.password) {
      return NextResponse.json(
        { error: 'This account uses Google OAuth. Please sign in with Google.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, userRecord.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create user object for token
    const nameParts = userRecord.name.split(' ');
    const user: User = {
      id: userRecord.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: userRecord.email,
      tenantId: undefined,
      roles: [],
    };

    // Generate token
    const token = generateToken(user);

    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    }); // 30 days

    return NextResponse.json({ authSuccess: true }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ authSuccess: false, error: 'Login failed' }, { status: 500 });
  }
}
