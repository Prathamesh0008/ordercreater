"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NewOrderForm } from "./NewOrderForm";
import { RecipientsPanel } from "./RecipientsPanel";

type Order = {
  id: string;
  routeType: "EUROPE_TO_EUROPE" | "US";
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  status?: string;
  trackingId?: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number }[];
};

type Recipient = {
  id: string;
  name: string;
  address: string;
  contactPhone?: string;
  createdAt: string;
};

type DashboardTab = "new" | "history" | "recipients";

function formatStatus(status?: string) {
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

function getStatusClass(status?: string) {
  const key = status || "PENDING";
  const map: Record<string, string> = {
    PENDING: "status-pill pending",
    PROCESSING: "status-pill processing",
    PACKED: "status-pill packed",
    IN_TRANSIT: "status-pill transit",
    DELIVERED: "status-pill delivered",
    CANCELLED: "status-pill cancelled",
  };

  return map[key] || "status-pill pending";
}

export function DashboardClient({
  userName,
  userEmail,
  initialOrders,
  initialRecipients,
}: {
  userName: string;
  userEmail: string;
  initialOrders: Order[];
  initialRecipients: Recipient[];
}) {
  const [tab, setTab] = useState<DashboardTab>("new");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  function changeTab(nextTab: DashboardTab) {
    setTab(nextTab);
    setMobileMenuOpen(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="page-grid client-page-grid">
      <header className="mobile-topbar">
        <div>
          <p className="muted">Order Workspace</p>
        </div>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {mobileMenuOpen ? (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={
          mobileMenuOpen
            ? "sidebar desktop-sidebar mobile-drawer mobile-drawer-open"
            : "sidebar desktop-sidebar mobile-drawer"
        }
      >
        <div className="mobile-drawer-head">
          <div className="brand-block">
            <p className="muted">Order Workspace</p>
          </div>

          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="user-pill">
          <strong>{userName}</strong>
          <span>{userEmail}</span>
        </div>

        <div className="nav-group">
          <button
            type="button"
            className={tab === "new" ? "nav-btn active" : "nav-btn"}
            onClick={() => changeTab("new")}
          >
            New Order
          </button>

          <button
            type="button"
            className={tab === "history" ? "nav-btn active" : "nav-btn"}
            onClick={() => changeTab("history")}
          >
            Your Orders
          </button>

          <button
            type="button"
            className={tab === "recipients" ? "nav-btn active" : "nav-btn"}
            onClick={() => changeTab("recipients")}
          >
            Recipients
          </button>
        </div>

        <button type="button" className="secondary" onClick={logout}>
          Logout
        </button>
      </aside>

      <section className="content-wrap client-content-wrap">
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="muted">Total Orders</span>
            <strong>{initialOrders.length}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Saved Recipients</span>
            <strong>{initialRecipients.length}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Workspace</span>
            <strong>{tab === "new" ? "New Order" : tab === "history" ? "Orders" : "Recipients"}</strong>
          </div>
        </div>

        {tab === "new" ? <NewOrderForm /> : null}

        {tab === "history" ? (
          <div className="panel">
            <div className="panel-head">
              <h2>Your Orders History</h2>
              <span className="badge">{initialOrders.length} orders</span>
            </div>

            {initialOrders.length === 0 ? (
              <p className="empty-state">No order yet.</p>
            ) : null}

            {initialOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-top">
                  <h3>{order.title}</h3>
                  <span className="badge">
                    {order.routeType === "EUROPE_TO_EUROPE" ? "Europe" : "US"}
                  </span>
                </div>

                <div className="user-order-status-row">
                  <div>
                    <span className="muted">Status</span>
                    <strong className={getStatusClass(order.status)}>{formatStatus(order.status)}</strong>
                  </div>

                  <div>
                    <span className="muted">Tracking ID</span>
                    <strong>{order.trackingId || "Not added yet"}</strong>
                  </div>
                </div>

                <p>{order.address}</p>

                <p>
                  {order.city || "-"}, {order.state || "-"} -{" "}
                  {order.zipCode || "-"}, {order.country || "-"}
                </p>

                <small>{new Date(order.createdAt).toLocaleString("en-IN")}</small>

                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "recipients" ? (
          <RecipientsPanel recipients={initialRecipients} />
        ) : null}
      </section>
    </main>
  );
}
