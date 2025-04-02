// app/market/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Product, PRODUCT_CATEGORIES } from "@/types/products";

import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      // Build query string
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      
      try {
        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, minPrice, maxPrice]);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`/market?${params.toString()}`);
  };

  const handlePriceChange = (field: "minPrice" | "maxPrice", value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(field, value);
    } else {
      params.delete(field);
    }
    router.push(`/market?${params.toString()}`);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campus Marketplace</h1>
        <Link href="/market/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            List Item
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
        <Select 
  value={category || "all"} 
  onValueChange={handleCategoryChange}
>
  <SelectTrigger>
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Categories</SelectItem> {/* Fix: Replaced "" with "all" */}
    {PRODUCT_CATEGORIES.map((cat:any) => (
      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
    ))}
  </SelectContent>
</Select>
        </div>
        <div className="w-24">
          <Input
            type="number"
            placeholder="Min ₹"
            value={minPrice || ""}
            onChange={(e) => handlePriceChange("minPrice", e.target.value)}
          />
        </div>
        <div className="w-24">
          <Input
            type="number"
            placeholder="Max ₹"
            value={maxPrice || ""}
            onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
              <Link href="/market/new">
                <Button variant="link">List something?</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}