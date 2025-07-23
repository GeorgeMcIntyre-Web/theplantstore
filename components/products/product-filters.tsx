"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductFiltersProps {
  category?: string;
}

const careOptions = [
  { value: "EASY", label: "Easy" },
  { value: "MODERATE", label: "Moderate" },
  { value: "ADVANCED", label: "Advanced" },
];

const lightOptions = [
  { value: "LOW", label: "Low Light" },
  { value: "MEDIUM", label: "Medium Light" },
  { value: "BRIGHT", label: "Bright Light" },
  { value: "DIRECT_SUN", label: "Direct Sun" },
];

const sizeOptions = [
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
];

export function ProductFilters({ category }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "1000"),
  ]);
  const [loadingPriceRange, setLoadingPriceRange] = useState(false);

  // Fetch min/max price from API
  useEffect(() => {
    // Reset price filter state immediately on category change
    setMinPrice(0);
    setMaxPrice(1000);
    setPriceRange([0, 1000]);
    setLoadingPriceRange(true);
    async function fetchPriceRange() {
      try {
        let url = "/api/products/price-range";
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setMinPrice(Math.floor(data.minPrice));
          setMaxPrice(Math.ceil(data.maxPrice));
          // If no filter is set, initialize slider to full range
          if (!searchParams.get("minPrice") && !searchParams.get("maxPrice")) {
            setPriceRange([Math.floor(data.minPrice), Math.ceil(data.maxPrice)]);
          }
        }
      } finally {
        setLoadingPriceRange(false);
      }
    }
    fetchPriceRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const getFilterValue = (key: string): string[] => {
    const value = searchParams.get(key);
    return value ? value.split(",") : [];
  };

  const updateFilters = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }

    // Reset to first page when filters change
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  const updatePriceRange = (values: number[]) => {
    setPriceRange(values);
    const params = new URLSearchParams(searchParams.toString());

    if (values[0] > minPrice) {
      params.set("minPrice", values[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (values[1] < maxPrice) {
      params.set("maxPrice", values[1].toString());
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (category) {
      params.set("category", category);
    }
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => !["category", "page", "sortBy", "sortOrder"].includes(key),
  );

  const handleCheckboxChange = (
    filterKey: string,
    value: string,
    checked: boolean,
  ) => {
    const currentValues = getFilterValue(filterKey);

    if (checked) {
      updateFilters(filterKey, [...currentValues, value]);
    } else {
      updateFilters(
        filterKey,
        currentValues.filter((v) => v !== value),
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      )}

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPriceRange ? (
            <Skeleton className="h-8 w-full mb-2" />
          ) : (
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              onValueCommit={updatePriceRange}
              min={minPrice}
              max={maxPrice}
              step={10}
              className="w-full"
              disabled={loadingPriceRange}
            />
          )}
          <div className="flex items-center justify-between text-sm">
            <span className={loadingPriceRange ? "opacity-50" : ""}>{formatPrice(priceRange[0])}</span>
            <span className={loadingPriceRange ? "opacity-50" : ""}>{formatPrice(priceRange[1])}</span>
          </div>
        </CardContent>
      </Card>

      {/* Care Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Care Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {careOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`care-${option.value}`}
                checked={getFilterValue("careLevel").includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "careLevel",
                    option.value,
                    checked as boolean,
                  )
                }
              />
              <Label
                htmlFor={`care-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Light Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Light Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lightOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`light-${option.value}`}
                checked={getFilterValue("lightRequirement").includes(
                  option.value,
                )}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "lightRequirement",
                    option.value,
                    checked as boolean,
                  )
                }
              />
              <Label
                htmlFor={`light-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plant Size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plant Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sizeOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${option.value}`}
                checked={getFilterValue("plantSize").includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "plantSize",
                    option.value,
                    checked as boolean,
                  )
                }
              />
              <Label
                htmlFor={`size-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pet Safe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Special Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pet-safe"
              checked={getFilterValue("isPetSafe").includes("true")}
              onCheckedChange={(checked) =>
                handleCheckboxChange("isPetSafe", "true", checked as boolean)
              }
            />
            <Label
              htmlFor="pet-safe"
              className="text-sm font-normal cursor-pointer"
            >
              Pet Safe
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
