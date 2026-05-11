import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { importRecipientsBulk } from "@/lib/data";

const schema = z.object({
  recipients: z.array(
    z.object({
      name: z.string().min(2),
      address: z.string().min(5),
      contactPhone: z.string().optional(),
    })
  ).min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Admins cannot import recipients" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid import payload" }, { status: 400 });

  const result = await importRecipientsBulk(user.id, parsed.data.recipients);
  return NextResponse.json(result, { status: 201 });
}
