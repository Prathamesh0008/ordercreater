import { NextResponse } from "next/server";
import {
  OrderStatus,
  updateOrderAdminFields,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

const ALLOWED_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "PACKED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(
  req: Request,
  context: {
    params: { orderId: string } | Promise<{ orderId: string }>;
  }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await context.params;
  const body = await req.json();

  const status = String(body.status || "").trim() as OrderStatus;
  const trackingId = String(body.trackingId || "").trim();

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { message: "Invalid order status" },
      { status: 400 }
    );
  }

  const updatedOrder = await updateOrderAdminFields({
    orderId,
    status,
    trackingId,
  });

  if (!updatedOrder) {
    return NextResponse.json(
      { message: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Order updated",
    order: updatedOrder,
  });
}