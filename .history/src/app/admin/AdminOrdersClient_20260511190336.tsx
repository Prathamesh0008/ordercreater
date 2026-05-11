"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PACKED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

type AdminOrder = {
  id: string;
  routeType: "EUROPE_TO_EUROPE" | "US";
  title: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  contactPhone?: string | null;
  status?: OrderStatus | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  items: {
    id: string;
    name: string;
    quantity: number;
  }[];
};

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PACKED", label: "Packed" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

function getStatusLabel(status?: string | null) {
  return (
    ORDER_STATUSES.find((item) => item.value === status)?.label || "Pending"
  );
}

export default function AdminOrdersClient({
  orders,
}: {
  orders: AdminOrder[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<AdminOrder[]>(orders);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const previousOrders = localOrders;

    setUpdatingId(orderId);

    setLocalOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Status update failed");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setLocalOrders(previousOrders);
      alert(error instanceof Error ? error.message : "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  if (localOrders.length === 0) {
    return <p className="muted">No orders found.</p>;
  }

  return (
    <>
      {localOrders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-top">
            <div>
              <h3>{order.title}</h3>
              <small>Order ID: {order.id}</small>
            </div>

            <div className="admin-status-box">
              <span className="badge">
                {order.routeType === "EUROPE_TO_EUROPE" ? "Europe" : "US"}
              </span>

              <select
                className="status-select"
                value={order.status || "PENDING"}
                disabled={updatingId === order.id || isPending}
                onChange={(e) =>
                  updateStatus(order.id, e.target.value as OrderStatus)
                }
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p>{order.address}</p>

          <p>
            {order.city || "-"}, {order.state || "-"} -{" "}
            {order.zipCode || "-"}, {order.country || "-"}
          </p>

          {order.contactPhone ? <p>Phone: {order.contactPhone}</p> : null}

          <p>
            Ordered by: <b>{order.user?.name || "Unknown"}</b>{" "}
            ({order.user?.email || "n/a"})
          </p>

          <p>
            Status: <b>{getStatusLabel(order.status)}</b>
          </p>

          <small>{new Date(order.createdAt).toLocaleString("en-IN")}</small>

          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.name} x {item.quantity}
              </li>
            ))}
          </ul>

          {updatingId === order.id ? (
            <p className="muted">Updating status...</p>
          ) : null}
        </div>
      ))}
    </>
  );
}