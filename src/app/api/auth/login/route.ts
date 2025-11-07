import { NextResponse } from 'next/server';
import { verifyCredentials, setAuthCookie } from '~/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 },
      );
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    await setAuthCookie(user);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
