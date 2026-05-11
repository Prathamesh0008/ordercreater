import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role === "ADMIN") return NextResponse.json({ message: "Admins cannot use recipient template" }, { status: 403 });

  const rows = [
    { Name: "Tony Masala Production", Address: "EMA Internationals, 400706, Navi Mumbai", ContactPhone: "9876543210" },
    { Name: "Rushikesh Traders", Address: "Shop 12, MG Road, Pune, Maharashtra", ContactPhone: "9988776655" },
    { Name: "Global Exports", Address: "Warehouse 4, Port Area, Mumbai", ContactPhone: "9123456780" },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Recipients");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=recipients-demo-template.xlsx",
      "Cache-Control": "no-store",
    },
  });
}
