import { ensureAdminUser, getAllOrdersWithUsers } from "@/lib/data";
import { requireAdmin } from "@/lib/session";
import { LogoutButton } from "../dashboard/LogoutButton";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminPage() {
  await ensureAdminUser();

  const admin = await requireAdmin();
  const orders = await getAllOrdersWithUsers();

  const formattedOrders = orders.map((order) => ({
    ...order,
    status: order.status || "PENDING",
    createdAt: new Date(order.createdAt).toISOString(),
  }));

  return (
    <main className="page-grid">
      <aside className="sidebar">
        <div className="brand-block">
          <h2>Admin Panel</h2>
          <p className="muted">KVA Control Room</p>
        </div>

        <div className="user-pill">
          <strong>{admin.name}</strong>
          <span>{admin.email}</span>
        </div>

        <a className="nav-btn active" href="/api/admin/orders/export">
          Export Excel
        </a>

        <LogoutButton />
      </aside>

      <section className="content-wrap">
        <div className="panel">
          <div className="panel-head">
            <h2>All User Orders</h2>
            <span className="badge">{orders.length} total</span>
          </div>

          <AdminOrdersClient orders={formattedOrders} />
        </div>
      </section>
    </main>
  );
}