import { getOrdersByUser, getRecipientsByUser } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");

  const [orders, recipients] = await Promise.all([
    getOrdersByUser(user.id),
    getRecipientsByUser(user.id),
  ]);

  return (
    <DashboardClient
      userName={user.name}
      userEmail={user.email}
      initialOrders={orders}
      initialRecipients={recipients}
    />
  );
}
