import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, ensureAdminUser, findUserByEmail } from "@/lib/data";
import { signSession } from "@/lib/auth";
import { sessionCookieName } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  whatsappNumber: z.string().min(8).max(20),
  profilePhoto: z.string().min(20),
});

export async function POST(req: Request) {
  await ensureAdminUser();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid input" }, { status: 400 });

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@kva.com").toLowerCase();
  const { name, email, password, whatsappNumber, profilePhoto } = parsed.data;

  if (email.toLowerCase() === adminEmail) {
    return NextResponse.json({ message: "This email is reserved for admin" }, { status: 403 });
  }

  const existing = await findUserByEmail(email);
  if (existing) return NextResponse.json({ message: "Email already exists" }, { status: 409 });

  const user = await createUser(name, email, password, whatsappNumber, profilePhoto);
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
