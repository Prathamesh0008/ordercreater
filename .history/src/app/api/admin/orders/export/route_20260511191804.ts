import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAllOrdersWithUsers } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

function formatStatus(status?: string | null) {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    PACKED: "Packed",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return labels[status || "PENDING"] || "Pending";
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const orders = await getAllOrdersWithUsers();

  const rows = orders.map((order, index) => ({
    "Sr No": index + 1,
    "Order ID": order.id,
    "Order Status": formatStatus(order.status),
    "Tracking ID": order.trackingId || "",
    "Order Date": new Date(order.createdAt).toLocaleString("en-IN"),
    "Route Type":
      order.routeType === "EUROPE_TO_EUROPE" ? "Europe to Europe" : "US",
    "Receiver Name": order.title,
    "Delivery Address": order.address,
    City: order.city || "",
    State: order.state || "",
    "Zip Code": order.zipCode || "",
    Country: order.country || "",
    "Contact Phone": order.contactPhone || "",
    "User Name": order.user?.name || "",
    "User Email": order.user?.email || "",
    Products: order.items.map((i) => `${i.name} x ${i.quantity}`).join(", "),
    "Total Items": order.items.reduce((sum, i) => sum + i.quantity, 0),
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 38 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 24 },
    { wch: 45 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 30 },
    { wch: 45 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  const fileName = `kva2-orders-${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${fileName}`,
      "Cache-Control": "no-store",
    },
  });
}