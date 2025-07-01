"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Papa, { ParseResult } from "papaparse";

function downloadCSV(url: string, filename: string) {
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}

function getProductImportSummary(rows: unknown[], existing: unknown[]) {
  const existingIds = new Set((existing as any[]).map((p: any) => p.id));
  const existingSlugs = new Set((existing as any[]).map((p: any) => p.slug));
  let creates = 0, updates = 0, errors = 0;
  for (const row of rows as any[]) {
    if (!row.name || !row.slug) { errors++; continue; }
    if (row.id && existingIds.has(row.id)) updates++;
    else if (existingSlugs.has(row.slug)) updates++;
    else creates++;
  }
  return { creates, updates, errors };
}

export default function ImportExportActions() {
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setImportResult(null);
    const file = e.target.files?.[0];
    setImportFile(file || null);
    if (!file) return;
    try {
      const res = await fetch("/api/admin/products");
      const products = await res.json();
      Papa.parse<File>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<any>) => {
          if (results.errors.length) {
            setImportError("CSV parse error: " + results.errors[0].message);
            setImportPreview(null);
            setImportSummary(null);
          } else {
            const rows = results.data as any[];
            setImportPreview(rows.slice(0, 5));
            setImportSummary(getProductImportSummary(rows, products));
          }
        },
        error: (error) => setImportError("CSV parse error: " + error.message),
      });
    } catch (err: any) {
      setImportError("Failed to fetch existing products: " + (err.message || err));
    }
  }

  async function handleConfirmImport() {
    if (!importFile) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", importFile);
    try {
      const res = await fetch("/api/admin/import/products", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setImportResult(result);
      if (!res.ok) setImportError(result.error || "Import failed");
      setImportPreview(null);
      setImportSummary(null);
      setImportFile(null);
    } catch (e: any) {
      setImportError(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function downloadProductTemplate() {
    const headers = ["id", "name", "slug", "price", "stockQuantity", "isActive"];
    const example: Record<string, string>[] = [
      { id: "", name: "Aloe Vera", slug: "aloe-vera", price: "99.99", stockQuantity: "10", isActive: "true" },
      { id: "", name: "Snake Plant", slug: "snake-plant", price: "149.99", stockQuantity: "5", isActive: "true" },
    ];
    const csv = [headers.join(","), ...example.map(row => headers.map(h => row[h]).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "products-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => downloadCSV("/api/admin/export/orders", "orders.csv")}>Export Orders</Button>
          <Button variant="outline" size="sm" onClick={() => downloadCSV("/api/admin/export/products", "products.csv")}>Export Products</Button>
          <Button variant="outline" size="sm" onClick={() => downloadCSV("/api/admin/export/customers", "customers.csv")}>Export Customers</Button>
          <Button variant="outline" size="sm" onClick={() => downloadCSV("/api/admin/export/analytics", "analytics.csv")}>Export Analytics</Button>
        </div>
        <div className="flex flex-col gap-1 min-w-[220px]">
          <div className="text-xs text-muted-foreground mb-1">
            <b>Product CSV format:</b> <br />
            <span>Required columns: <b>name</b>, <b>slug</b>, <b>price</b>, <b>category</b></span><br />
            <span>Optional: <b>id</b> (for update), <b>stockQuantity</b>, <b>isActive</b></span><br />
            <Button variant="link" size="sm" className="px-0" onClick={downloadProductTemplate}>Download Template</Button>
          </div>
        </div>
        <div className="flex">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Import Products</Button>
          <input type="file" accept=".csv" ref={fileInputRef} style={{ display: "none" }} onChange={handleImportFile} />
        </div>
      </div>
      {Array.isArray(importPreview) && importPreview.length > 0 && (
        <div className="mt-4 bg-muted p-4 rounded border">
          <div className="font-semibold mb-2">Import Preview (first 5 rows):</div>
          <div className="overflow-x-auto">
            <table className="text-xs border w-full">
              <thead>
                <tr>
                  {Object.keys(importPreview[0] || {}).map((col) => (
                    <th key={col} className="border px-2 py-1">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importPreview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="border px-2 py-1">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {importSummary && (
            <div className="mt-2">
              <span className="mr-4">Creates: <b>{importSummary.creates}</b></span>
              <span className="mr-4">Updates: <b>{importSummary.updates}</b></span>
              <span className="mr-4">Errors: <b>{importSummary.errors}</b></span>
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="default" onClick={handleConfirmImport} disabled={importing}>Confirm Import</Button>
            <Button size="sm" variant="outline" onClick={() => { setImportPreview(null); setImportSummary(null); }}>Cancel</Button>
          </div>
        </div>
      )}
      {importError && <div className="text-destructive mt-2">{importError}</div>}
      {importResult && (
        <div className="mt-4 bg-muted p-4 rounded border">
          <div className="font-semibold mb-2">Import Result:</div>
          <div>Created: <b>{importResult.created}</b></div>
          <div>Updated: <b>{importResult.updated}</b></div>
          <div>Failed: <b>{importResult.failed}</b></div>
          {Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
            <div className="mt-2 text-destructive">
              <div>Errors:</div>
              <ul className="list-disc ml-6">
                {importResult.errors.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={() => setImportResult(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
} 