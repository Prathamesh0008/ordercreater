import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrdersBulk, getOrdersByUser } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  parcels: z.array(
    z.object({
      routeType: z.enum(["EUROPE_TO_EUROPE", "US"]),
      title: z.string().min(2),
      address: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      zipCode: z.string().min(3),
      country: z.string().min(2),
      contactPhone: z.string().optional(),
      saveAddress: z.boolean().optional(),
      items: z.array(z.object({ name: z.string().min(1), quantity: z.number().int().positive() })).min(1),
    })
  ).min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Admins cannot access user orders" }, { status: 403 });
  return NextResponse.json(await getOrdersByUser(user.id));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Admins cannot create user orders" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid order payload" }, { status: 400 });

  const created = await createOrdersBulk(user.id, parsed.data.parcels);
  return NextResponse.json({ ok: true, createdCount: created.length, orders: created }, { status: 201 });
}
