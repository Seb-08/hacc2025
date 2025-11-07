import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

const AUTH_COOKIE = 'ets_auth';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// 1️⃣ Verify email + password against DB
export async function verifyCredentials(email: string, password: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as 'admin' | 'vendor',
  };
}

// 2️⃣ Set auth cookie (on login)
export async function setAuthCookie(user: {
  id: number;
  email: string;
  role: 'admin' | 'vendor';
}) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  // 👇 your environment: cookies() is async
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

// 3️⃣ Read user from auth cookie (server-side)
export async function getCurrentUser() {
  const cookieStore = await cookies(); // ✅ await here

  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: 'admin' | 'vendor';
    };
    return decoded;
  } catch {
    return null;
  }
}

// 4️⃣ Clear auth cookie (on logout)
export async function clearAuthCookie() {
  const cookieStore = await cookies(); // ✅ await here
  cookieStore.delete(AUTH_COOKIE);
}
