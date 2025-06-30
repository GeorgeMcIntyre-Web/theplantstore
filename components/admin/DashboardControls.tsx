"use client";

import { useState, useRef } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import Papa, { ParseResult, ParseError } from "papaparse";

const presets = [
  {
    label: "Last 7 days",
    getRange: () => {
      const to = new Date();
      const from = subDays(to, 6);
      return { from, to };
    },
  },
  {
    label: "Last 30 days",
    getRange: () => {
      const to = new Date();
      const from = subDays(to, 29);
      return { from, to };
    },
  },
  {
    label: "This Month",
    getRange: () => {
      const now = new Date();
      return { from: startOfMonth(now), to: endOfMonth(now) };
    },
  },
  {
    label: "Last Month",
    getRange: () => {
      const now = new Date();
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
];

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

// Helper to detect if a row is new or update (by id or slug)
function getProductImportSummary(rows: any[], existing: any[]) {
  const existingIds = new Set(existing.map((p: any) => p.id));
  const existingSlugs = new Set(existing.map((p: any) => p.slug));
  let creates = 0, updates = 0, errors = 0;
  for (const row of rows) {
    if (!row.name || !row.slug) { errors++; continue; }
    if (row.id && existingIds.has(row.id)) updates++;
    else if (existingSlugs.has(row.slug)) updates++;
    else creates++;
  }
  return { creates, updates, errors };
}

export default function DashboardControls({ dateRange, onDateRangeChange, children }: {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  children?: React.ReactNode;
}) {
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingProducts, setExistingProducts] = useState<any[]>([]);

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setImportResult(null);
    const file = e.target.files?.[0];
    setImportFile(file || null);
    if (!file) return;
    // Fetch existing products for accurate preview
    try {
      const res = await fetch("/api/admin/products");
      const products = await res.json();
      setExistingProducts(products);
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
    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="secondary"
              size="sm"
              onClick={() => onDateRangeChange(preset.getRange())}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        <div className="text-xs text-muted-foreground mt-1">
          {dateRange?.from && dateRange?.to
            ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
            : "No range selected"}
        </div>
      </div>
      {/* Only keep analytics quick actions here if needed, remove import/export actions */}
    </div>
  );
} 