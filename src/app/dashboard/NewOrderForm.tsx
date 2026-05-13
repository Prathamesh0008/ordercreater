









// src\app\dashboard\NewOrderForm.tsx
"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Item = { name: string; quantity: number };

type RouteType = "EUROPE_TO_EUROPE" | "US";

type Parcel = {
  routeType: RouteType;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneCode: string;
  contactPhone: string;
  saveAddress: boolean;
  items: Item[];
};

type ParcelForm = Omit<Parcel, "routeType">;

const COUNTRY_OPTIONS = [
  { flag: "in", name: "India", dialCode: "+91" },
  { flag: "ae", name: "United Arab Emirates", dialCode: "+971" },
  { flag: "cn", name: "China", dialCode: "+86" },
  { flag: "us", name: "United States", dialCode: "+1" },
  { flag: "gb", name: "United Kingdom", dialCode: "+44" },

  { flag: "al", name: "Albania", dialCode: "+355" },
  { flag: "ad", name: "Andorra", dialCode: "+376" },
  { flag: "at", name: "Austria", dialCode: "+43" },
  { flag: "be", name: "Belgium", dialCode: "+32" },
  { flag: "ba", name: "Bosnia and Herzegovina", dialCode: "+387" },
  { flag: "bg", name: "Bulgaria", dialCode: "+359" },
  { flag: "hr", name: "Croatia", dialCode: "+385" },
  { flag: "cy", name: "Cyprus", dialCode: "+357" },
  { flag: "cz", name: "Czechia", dialCode: "+420" },
  { flag: "dk", name: "Denmark", dialCode: "+45" },
  { flag: "ee", name: "Estonia", dialCode: "+372" },
  { flag: "fi", name: "Finland", dialCode: "+358" },
  { flag: "fr", name: "France", dialCode: "+33" },
  { flag: "de", name: "Germany", dialCode: "+49" },
  { flag: "gr", name: "Greece", dialCode: "+30" },
  { flag: "hu", name: "Hungary", dialCode: "+36" },
  { flag: "is", name: "Iceland", dialCode: "+354" },
  { flag: "ie", name: "Ireland", dialCode: "+353" },
  { flag: "it", name: "Italy", dialCode: "+39" },
  { flag: "xk", name: "Kosovo", dialCode: "+383" },
  { flag: "lv", name: "Latvia", dialCode: "+371" },
  { flag: "lt", name: "Lithuania", dialCode: "+370" },
  { flag: "lu", name: "Luxembourg", dialCode: "+352" },
  { flag: "mt", name: "Malta", dialCode: "+356" },
  { flag: "md", name: "Moldova", dialCode: "+373" },
  { flag: "mc", name: "Monaco", dialCode: "+377" },
  { flag: "me", name: "Montenegro", dialCode: "+382" },
  { flag: "nl", name: "Netherlands", dialCode: "+31" },
  { flag: "mk", name: "North Macedonia", dialCode: "+389" },
  { flag: "no", name: "Norway", dialCode: "+47" },
  { flag: "pl", name: "Poland", dialCode: "+48" },
  { flag: "pt", name: "Portugal", dialCode: "+351" },
  { flag: "ro", name: "Romania", dialCode: "+40" },
  { flag: "rs", name: "Serbia", dialCode: "+381" },
  { flag: "sk", name: "Slovakia", dialCode: "+421" },
  { flag: "si", name: "Slovenia", dialCode: "+386" },
  { flag: "es", name: "Spain", dialCode: "+34" },
  { flag: "se", name: "Sweden", dialCode: "+46" },
  { flag: "ch", name: "Switzerland", dialCode: "+41" },
  { flag: "ua", name: "Ukraine", dialCode: "+380" },

  { flag: "ca", name: "Canada", dialCode: "+1" },
  { flag: "au", name: "Australia", dialCode: "+61" },
  { flag: "sg", name: "Singapore", dialCode: "+65" },
  { flag: "hk", name: "Hong Kong", dialCode: "+852" },
  { flag: "jp", name: "Japan", dialCode: "+81" },
  { flag: "tr", name: "Turkey", dialCode: "+90" },
  { flag: "sa", name: "Saudi Arabia", dialCode: "+966" },
  { flag: "qa", name: "Qatar", dialCode: "+974" },
  { flag: "kw", name: "Kuwait", dialCode: "+965" },
  { flag: "om", name: "Oman", dialCode: "+968" },
  { flag: "bh", name: "Bahrain", dialCode: "+973" },
];

type CountryOption = (typeof COUNTRY_OPTIONS)[number];



const emptyParcel = (): ParcelForm => ({
  title: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phoneCode: "",
  contactPhone: "",
  saveAddress: false,
  items: [],
});

function FlagIcon({ code, label }: { code: string; label: string }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      alt={label}
      className="flag-img"
    />
  );
}

function FlagDropdown({
  value,
  placeholder,
  type,
  onSelect,
}: {
  value: string;
  placeholder: string;
  type: "country" | "phone";
  onSelect: (country: CountryOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCountry = COUNTRY_OPTIONS.find((country) => {
    if (type === "phone") return country.dialCode === value;
    return country.name === value;
  });

  const filteredCountries = COUNTRY_OPTIONS.filter((country) => {
    const q = search.toLowerCase().trim();

    if (!q) return true;

    return (
      country.name.toLowerCase().includes(q) ||
      country.dialCode.includes(q)
    );
  }).slice(0, 2); // ✅ only 1-2 list items

  return (
    <div className="flag-dropdown">
      {selectedCountry && !open ? (
        <div
          className="flag-select-trigger"
          onClick={() => {
            setSearch("");
            setOpen(true);
          }}
        >
          <FlagIcon code={selectedCountry.flag} label={selectedCountry.name} />

          <span className="flag-country-name">{selectedCountry.name}</span>

          <span className="flag-country-code">{selectedCountry.dialCode}</span>
        </div>
      ) : (
        <div className="flag-input-wrap">
          <input
            value={search}
            placeholder={placeholder}
            autoComplete="off"
            className="flag-input"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
          />
        </div>
      )}

      {open ? (
        <>
          <div
            className="flag-dropdown-backdrop"
            onClick={() => {
              setSearch("");
              setOpen(false);
            }}
          />

          <ul className="flag-dropdown-menu">
            {filteredCountries.map((country) => (
              <li
                key={`${country.name}-${country.dialCode}`}
                className="flag-dropdown-item"
                onMouseDown={(e) => {
                  e.preventDefault();

                  onSelect(country);
                  setSearch("");
                  setOpen(false);
                }}
              >
                <FlagIcon code={country.flag} label={country.name} />

                <span className="flag-country-name">{country.name}</span>

                <span className="flag-country-code">{country.dialCode}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
  
export function NewOrderForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [routeType, setRouteType] = useState<RouteType | "">("");
  const [parcelForm, setParcelForm] = useState<ParcelForm>(emptyParcel());
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [productQty, setProductQty] = useState("1");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (parcelForm.phoneCode.trim().length < 2) return "Select mobile country code";
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

    const payload: Parcel = {
      ...parcelForm,
      routeType,
    } as Parcel;

    if (editingIndex !== null) {
      setParcels((prev) =>
        prev.map((p, idx) => (idx === editingIndex ? payload : p))
      );
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
      phoneCode: p.phoneCode || "",
      contactPhone: p.contactPhone,
      saveAddress: p.saveAddress,
      items: p.items,
    });

    setEditingIndex(index);
    setStep(2);
    setSuccessMessage("");
    setError("");
  }

  function removeParcel(index: number) {
    setParcels((prev) => prev.filter((_, i) => i !== index));

    if (editingIndex === index) {
      setEditingIndex(null);
      setParcelForm(emptyParcel());
    }

    setSuccessMessage("");
  }

  function goToReview() {
    if (editingIndex !== null) {
      return setError("Please update the parcel before review");
    }

    if (parcels.length === 0) {
      return setError("Add at least one parcel before review");
    }

    setError("");
    setSuccessMessage("");
    setStep(3);
  }

  function editOrderFromReview() {
    setError("");
    setSuccessMessage("");
    setStep(2);
  }

  async function confirmAll() {
    if (parcels.length === 0) return setError("Add at least one parcel");

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcels }),
      });

      if (!res.ok) {
        let message = "Order creation failed";

        try {
          const data = await res.json();
          message = data.message || message;
        } catch {
          // keep fallback message
        }

        setError(message);
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      setSuccessMessage("Order confirmed successfully.");
    } catch {
      setError("Order creation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={
        step === 2 ? "new-order-shell compact-order-shell" : "compact-order-page"
      }
    >
      <form
        className="panel new-order-panel"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* <datalist id="country-list">
          {COUNTRY_OPTIONS.map((country) => (
            <option
              key={country.name}
              value={countryInputValue(country)}
              label={country.dialCode}
            />
          ))}
        </datalist>

        <datalist id="phone-code-list">
          {COUNTRY_OPTIONS.map((country) => (
            <option
              key={`${country.name}-${country.dialCode}`}
              value={phoneCodeInputValue(country)}
              label={`${country.name} ${country.dialCode}`}
            />
          ))}
        </datalist> */}

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
                  setRouteType(e.target.value as RouteType | "")
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
                  onChange={(e) =>
                    setParcelForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div className="field span-2">
                <label>Contact Phone</label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[280px_minmax(0,1fr)]">
        <FlagDropdown
  value={parcelForm.phoneCode}
  placeholder="Code"
  type="phone"
  onSelect={(country) => {
    setParcelForm((p) => ({
      ...p,
      phoneCode: country.dialCode,
    }));
  }}
/>

                  <input
                    className="min-w-0"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Mobile number"
                    value={parcelForm.contactPhone}
                    onChange={(e) =>
                      setParcelForm((p) => ({
                        ...p,
                        contactPhone: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                  />
                </div>
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
                  onChange={(e) =>
                    setParcelForm((p) => ({ ...p, city: e.target.value }))
                  }
                />
              </div>

              <div className="field">
                <label>State</label>
                <input
                  value={parcelForm.state}
                  onChange={(e) =>
                    setParcelForm((p) => ({ ...p, state: e.target.value }))
                  }
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
           <FlagDropdown
  value={parcelForm.country}
  placeholder="Search country"
  type="country"
  onSelect={(country) => {
    setParcelForm((p) => ({
      ...p,
      country: country.name,
    }));
  }}
/>
              </div>

              <label className="choice span-2 cursor-pointer">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  checked={parcelForm.saveAddress}
                  onChange={(e) =>
                    setParcelForm((p) => ({
                      ...p,
                      saveAddress: e.target.checked,
                    }))
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
              <h3>Review Order</h3>
              <span className="badge">{parcels.length} parcels</span>
            </div>

            {successMessage ? <p className="success">{successMessage}</p> : null}

            {parcels.map((p, idx) => (
              <div className="order-card" key={idx}>
                <div className="order-top">
                  <h3>{p.title}</h3>
                  <span className="badge">Parcel {idx + 1}</span>
                </div>

                <p>
                  Type:{" "}
                  {p.routeType === "EUROPE_TO_EUROPE"
                    ? "Europe to Europe"
                    : "US"}
                </p>

                <p>
                  Phone: {p.phoneCode} {p.contactPhone}
                </p>

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
          {step === 3 ? (
            <>
              <button
                type="button"
                className="secondary fit-btn cursor-pointer disabled:cursor-not-allowed"
                onClick={editOrderFromReview}
                disabled={isSubmitting || Boolean(successMessage)}
              >
                Edit Order
              </button>

              <button
                type="button"
                className="fit-btn cursor-pointer disabled:cursor-not-allowed"
                onClick={confirmAll}
                disabled={isSubmitting || Boolean(successMessage)}
              >
                {isSubmitting
                  ? "Confirming..."
                  : successMessage
                  ? "Confirmed"
                  : "Confirm Order"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="secondary fit-btn cursor-pointer disabled:cursor-not-allowed"
                onClick={() => {
                  setError("");
                  setStep((s) => Math.max(1, s - 1));
                }}
                disabled={step === 1}
              >
                Back
              </button>

              <button
                type="button"
                className="fit-btn cursor-pointer disabled:cursor-not-allowed"
              onClick={() => {
  setError("");
  setSuccessMessage("");

  if (step === 1 && routeType) {
    setStep(2);
  } else if (step === 1) {
    setError("Select shipment type");
  } else if (step === 2) {
    goToReview();
  } else {
    setStep((s) => Math.min(3, s + 1));
  }
}}
              >
                Next
              </button>
            </>
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

              <p>
                Type:{" "}
                {p.routeType === "EUROPE_TO_EUROPE"
                  ? "Europe to Europe"
                  : "US"}
              </p>

              <p>
                {p.city}, {p.state} - {p.zipCode}
              </p>

              <p>
                {p.phoneCode} {p.contactPhone}
              </p>

              <small>{p.items.length} products</small>
            </div>
          ))}
        </aside>
      ) : null}
    </div>
  );
}