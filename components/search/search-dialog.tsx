"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(price);
  };

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.products || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onOpenChange(false);
      setQuery("");
      setResults([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Plants
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search for plants, accessories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={!query.trim()}>
              Search
            </Button>
          </div>
        </form>

        {query.trim().length >= 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Search Results</h3>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            <ScrollArea className="max-h-96">
              {results && results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((product) => {
                    const primaryImage =
                      product.images && product.images.length > 0
                        ? (product.images.find((img) => img.isPrimary) ||
                          product.images[0])
                        : null;
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.altText || product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-semibold currency">
                              {formatPrice(product.price)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {product.category?.name || 'Uncategorized'}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No plants found for "{query}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )
              )}
            </ScrollArea>

            {results && results.length > 0 && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    onOpenChange(false);
                  }}
                >
                  View all results for "{query}"
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
