"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import { levenshtein } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      formData.append("products", JSON.stringify(previewData));
      // Attach all images (avoid duplicates)
      const added = new Set();
      previewData.forEach((row) => {
        if (row.imageFile && !added.has(row.imageFile.name)) {
          formData.append(`image-${row.imageFile.name}`, row.imageFile);
          added.add(row.imageFile.name);
        }
      });
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportResult({ success: true, results: data.results });
      // Clear preview and files after success
      setCsvFile(null); setImageFiles([]); setPreviewData([]); setManualImageMap({});
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    }
    setImporting(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-muted/40 border-r flex flex-col py-8 px-4 gap-2">
        <Link href="/admin" className="mb-6">
          <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg text-lg font-bold hover:bg-green-700 transition">← Back to Dashboard</button>
        </Link>
        <nav className="flex flex-col gap-2 mt-4">
          <Link href="/admin/products" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Products</Link>
          <Link href="/admin/categories" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Categories</Link>
          <Link href="/admin/orders" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Orders</Link>
          <Link href="/admin/customers" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Customers</Link>
          <Link href="/admin/notifications" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Notifications</Link>
          <Link href="/admin/purchase-orders" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Purchase Orders</Link>
          <Link href="/admin/suppliers" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Suppliers</Link>
          <Link href="/admin/users" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Users</Link>
          <Link href="/admin/products/import" className="py-2 px-4 rounded bg-primary/10 font-semibold text-primary">Import Products</Link>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
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
            </div>
          )}
          {/* Show preview table only if not imported yet */}
          {importResult && importResult.success ? null : previewData.length > 0 ? (
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Name</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className={row.status !== "Ready" ? "bg-red-50" : row.ambiguous ? "bg-yellow-50" : ""}>
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.sku}</td>
                    <td className="p-2">
                      {row.imageFile ? (
                        <>
                          <img src={URL.createObjectURL(row.imageFile)} alt={row.name} className="h-10 w-10 object-contain inline-block mr-2" />
                          <label className="ml-2 cursor-pointer text-xs text-primary underline">
                            <input
                              type="file"
                              accept="image/png,image/jpeg"
                              style={{ display: "none" }}
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  handleManualImage(row.sku, e.target.files[0]);
                                }
                              }}
                            />
                            Change Image
                          </label>
                          <button className="ml-2 text-xs text-red-600 underline" onClick={() => handleManualImage(row.sku, null)}>
                            Clear Image
                          </button>
                          {row.ambiguous && (
                            <span className="ml-2 text-xs text-yellow-700 font-semibold">Ambiguous match! Please confirm.</span>
                          )}
                          <span className="ml-2 text-xs text-muted-foreground">{row.matchReason}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-600">No match</span>
                          <label className="ml-2 cursor-pointer text-xs text-primary underline">
                            <input
                              type="file"
                              accept="image/png,image/jpeg"
                              style={{ display: "none" }}
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  handleManualImage(row.sku, e.target.files[0]);
                                }
                              }}
                            />
                            Add Image
                          </label>
                          <span className="ml-2 text-xs text-muted-foreground">{row.matchReason}</span>
                        </>
                      )}
                    </td>
                    <td className="p-2">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-muted-foreground">No preview data yet. Upload CSV and images, then click Preview.</div>
          )}
          <Button className="mt-6" disabled={previewData.length === 0 || errors.length > 0 || importing || (importResult && importResult.success)} onClick={handleImport}>
            {importing ? "Importing..." : "Import Products"}
          </Button>
          {importing && <div className="mt-4 text-blue-600">Importing products...</div>}
          {importResult && importResult.success && (
            <div className="mt-4 text-green-600 font-semibold text-lg">Import complete! {importResult.results.length} products processed.</div>
          )}
          {importResult && !importResult.success && (
            <div className="mt-4 text-red-600">Import failed: {importResult.error}</div>
          )}
          {/* Prominent green back button for quick navigation */}
          <Button size="lg" className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>
      </main>
    </div>
  );
} 