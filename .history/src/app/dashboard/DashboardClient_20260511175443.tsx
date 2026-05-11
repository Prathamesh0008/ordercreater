"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [tab, setTab] = useState<"new" | "history" | "recipients">("new");
  const router = useRouter();

  return (
    <main className="page-grid">
      <aside className="sidebar">
        <div className="brand-block">
          <h2>KVA Logistics</h2>
          <p className="muted">Order Workspace</p>
        </div>

        <div className="user-pill">
          <strong>{userName}</strong>
          <span>{userEmail}</span>
        </div>

        <div className="nav-group">
          <button className={tab === "new" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("new")}>New Order</button>
          <button className={tab === "history" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("history")}>Your Orders</button>
          <button className={tab === "recipients" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("recipients")}>Recipients</button>
        </div>

        <button
          className="secondary"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
          }}
        >
          Logout
        </button>
      </aside>

      <section className="content-wrap">
        {tab === "new" ? <NewOrderForm /> : null}

        {tab === "history" ? (
          <div className="panel">
            <div className="panel-head">
              <h2>Your Orders History</h2>
              <span className="badge">{initialOrders.length} orders</span>
            </div>
            {initialOrders.length === 0 ? <p className="muted">No order yet.</p> : null}
            {initialOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-top">
                  <h3>{order.title}</h3>
                  <span className="badge">{order.routeType === "EUROPE_TO_EUROPE" ? "Europe" : "US"}</span>
                </div>
                <p>{order.address}</p>
                <p>{order.city || "-"}, {order.state || "-"} - {order.zipCode || "-"}, {order.country || "-"}</p>
                <small>{new Date(order.createdAt).toLocaleString()}</small>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>{item.name} x {item.quantity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "recipients" ? <RecipientsPanel recipients={initialRecipients} /> : null}
      </section>
    </main>
  );
}
