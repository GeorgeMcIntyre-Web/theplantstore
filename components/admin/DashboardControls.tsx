"use client";

import { useState, useRef } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import Papa, { ParseResult } from "papaparse";

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

export default function DashboardControls({ dateRange, onDateRangeChange }: {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}) {
  const [importFile, setImportFile] = useState<File | null>(null);

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