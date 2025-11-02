import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Globe, Star, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Link, useParams } from "wouter";

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const shopId = parseInt(id || "0");
  
  const { data: shop, isLoading } = trpc.shops.getById.useQuery({ shopId });
  const { data: reviews } = trpc.shops.getReviews.useQuery({ shopId });
  
  const deleteMutation = trpc.shops.delete.useMutation({
    onSuccess: () => {
      toast.success("Shop deleted successfully");
      window.location.href = "/shops";
    },
    onError: (error) => {
      toast.error(`Failed to delete shop: ${error.message}`);
    },
  });
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
      deleteMutation.mutate({ id: shopId });
    }
  };
  
  const isOwner = user && shop && shop.addedBy === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary">Loading...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
        <Button asChild>
          <Link href="/shops">
            <a>Back to Shops</a>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/shops">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shops
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      {shop.photos && Array.isArray(shop.photos) && shop.photos.length > 0 && (
        <div className="w-full h-96 bg-muted relative overflow-hidden">
          <img
            src={(shop.photos as string[])[0]}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-foreground">{shop.name}</h1>
                {isOwner && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/edit-shop/${shopId}`}>
                        <a className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </a>
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(shop.categories as string[]).map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full capitalize font-medium">
                    {cat === "other" && shop.otherDescription ? shop.otherDescription : cat}
                  </span>
                ))}
              </div>

              {shop.averageRating && shop.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">{((shop.averageRating || 0) / 10).toFixed(1)}</span>
                  <span className="text-muted-foreground">({shop.totalReviews} reviews)</span>
                </div>
              )}
            </div>

            {shop.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{shop.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews ({reviews.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (review.review.rating || 0) / 2
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review.reviewText && (
                        <p className="text-muted-foreground">{review.review.reviewText}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shop.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {shop.address}
                        {shop.city && shop.state && (
                          <><br />{shop.city}, {shop.state} {shop.zipCode}</>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${shop.phone}`} className="text-sm text-primary hover:underline">
                        {shop.phone}
                      </a>
                    </div>
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${shop.email}`} className="text-sm text-primary hover:underline">
                        {shop.email}
                      </a>
                    </div>
                  </div>
                )}
                {shop.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={shop.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

