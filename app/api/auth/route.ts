import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name } = body;

    if (action === 'login') {
      const user = getUserByEmail(email);
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
      return NextResponse.json({ user: payload });
    }

    if (action === 'register') {
      const existing = getUserByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      if (!name || !email || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }
      const user = createUser(name, email, password);
      const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
      return NextResponse.json({ user: payload }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
