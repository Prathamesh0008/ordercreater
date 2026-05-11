import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { deleteRecipientById, getRecipientsByUser, upsertRecipient } from "@/lib/data";

const schema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  contactPhone: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Admins cannot access recipients" }, { status: 403 });
  return NextResponse.json(await getRecipientsByUser(user.id));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Admins cannot create recipients" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid recipient payload" }, { status: 400 });

  const recipient = await upsertRecipient(user.id, parsed.data.name, parsed.data.address, parsed.data.contactPhone);
  return NextResponse.json(recipient, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Admins cannot delete recipients" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Recipient id required" }, { status: 400 });

  const deleted = await deleteRecipientById(user.id, id);
  if (!deleted) return NextResponse.json({ message: "Recipient not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
