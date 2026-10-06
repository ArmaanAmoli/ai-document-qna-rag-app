import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from '@/lib/auth_utils/jwtTokenUtil';
import { User } from '@/types/user.types';
import { searchUser } from '@/lib/db/queries/user_queries/checkIfUserExist';
import { createNewUser } from '@/lib/db/queries/user_queries/createNewUser';
import { cookies } from 'next/headers';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  const cookieStore = await cookies();

  try {
    const formData = await request.formData();
    const credential = formData.get('credential') as string;

    if (!credential) {
      return NextResponse.json({ error: 'No credential found' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    if (!payload.email_verified) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 401 });
    }

    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const Name = name ? name.split(' ') : ['', ''];

    const user: User = {
      id: userId,
      firstName: Name[0],
      lastName: Name[1] || '',
      email: email!,
      tenantId: undefined,
      roles: [],
    };

    const searchedUser = await searchUser(userId);
    if (searchedUser.length === 0) {
      try {
        await createNewUser(user);
      } catch (error) {
        console.log('New User Creation Failed: ', error);
        throw new Error('New User Creation Failed.');
      }
    }

    const token = generateToken(user);

    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    }); // 30 days

    return NextResponse.json({ authSuccess: true }, { status: 200 });
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ authSuccess: false, error: String(error) }, { status: 500 });
  }
}
