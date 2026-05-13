//src\app\dashboard\NewOrderForm.tsx
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
 const [productQty, setProductQty] = useState("1");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetAll() {
    setStep(1);
    setRouteType("");
    setParcelForm(emptyParcel());
    setParcels([]);
    setEditingIndex(null);
    setProductName("");
   setProductQty("1");
    setError("");
    setSuccessMessage("");
    setIsSubmitting(false);
  }

 function addProductToParcel() {
  if (productName.trim().length < 1) return;

  const qty = Math.max(1, Number(productQty) || 1);

  setParcelForm((prev) => ({
    ...prev,
    items: [...prev.items, { name: productName.trim(), quantity: qty }],
  }));

  setProductName("");
  setProductQty("1");
  setSuccessMessage("");
}

  function removeProductFromParcel(index: number) {
    setParcelForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

    setSuccessMessage("");
  }

function validateParcel() {
  const phoneDigits = parcelForm.contactPhone.replace(/\D/g, "");
  const zipCode = parcelForm.zipCode.trim();

  if (!routeType) return "Select shipment type";
  if (parcelForm.title.trim().length < 2) return "Receiver name required";
  if (parcelForm.contactPhone.trim().length < 1) return "Contact phone required";
  if (phoneDigits.length !== 10) return "Contact phone must be 10 digits";
  if (parcelForm.address.trim().length < 5) return "Address required";
  if (parcelForm.city.trim().length < 2) return "City required";
  if (parcelForm.state.trim().length < 2) return "State required";
  if (zipCode.length < 3) return "Zip code required";
  if (zipCode.length > 10) return "Zip code must be maximum 10 characters";
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
    setProductQty("1");
    setError("");
    setSuccessMessage("");
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
    setSuccessMessage("");
  }

  function removeParcel(index: number) {
    setParcels((prev) => prev.filter((_, i) => i !== index));

    if (editingIndex === index) {
      setEditingIndex(null);
      setParcelForm(emptyParcel());
    }

    setSuccessMessage("");
  }

  async function confirmAll(e: FormEvent) {
    e.preventDefault();

    if (parcels.length === 0) return setError("Add at least one parcel");

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parcels }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Order creation failed");
      setIsSubmitting(false);
      return;
    }

    router.refresh();

    setStep(3);
    setSuccessMessage("Order created successfully.");
    setIsSubmitting(false);
  }

  return (
    <div className={step === 2 ? "new-order-shell compact-order-shell" : "compact-order-page"}>
      <form className="panel new-order-panel" onSubmit={confirmAll}>
        <div className="panel-head">
          <h2>New Multi-Parcel Order</h2>
          <span className="badge">Step {step}/3</span>
        </div>

        {step === 1 ? (
          <div className="form-grid">
            <div className="field span-2">
              <label>Select Shipment Type</label>
              <select
                className="cursor-pointer"
                value={routeType}
                onChange={(e) =>
                  setRouteType(e.target.value as "EUROPE_TO_EUROPE" | "US" | "")
                }
              >
                <option value="">Select option</option>
                <option value="EUROPE_TO_EUROPE">Europe to Europe</option>
                <option value="US">US</option>
              </select>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="step-two-form">
            <div className="form-grid">
              <div className="field">
                <label>Receiver Name</label>
                <input
                  value={parcelForm.title}
                  onChange={(e) => setParcelForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Contact Phone</label>
              <input
  type="tel"
  inputMode="numeric"
  maxLength={10}
  value={parcelForm.contactPhone}
  onChange={(e) =>
    setParcelForm((p) => ({
      ...p,
      contactPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
    }))
  }
/>
              </div>

              <div className="field span-2">
                <label>Address Details</label>
                <textarea
                  value={parcelForm.address}
                  onChange={(e) =>
                    setParcelForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>

              <div className="field">
                <label>City</label>
                <input
                  value={parcelForm.city}
                  onChange={(e) => setParcelForm((p) => ({ ...p, city: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>State</label>
                <input
                  value={parcelForm.state}
                  onChange={(e) => setParcelForm((p) => ({ ...p, state: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Zip Code</label>
               <input
  maxLength={10}
  value={parcelForm.zipCode}
  onChange={(e) =>
    setParcelForm((p) => ({
      ...p,
      zipCode: e.target.value.slice(0, 10),
    }))
  }
/>
              </div>

              <div className="field">
                <label>Country</label>
                <input
                  value={parcelForm.country}
                  onChange={(e) =>
                    setParcelForm((p) => ({ ...p, country: e.target.value }))
                  }
                />
              </div>

              <label className="choice span-2 cursor-pointer">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  checked={parcelForm.saveAddress}
                  onChange={(e) =>
                    setParcelForm((p) => ({ ...p, saveAddress: e.target.checked }))
                  }
                />
                Save this address in Recipients
              </label>
            </div>

            <div className="product-section">
              <h3>Products and Quantity</h3>

              <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 sm:grid-cols-[minmax(0,1fr)_90px_auto] sm:items-end">
              <input
  className="min-w-0"
  value={productName}
  onChange={(e) => setProductName(e.target.value)}
  placeholder="Product name"
/>

<input
  className="min-w-0"
  type="number"
  min={1}
  inputMode="numeric"
  value={productQty}
  onChange={(e) => setProductQty(e.target.value)}
  onBlur={() => {
    if (!productQty || Number(productQty) < 1) {
      setProductQty("1");
    }
  }}
/>

<button
  type="button"
  className="secondary fit-btn col-span-2 cursor-pointer disabled:cursor-not-allowed sm:col-span-1"
  onClick={addProductToParcel}
>
  + Add Product
</button>
              </div>
            </div>

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
                            className="secondary icon-btn cursor-pointer disabled:cursor-not-allowed"
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

            <div className="form-action-row">
              <button
                type="button"
                className="fit-btn cursor-pointer disabled:cursor-not-allowed"
                onClick={addOrUpdateParcel}
              >
                {editingIndex !== null ? "Update Parcel" : "Add Parcel"}
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <div className="panel-head">
              <h3>Review All Parcels</h3>
              <span className="badge">{parcels.length} parcels</span>
            </div>

            {successMessage ? <p className="success">{successMessage}</p> : null}

            {parcels.map((p, idx) => (
              <div className="order-card" key={idx}>
                <div className="order-top">
                  <h3>{p.title}</h3>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="secondary icon-btn cursor-pointer disabled:cursor-not-allowed"
                      onClick={() => editParcel(idx)}
                      aria-label="Edit parcel"
                      title="Edit"
                      disabled={Boolean(successMessage)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="secondary icon-btn cursor-pointer disabled:cursor-not-allowed"
                      onClick={() => removeParcel(idx)}
                      aria-label="Remove parcel"
                      title="Remove"
                      disabled={Boolean(successMessage)}
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
            className="secondary fit-btn cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || Boolean(successMessage)}
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="fit-btn cursor-pointer disabled:cursor-not-allowed"
              onClick={() => {
                if (step === 1 && !routeType) return setError("Select shipment type");

                if (step === 2 && parcels.length === 0) {
                  return setError("Add at least one parcel before review");
                }

                setError("");
                setSuccessMessage("");
                setStep((s) => Math.min(3, s + 1));
              }}
            >
              Next
            </button>
          ) : successMessage ? (
            <button
              type="button"
              className="fit-btn cursor-pointer disabled:cursor-not-allowed"
              onClick={resetAll}
            >
              Create New Order
            </button>
          ) : (
            <button
              type="submit"
              className="fit-btn cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Confirm All Parcels"}
            </button>
          )}
        </div>
      </form>

      {step === 2 ? (
        <aside className="right-preview-panel compact-preview-panel">
          <div className="panel-head">
            <h3>Parcels</h3>
            <span className="badge">{parcels.length} parcels</span>
          </div>

          {parcels.length === 0 ? (
            <p className="empty-state">Add a parcel and it will appear here.</p>
          ) : null}

          {parcels.map((p, idx) => (
            <div className="order-card" key={idx}>
              <div className="order-top">
                <h3>{p.title}</h3>

                <div className="card-actions">
                  <button
                    type="button"
                    className="secondary icon-btn cursor-pointer disabled:cursor-not-allowed"
                    onClick={() => editParcel(idx)}
                    aria-label="Edit parcel"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="secondary icon-btn cursor-pointer disabled:cursor-not-allowed"
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