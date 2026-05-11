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
  trackingId?: string | null;
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

  async function updateOrder(orderId: string) {
    const order = localOrders.find((item) => item.id === orderId);

    if (!order) return;

    setUpdatingId(orderId);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: order.status || "PENDING",
          trackingId: order.trackingId || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Order update failed");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Order update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  function updateLocalOrder(
    orderId: string,
    field: "status" | "trackingId",
    value: string
  ) {
    setLocalOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              [field]: value,
            }
          : order
      )
    );
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

            <span className="badge">
              {order.routeType === "EUROPE_TO_EUROPE" ? "Europe" : "US"}
            </span>
          </div>

          <div className="admin-order-controls">
            <div>
              <label>Order Status</label>
              <select
                className="status-select"
                value={order.status || "PENDING"}
                disabled={updatingId === order.id || isPending}
                onChange={(e) =>
                  updateLocalOrder(order.id, "status", e.target.value)
                }
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Tracking ID</label>
              <input
                className="tracking-input"
                value={order.trackingId || ""}
                disabled={updatingId === order.id || isPending}
                onChange={(e) =>
                  updateLocalOrder(order.id, "trackingId", e.target.value)
                }
                placeholder="Enter tracking ID"
              />
            </div>

            <button
              type="button"
              onClick={() => updateOrder(order.id)}
              disabled={updatingId === order.id || isPending}
            >
              {updatingId === order.id ? "Saving..." : "Save"}
            </button>
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

          <p>
            Tracking ID: <b>{order.trackingId || "Not added yet"}</b>
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
    </>
  );
}