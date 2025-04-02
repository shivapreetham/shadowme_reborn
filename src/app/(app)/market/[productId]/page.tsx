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
import { Loader2, Heart, Phone, MapPin, ArrowLeft, Edit, Check } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p>Product not found</p>
        <Link href="/market">
          <Button variant="link">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === product.sellerId;
  const allImages = [product.mainImage, ...product.images];

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Carousel className="mb-4">
            <CarouselContent>
              {allImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/* Status Badge */}
          <div className="mb-4">
            <Badge variant={
              product.status === "AVAILABLE" 
                ? "default" 
                : product.status === "RESERVED" 
                  ? "secondary" 
                  : "destructive"
            } className="text-sm">
              {product.status === "AVAILABLE" 
                ? "Available" 
                : product.status === "RESERVED" 
                  ? "Reserved" 
                  : "Sold"}
            </Badge>
          </div>

          {/* Seller controls */}
          {isOwner && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Link href={`/market/${productId}/edit`}>
                <Button variant="outline" size="sm">
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
                >
                  {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Mark as Sold
                </Button>
              )}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <p className="text-xl font-bold text-primary mb-4">₹{product.price}</p>
          
          <div className="flex gap-2 mb-4">
            <Badge variant="outline">{product.category}</Badge>
            {product.condition && <Badge variant="outline">{product.condition}</Badge>}
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={product.seller?.image || ""} />
                  <AvatarFallback>{product.seller?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{product.seller?.username}</p>
                  <p className="text-xs text-muted-foreground">Listed on {format(new Date(product.createdAt), "MMMM d, yyyy")}</p>
                </div>
              </div>
              
              {product.seller?.mobileNumber && (
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{product.seller.mobileNumber}</p>
                </div>
              )}
              
              {product.hostel && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{product.hostel}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {product.paymentQR && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Payment QR</h3>
              <div className="relative aspect-square w-40 h-40 overflow-hidden rounded-md">
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
              className="w-full"
              onClick={toggleInterest}
              disabled={interestLoading}
            >
              {interestLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isInterested ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Interested
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      I am Interested
                    </>
                  )}
                </>
              )}
            </Button>
          )}
          
          {/* Show interested users to owner */}
          {isOwner && product.interestedUsers && product.interestedUsers.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Interested Users ({product.interestedUsers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {product.interestedUsers.map((user: User) => (
                  <Badge key={user.id} variant="secondary">
                    {user.username}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}