"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/types/products";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/app/hooks/use-toast";
import { ArrowLeft, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { productSchema as formSchema } from "@/schemas/productSchema";
import { MainImageUpload, AdditionalImagesUpload, PaymentQRUpload } from "@/components/imageUpload";

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      category: "",
      condition: "",
      hostel: "",
      mainImage: "",
      images: [], // Initialize as empty array to avoid controlled/uncontrolled input error
      paymentQR: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create product");
      }
      const product = await response.json();
      toast({
        title: "Product listed successfully",
        description: "Your product is now available in the marketplace.",
      });
      router.push(`/market/${product.id}`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Failed to list product",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageRemove = (field: any, urlToRemove: string) => {
    field.onChange(field.value.filter((url: string) => url !== urlToRemove));
  };

  return (
    <div className="container py-6 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm border border-blue-100 shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">List Your Product</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700 font-medium">Product Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What are you selling?"
                        {...field}
                        className="border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 h-12 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium">Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''} // Fix for controlled/uncontrolled input error
                          className="border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 h-12 rounded-lg bg-white/90">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-100">
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium">Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 h-12 rounded-lg bg-white/90">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-100">
                          {PRODUCT_CONDITIONS.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hostel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium">Hostel Location (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Where is the item located?"
                          {...field}
                          className="border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700 font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item. Include details about its condition, usage, etc."
                        className="min-h-32 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <FormField
                  control={form.control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Main Image
                      </FormLabel>
                      <FormControl>
                        <div className="bg-white/80 p-4 rounded-lg border border-dashed border-blue-300">
                          <MainImageUpload
                            value={field.value}
                            onChange={(value: string) => field.onChange(value)}
                            onRemove={() => field.onChange("")}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Additional Images (Optional)
                      </FormLabel>
                      <p className="text-sm text-blue-600 mb-2">
                        Upload up to 5 additional images to showcase your product
                      </p>
                      <FormControl>
                        <div className="bg-white/80 p-4 rounded-lg border border-dashed border-blue-300">
                          <AdditionalImagesUpload
                            value={field.value}
                            onChange={(urls: string[]) => field.onChange(urls)}
                            onRemove={(url: string) => handleImageRemove(field, url)}
                          />
                          {field.value && field.value.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {field.value.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-blue-200">
                                  <Image
                                    src={url}
                                    alt={`Additional image ${index + 1}`}
                                    fill // Using fill instead of width/height
                                    className="object-cover w-full h-full"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleImageRemove(field, url)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <FormField
                  control={form.control}
                  name="paymentQR"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Payment QR Code (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className="bg-white/80 p-4 rounded-lg border border-dashed border-blue-300">
                          <PaymentQRUpload
                            value={field.value}
                            onChange={(url: string) => field.onChange(url)}
                            onRemove={() => field.onChange("")}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-6 text-lg font-medium rounded-lg shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Listing Product...
                  </>
                ) : (
                  "List Product"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}