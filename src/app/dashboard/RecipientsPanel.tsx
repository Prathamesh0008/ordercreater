"use client";

import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

type Recipient = {
  id: string;
  name: string;
  address: string;
  contactPhone?: string;
  createdAt: string;
};

type ImportRow = {
  Name?: string;
  Address?: string;
  ContactPhone?: string;
};

export function RecipientsPanel({ recipients }: { recipients: Recipient[] }) {
  const [list, setList] = useState(recipients);
  const [message, setMessage] = useState("");

  async function deleteRecipient(id: string) {
    const res = await fetch(`/api/recipients?id=${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setList((prev) => prev.filter((x) => x.id !== id));
  }

  async function onImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage("");
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet);

    const recipientsPayload = rows
      .map((r) => ({
        name: String(r.Name || "").trim(),
        address: String(r.Address || "").trim(),
        contactPhone: String(r.ContactPhone || "").trim(),
      }))
      .filter((r) => r.name.length >= 2 && r.address.length >= 5);

    if (recipientsPayload.length === 0) {
      setMessage("No valid rows found. Required columns: Name, Address, ContactPhone(optional)");
      return;
    }

    const res = await fetch("/api/recipients/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients: recipientsPayload }),
    });

    if (!res.ok) {
      setMessage("Import failed");
      return;
    }

    const result = await res.json();
    setList(result.recipients || list);
    setMessage(`Imported ${result.importedCount} recipients`);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Recipients</h2>
        <span className="badge">{list.length} saved</span>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-head"><h3>Import from Excel</h3><a className="nav-btn active" href="/api/recipients/template">Download Demo Sheet</a></div>
        <p className="muted">Use columns: Name, Address, ContactPhone (optional)</p>
        <input type="file" accept=".xlsx,.xls" onChange={onImportFile} />
        {message ? <p className="muted">{message}</p> : null}
      </div>

      {list.length === 0 ? <p className="muted">No saved addresses yet.</p> : null}
      {list.map((r) => (
        <div className="order-card" key={r.id}>
          <div className="order-top">
            <h3>{r.name}</h3>
            <button type="button" className="secondary" onClick={() => deleteRecipient(r.id)}>Delete</button>
          </div>
          <p>{r.address}</p>
          <p>{r.contactPhone || "-"}</p>
          <small>{new Date(r.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

