import { NextResponse } from 'next/server';
import { getUserInfoFromCookies } from '@/lib/cookie_utils/getUserInfo';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = getUserInfoFromCookies(request);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}