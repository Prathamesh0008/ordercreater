"use client";

import { FormEvent, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Item = { name: string; quantity: number };
type Parcel = {
  routeType: "EUROPE_TO_EUROPE" | "US";
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactPhone: string;
  saveAddress: boolean;
  items: Item[];
};

const emptyParcel = (): Omit<Parcel, "routeType"> => ({
  title: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  contactPhone: "",
  saveAddress: false,
  items: [],
});

export function NewOrderForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [routeType, setRouteType] = useState<"EUROPE_TO_EUROPE" | "US" | "">("");
  const [parcelForm, setParcelForm] = useState<Omit<Parcel, "routeType">>(emptyParcel());
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [productQty, setProductQty] = useState(1);
  const [error, setError] = useState("");

  function addProductToParcel() {
    if (productName.trim().length < 1) return;
    setParcelForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: productName.trim(), quantity: productQty }],
    }));
    setProductName("");
    setProductQty(1);
  }

  function removeProductFromParcel(index: number) {
    setParcelForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function validateParcel() {
    if (!routeType) return "Select shipment type";
    if (parcelForm.title.trim().length < 2) return "Receiver name required";
    if (parcelForm.address.trim().length < 5) return "Address required";
    if (parcelForm.city.trim().length < 2) return "City required";
    if (parcelForm.state.trim().length < 2) return "State required";
    if (parcelForm.zipCode.trim().length < 3) return "Zip code required";
    if (parcelForm.country.trim().length < 2) return "Country required";
    if (parcelForm.items.length === 0) return "At least one product required";
    return "";
  }

  function addOrUpdateParcel() {
    const msg = validateParcel();
    if (msg) return setError(msg);

    const payload: Parcel = { ...parcelForm, routeType } as Parcel;

    if (editingIndex !== null) {
      setParcels((prev) => prev.map((p, idx) => (idx === editingIndex ? payload : p)));
      setEditingIndex(null);
    } else {
      setParcels((prev) => [...prev, payload]);
    }

    setParcelForm(emptyParcel());
    setProductName("");
    setProductQty(1);
    setError("");
  }

  function editParcel(index: number) {
    const p = parcels[index];
    setRouteType(p.routeType);
    setParcelForm({
      title: p.title,
      address: p.address,
      city: p.city || "",
      state: p.state || "",
      zipCode: p.zipCode || "",
      country: p.country || "",
      contactPhone: p.contactPhone,
      saveAddress: p.saveAddress,
      items: p.items,
    });
    setEditingIndex(index);
    setStep(2);
  }

  function removeParcel(index: number) {
    setParcels((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setParcelForm(emptyParcel());
    }
  }

  async function confirmAll(e: FormEvent) {
    e.preventDefault();
    if (parcels.length === 0) return setError("Add at least one parcel");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parcels }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Order creation failed");
      return;
    }

    router.refresh();
    setStep(1);
    setRouteType("");
    setParcelForm(emptyParcel());
    setParcels([]);
    setEditingIndex(null);
    setProductName("");
    setProductQty(1);
    setError("");
  }

  return (
    <div className={step === 2 ? "new-order-shell" : undefined}>
      <form className="panel" onSubmit={confirmAll}>
        <div className="panel-head">
          <h2>New Multi-Parcel Order</h2>
          <span className="badge">Step {step}/3</span>
        </div>

        {step === 1 ? (
          <>
            <label>Select Shipment Type</label>
            <select
              value={routeType}
              onChange={(e) =>
                setRouteType(e.target.value as "EUROPE_TO_EUROPE" | "US" | "")
              }
            >
              <option value="">Select option</option>
              <option value="EUROPE_TO_EUROPE">Europe to Europe</option>
              <option value="US">US</option>
            </select>
          </>
        ) : null}

        {step === 2 ? (
          <div className="step-two-form">
            <label>Receiver Name</label>
            <input
              value={parcelForm.title}
              onChange={(e) => setParcelForm((p) => ({ ...p, title: e.target.value }))}
            />

            <label>Address Details</label>
            <textarea
              value={parcelForm.address}
              onChange={(e) => setParcelForm((p) => ({ ...p, address: e.target.value }))}
            />

            <label>City</label>
            <input
              value={parcelForm.city}
              onChange={(e) => setParcelForm((p) => ({ ...p, city: e.target.value }))}
            />

            <label>State</label>
            <input
              value={parcelForm.state}
              onChange={(e) => setParcelForm((p) => ({ ...p, state: e.target.value }))}
            />

            <label>Zip Code</label>
            <input
              value={parcelForm.zipCode}
              onChange={(e) => setParcelForm((p) => ({ ...p, zipCode: e.target.value }))}
            />

            <label>Country</label>
            <input
              value={parcelForm.country}
              onChange={(e) => setParcelForm((p) => ({ ...p, country: e.target.value }))}
            />

            <label>Contact Phone</label>
            <input
              value={parcelForm.contactPhone}
              onChange={(e) => setParcelForm((p) => ({ ...p, contactPhone: e.target.value }))}
            />

            <label className="choice">
              <input
                type="checkbox"
                checked={parcelForm.saveAddress}
                onChange={(e) => setParcelForm((p) => ({ ...p, saveAddress: e.target.checked }))}
              />
              Save this address in Recipients
            </label>

            <h3>Products and Quantity</h3>
            <div className="item-row">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name"
              />
              <input
                type="number"
                min={1}
                value={productQty}
                onChange={(e) => setProductQty(Number(e.target.value) || 1)}
              />
            </div>
            <button type="button" className="secondary" onClick={addProductToParcel}>
              + Add Product
            </button>

            {parcelForm.items.length > 0 ? (
              <div className="table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Qty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcelForm.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <button
                            type="button"
                            className="secondary icon-btn"
                            onClick={() => removeProductFromParcel(i)}
                            aria-label="Remove product"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <button type="button" onClick={addOrUpdateParcel}>
              {editingIndex !== null ? "Update Parcel" : "Add Parcel"}
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <div className="panel-head">
              <h3>Review All Parcels</h3>
              <span className="badge">{parcels.length} parcels</span>
            </div>
            {parcels.map((p, idx) => (
              <div className="order-card" key={idx}>
                <div className="order-top">
                  <h3>{p.title}</h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className="secondary icon-btn"
                      onClick={() => editParcel(idx)}
                      aria-label="Edit parcel"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="secondary icon-btn"
                      onClick={() => removeParcel(idx)}
                      aria-label="Remove parcel"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p>Type: {p.routeType === "EUROPE_TO_EUROPE" ? "Europe to Europe" : "US"}</p>
                <p>{p.address}</p>
                <p>
                  {p.city}, {p.state} - {p.zipCode}, {p.country}
                </p>
                <p>Save Address: {p.saveAddress ? "Yes" : "No"}</p>
                <ul>
                  {p.items.map((i, x) => (
                    <li key={x}>
                      {i.name} x {i.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : null}

        {error ? <p className="error">{error}</p> : null}

        <div className="wizard-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !routeType) return setError("Select shipment type");
                if (step === 2 && parcels.length === 0) return setError("Add at least one parcel before review");
                setError("");
                setStep((s) => Math.min(3, s + 1));
              }}
            >
              Next
            </button>
          ) : (
            <button type="submit">Confirm All Parcels</button>
          )}
        </div>
      </form>

      {step === 2 ? (
        <aside className="right-preview-panel">
          <div className="panel-head">
            <h3>Parcels</h3>
            <span className="badge">{parcels.length} parcels</span>
          </div>

          {parcels.length === 0 ? <p className="empty-state">Add a parcel and it will appear here.</p> : null}

          {parcels.map((p, idx) => (
            <div className="order-card" key={idx}>
              <div className="order-top">
                <h3>{p.title}</h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="secondary icon-btn"
                    onClick={() => editParcel(idx)}
                    aria-label="Edit parcel"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="secondary icon-btn"
                    onClick={() => removeParcel(idx)}
                    aria-label="Remove parcel"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p>Type: {p.routeType === "EUROPE_TO_EUROPE" ? "Europe to Europe" : "US"}</p>
              <p>
                {p.city}, {p.state} - {p.zipCode}
              </p>
              <small>{p.items.length} products</small>
            </div>
          ))}
        </aside>
      ) : null}
    </div>
  );
}
