"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import { levenshtein } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAs } from "file-saver";

export default function ProductImportPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualImageMap, setManualImageMap] = useState<Record<string, File>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const router = useRouter();

  // Placeholder: handle file selection
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  // Robust image matching: exact, partial, token, fuzzy, with reason
  function robustMatchImage(product: any, images: File[]): { file: File | null, name: string | null, ambiguous?: boolean, reason?: string } {
    if (!images.length) return { file: null, name: null };
    const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const productTokens = [product.sku, product.slug, product.name].filter(Boolean).map(norm);
    // 1. Exact match (SKU, slug, name)
    for (const file of images) {
      const base = norm(file.name.replace(/\.[^.]+$/, ""));
      if (productTokens.includes(base)) {
        return { file, name: file.name, reason: "Exact match" };
      }
    }
    // 2. Prefix/partial match
    for (const file of images) {
      const base = norm(file.name.replace(/\.[^.]+$/, ""));
      if (productTokens.some(token => base.startsWith(token) || base.includes(token))) {
        return { file, name: file.name, reason: "Partial match" };
      }
    }
    // 3. Token overlap
    for (const file of images) {
      const baseTokens = norm(file.name.replace(/\.[^.]+$/, "")).split(/[-_ ]/);
      if (productTokens.some(token => baseTokens.includes(token))) {
        return { file, name: file.name, reason: "Token match" };
      }
    }
    // 4. Fuzzy match (strict threshold)
    let bestFile: File | null = null, bestName: string | null = null, bestScore = Infinity, matches: File[] = [];
    for (const file of images) {
      const base = norm(file.name.replace(/\.[^.]+$/, ""));
      for (const token of productTokens) {
        const score = levenshtein(base, token);
        if (score < bestScore) {
          bestScore = score;
          bestFile = file;
          bestName = file.name;
          matches = [file];
        } else if (score === bestScore) {
          matches.push(file);
        }
      }
    }
    if (bestScore <= 2) {
      return { file: bestFile, name: bestName, ambiguous: matches.length > 1, reason: "Fuzzy match" };
    }
    // 5. No match
    return { file: null, name: null, reason: "No match" };
  }

  const handlePreview = () => {
    setLoading(true);
    setErrors([]);
    if (!csvFile) return;
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const seenSkus = new Set();
        const preview: any[] = [];
        const errors: string[] = [];
        rows.forEach((row, idx) => {
          // Use manual image if set, otherwise robust match
          let imageFile: File | undefined = manualImageMap[row.sku];
          let imageMatch = imageFile ? imageFile.name : null;
          let ambiguous = false;
          let matchReason = "Manual";
          if (!imageFile) {
            const match = robustMatchImage(row, imageFiles);
            imageFile = match.file || undefined;
            imageMatch = match.name;
            ambiguous = !!match.ambiguous;
            matchReason = match.reason || "";
          }
          // Check for duplicate SKU
          let status = "Ready";
          if (!row.sku) {
            status = "Missing SKU";
            errors.push(`Row ${idx + 2}: Missing SKU`);
          } else if (seenSkus.has(row.sku)) {
            status = "Duplicate SKU";
            errors.push(`Row ${idx + 2}: Duplicate SKU ${row.sku}`);
          } else {
            seenSkus.add(row.sku);
          }
          if (!imageFile) {
            status = "Missing Image";
            errors.push(`Row ${idx + 2}: No matching image for ${row.name || row.slug || row.sku}`);
          }
          preview.push({
            ...row,
            imageMatch,
            imageFile,
            ambiguous,
            matchReason,
            status,
          });
        });
        setPreviewData(preview);
        setErrors(errors);
        setLoading(false);
      },
      error: (err) => {
        setErrors([err.message]);
        setLoading(false);
      },
    });
  };

  // Manual image assignment handler (add clear option)
  const handleManualImage = (sku: string, file: File | null) => {
    setManualImageMap((prev) => {
      const next = { ...prev };
      if (file) next[sku] = file;
      else delete next[sku];
      return next;
    });
    setTimeout(handlePreview, 0);
  };

  // Import handler
  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      if (csvFile) {
        formData.append("file", csvFile);
      }
      // Attach all images (avoid duplicates)
      const added = new Set();
      previewData.forEach((row) => {
        if (row.imageFile && !added.has(row.imageFile.name)) {
          formData.append('images', row.imageFile);
          added.add(row.imageFile.name);
        }
      });
      const res = await fetch("/api/admin/import/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportResult({
        success: true,
        created: data.created,
        updated: data.updated,
        failed: data.failed,
        errors: data.errors || [],
        updateNotes: data.updateNotes || [],
      });
      // Clear preview and files after success
      setCsvFile(null); setImageFiles([]); setPreviewData([]); setManualImageMap({});
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    }
    setImporting(false);
  };

  // Download errors as CSV
  const handleDownloadErrors = () => {
    const csvContent = ["Error"].concat(errors).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "import-errors.csv");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6">Import Products</h1>
      <div className="flex flex-col gap-4 max-w-xl">
        <label className="font-medium">CSV File
          <Input type="file" accept=".csv" onChange={handleCsvChange} />
        </label>
        <label className="font-medium">Product Images (PNG/JPG, multiple allowed)
          <Input type="file" accept="image/png,image/jpeg" multiple onChange={handleImageChange} />
        </label>
        <Button onClick={handlePreview} disabled={!csvFile || imageFiles.length === 0 || loading}>
          {loading ? "Processing..." : "Preview Import"}
        </Button>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Preview</h2>
        {errors.length > 0 && (
          <div className="mb-4 text-red-600">
            {errors.map((err, i) => <div key={i}>{err}</div>)}
            <Button className="mt-2" variant="outline" onClick={handleDownloadErrors}>
              Download Errors as CSV
            </Button>
          </div>
        )}
        {/* Show preview table only if not imported yet */}
        {importResult && importResult.success ? null : previewData.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Name</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2">Slug</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">isActive</th>
                  <th className="p-2">isFeatured</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Errors/Warnings</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className={row.status !== "Ready" ? "bg-red-50" : row.ambiguous ? "bg-yellow-50" : ""}>
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.sku}</td>
                    <td className="p-2">{row.slug}</td>
                    <td className="p-2">{row.category}</td>
                    <td className="p-2">{row.price}</td>
                    <td className="p-2">{row.stockQuantity}</td>
                    <td className="p-2">{row.isActive ? 'Yes' : 'No'}</td>
                    <td className="p-2">{row.isFeatured ? 'Yes' : 'No'}</td>
                    <td className="p-2">
                      {row.imageFile ? (
                        <img src={URL.createObjectURL(row.imageFile)} alt={row.name} className="h-10 w-10 object-contain inline-block mr-2" />
                      ) : (
                        <span className="text-red-600">No match</span>
                      )}
                    </td>
                    <td className="p-2">{row.status}</td>
                    <td className="p-2">
                      {row.status !== "Ready" && (
                        <span className="text-red-600" title={row.status}>⚠️ {row.status}</span>
                      )}
                      {row.ambiguous && (
                        <span className="text-yellow-700 ml-2" title="Ambiguous image match">⚠️ Ambiguous</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted-foreground">No preview data yet. Upload CSV and images, then click Preview.</div>
        )}
        <Button className="mt-6" disabled={previewData.length === 0 || errors.length > 0 || importing || (importResult && importResult.success)} onClick={handleImport}>
          {importing ? "Importing..." : "Import Products"}
        </Button>
        {importing && <div className="mt-4 text-blue-600">Importing products...</div>}
        {importResult && importResult.success && (
          <div className="mt-4">
            <div className="text-green-600 font-semibold text-lg mb-2">
              Import complete!
            </div>
            <div className="mb-2">
              <span className="font-semibold">Created:</span> {importResult.created} &nbsp;|
              <span className="font-semibold"> Updated:</span> {importResult.updated} &nbsp;|
              <span className="font-semibold"> Failed:</span> {importResult.failed}
            </div>
            {importResult.updateNotes && importResult.updateNotes.length > 0 && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-2">
                <div className="font-semibold mb-1">Update Notes:</div>
                <ul className="list-disc pl-5">
                  {importResult.updateNotes.map((note: string, i: number) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
                <div className="font-semibold mb-1">Import Errors:</div>
                <ul className="list-disc pl-5">
                  {importResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {importResult && !importResult.success && (
          <div className="mt-4 text-red-600">Import failed: {importResult.error}</div>
        )}
        {/* Prominent green back button for quick navigation */}
        <Button size="lg" className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
    </div>
  );
} 