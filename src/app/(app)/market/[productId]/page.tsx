// app/market/[productId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types/products";
import { User } from "@prisma/client";
import { ProductStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Heart, Phone, MapPin, ArrowLeft, Edit, Check, ShoppingBag, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInterested, setIsInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const productId = params.productId as string;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setIsInterested(data.interestedUserIds.includes(session?.user?.id));
        } else {
          router.push("/market");
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId && session) {
      fetchProduct();
    }
  }, [productId, session, router]);

  const toggleInterest = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setInterestLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setIsInterested(!isInterested);
      }
    } catch (error) {
      console.error("Failed to toggle interest:", error);
    } finally {
      setInterestLoading(false);
    }
  };

  const updateStatus = async (status: ProductStatus) => {
    if (!session || product?.sellerId !== session.user?.id) return;

    setStatusLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">This product may have been removed or is no longer available.</p>
          <Link href="/market">
            <Button variant="default" size="lg" className="rounded-full px-8">
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === product.sellerId;
  const allImages = [product.mainImage, ...product.images];

  const getStatusVariant = (status: ProductStatus) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-500/20 text-green-500";
      case "RESERVED": return "bg-amber-500/20 text-amber-500";
      case "SOLD": return "bg-red-500/20 text-red-500";
      default: return "bg-slate-500/20 text-slate-500";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 rounded-full hover:bg-white/10 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Left column - Images */}
            <div className="lg:col-span-3 p-6">
              <Carousel className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                <CarouselContent>
                  {allImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                        <Image
                          src={image}
                          alt={`${product.title} - Image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm border-none text-white" />
                <CarouselNext className="right-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm border-none text-white" />
              </Carousel>

              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusVariant(product.status)}`}>
                  {product.status === "AVAILABLE" 
                    ? "Available" 
                    : product.status === "RESERVED" 
                      ? "Reserved" 
                      : "Sold"}
                </span>
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-white/5 border-white/10">
                  {product.category}
                </Badge>
                {product.condition && (
                  <Badge variant="outline" className="rounded-full px-3 py-1 bg-white/5 border-white/10">
                    {product.condition}
                  </Badge>
                )}
              </div>

              {/* Seller controls */}
              {isOwner && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/5 rounded-2xl">
                  <h3 className="w-full text-sm font-medium mb-3 text-muted-foreground">Product Controls</h3>
                  
                  <Link href={`/market/${productId}/edit`}>
                    <Button variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  
                  {product.status !== "AVAILABLE" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatus("AVAILABLE")}
                      disabled={statusLoading}
                      className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Mark as Available
                    </Button>
                  )}
                  
                  {product.status !== "RESERVED" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatus("RESERVED")}
                      disabled={statusLoading}
                      className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Mark as Reserved
                    </Button>
                  )}
                  
                  {product.status !== "SOLD" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatus("SOLD")}
                      disabled={statusLoading}
                      className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Mark as Sold
                    </Button>
                  )}
                </div>
              )}
              
              {/* Show interested users to owner */}
              {isOwner && product.interestedUsers && product.interestedUsers.length > 0 && (
                <div className="p-4 bg-white/5 rounded-2xl">
                  <h3 className="font-medium mb-3 text-sm">Interested Users ({product.interestedUsers.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.interestedUsers.map((user: User) => (
                      <Badge key={user.id} variant="secondary" className="rounded-full px-3 py-1 bg-primary/10 text-primary">
                        {user.username}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Details */}
            <div className="lg:col-span-2 p-6 border-t lg:border-t-0 lg:border-l border-white/10 bg-white/2">
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-3xl font-bold text-primary mb-6">₹{product.price.toLocaleString()}</p>
              
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">DESCRIPTION</h3>
                <p className="whitespace-pre-line text-base">{product.description}</p>
              </div>
              
              <Card className="mb-8 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden">
                <CardContent className="p-5">
                  <h3 className="text-sm font-medium mb-4 text-muted-foreground">SELLER INFORMATION</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/20">
                      <AvatarImage src={product.seller?.image || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {product.seller?.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-lg">{product.seller?.username}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Listed on {format(new Date(product.createdAt), "MMMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {product.seller?.mobileNumber && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <p>{product.seller.mobileNumber}</p>
                      </div>
                    )}
                    
                    {product.hostel && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <p>{product.hostel}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {product.paymentQR && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">PAYMENT QR</h3>
                  <div className="relative aspect-square w-40 h-40 overflow-hidden rounded-2xl border border-white/10 bg-white p-2 shadow-lg hover:scale-105 transition-transform duration-300">
                    <Image
                      src={product.paymentQR}
                      alt="Payment QR"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* Interest button (only for non-owners and available products) */}
              {!isOwner && product.status === "AVAILABLE" && (
                <Button
                  variant={isInterested ? "default" : "outline"}
                  className="w-full rounded-xl h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={toggleInterest}
                  disabled={interestLoading}
                >
                  {interestLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isInterested ? (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Interested
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-5 w-5" />
                          I am Interested
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}