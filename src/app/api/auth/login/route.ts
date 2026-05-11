import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureAdminUser, verifyUser } from "@/lib/data";
import { signSession } from "@/lib/auth";
import { sessionCookieName } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  await ensureAdminUser();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid input" }, { status: 400 });

  const user = await verifyUser(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const token = await signSession({ id: user.id, name: user.name, email: user.email, role: user.role });

  (await cookies()).set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, role: user.role });
}
