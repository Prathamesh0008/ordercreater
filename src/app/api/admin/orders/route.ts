import { NextResponse } from "next/server";
import { getAllOrdersWithUsers } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(await getAllOrdersWithUsers());
}
