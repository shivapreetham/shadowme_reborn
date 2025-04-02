// app/marketplace/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/marketplace/ProductCard';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import Button from '@/components/Button';
import { Product, ProductStatus } from '@prisma/client';

export default function MarketplacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    status: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query params from filters
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`/api/marketplace/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleAddProduct = () => {
    router.push('/marketplace/product/new');
  };

  const handleShowMyProducts = () => {
    router.push('/marketplace/my-products');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-primary p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Campus Marketplace</h1>
          {session?.user && (
            <div className="space-x-2">
              <Button onClick={handleShowMyProducts}>My Products</Button>
              <Button onClick={handleAddProduct}>+ Add Product</Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row gap-4 p-4">
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
        
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No products found</p>
              {session?.user && (
                <Button className="mt-4" onClick={handleAddProduct}>
                  Be the first to add a product
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isOwner={product.sellerId === session?.user?.id}
                  userId={session?.user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}