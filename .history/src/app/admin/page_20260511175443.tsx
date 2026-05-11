import { ensureAdminUser, getAllOrdersWithUsers } from "@/lib/data";
import { requireAdmin } from "@/lib/session";
import { LogoutButton } from "../dashboard/LogoutButton";

export default async function AdminPage() {
  await ensureAdminUser();
  const admin = await requireAdmin();
  const orders = await getAllOrdersWithUsers();

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
        <a className="nav-btn active" href="/api/admin/orders/export">Export Excel</a>
        <LogoutButton />
      </aside>

      <section className="content-wrap">
        <div className="panel">
          <div className="panel-head">
            <h2>All User Orders</h2>
            <span className="badge">{orders.length} total</span>
          </div>
          {orders.length === 0 ? <p className="muted">No orders found.</p> : null}
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-top">
                <h3>{order.title}</h3>
                <span className="badge">{order.routeType === "EUROPE_TO_EUROPE" ? "Europe" : "US"}</span>
              </div>
              <p>{order.address}</p>
              <p>{order.city || "-"}, {order.state || "-"} - {order.zipCode || "-"}, {order.country || "-"}</p>
              <p>
                Ordered by: <b>{order.user?.name || "Unknown"}</b> ({order.user?.email || "n/a"})
              </p>
              <small>{new Date(order.createdAt).toLocaleString()}</small>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>{item.name} x {item.quantity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
