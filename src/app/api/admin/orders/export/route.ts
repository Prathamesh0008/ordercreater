import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAllOrdersWithUsers } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const orders = await getAllOrdersWithUsers();

  const rows = orders.map((order, index) => ({
    "Sr No": index + 1,
    "Order ID": order.id,
    "Order Date": new Date(order.createdAt).toLocaleString("en-IN"),
    "Route Type": order.routeType === "EUROPE_TO_EUROPE" ? "Europe to Europe" : "US",
    "Receiver Name": order.title,
    "Delivery Address": order.address,
    City: order.city || "",
    State: order.state || "",
    "Zip Code": order.zipCode || "",
    Country: order.country || "",
    "Contact Phone": order.contactPhone || "",
    "User Name": order.user?.name || "",
    "User Email": order.user?.email || "",
    "Products": order.items.map((i) => `${i.name} x ${i.quantity}`).join(", "),
    "Total Items": order.items.reduce((sum, i) => sum + i.quantity, 0),
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const fileName = `kva2-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${fileName}`,
      "Cache-Control": "no-store",
    },
  });
}
