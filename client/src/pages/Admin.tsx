import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Users, MapPin, Store, Trash2, Shield, ShieldOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "user" | "trip" | "shop" | null;
    id: number | null;
    name: string;
  }>({ open: false, type: null, id: null, name: "" });

  const utils = trpc.useUtils();

  // Queries
  const { data: users = [], isLoading: usersLoading } = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  
  const { data: trips = [], isLoading: tripsLoading } = trpc.admin.getAllTrips.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  
  const { data: shops = [], isLoading: shopsLoading } = trpc.admin.getAllShops.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Mutations
  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      utils.admin.getAllUsers.invalidate();
      setDeleteDialog({ open: false, type: null, id: null, name: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const deleteTrip = trpc.admin.deleteTrip.useMutation({
    onSuccess: () => {
      toast.success("Trip deleted successfully");
      utils.admin.getAllTrips.invalidate();
      setDeleteDialog({ open: false, type: null, id: null, name: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete trip");
    },
  });

  const deleteShop = trpc.admin.deleteShop.useMutation({
    onSuccess: () => {
      toast.success("Shop deleted successfully");
      utils.admin.getAllShops.invalidate();
      setDeleteDialog({ open: false, type: null, id: null, name: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete shop");
    },
  });

  const updateUserRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  // Check if user is admin
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    if (!deleteDialog.id || !deleteDialog.type) return;

    switch (deleteDialog.type) {
      case "user":
        deleteUser.mutate({ userId: deleteDialog.id });
        break;
      case "trip":
        deleteTrip.mutate({ tripId: deleteDialog.id });
        break;
      case "shop":
        deleteShop.mutate({ shopId: deleteDialog.id });
        break;
    }
  };

  const handleToggleAdmin = (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    updateUserRole.mutate({ userId, role: newRole });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Badge variant="secondary">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shops.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p>Loading users...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || "Unknown"}</TableCell>
                          <TableCell>{u.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAdmin(u.id, u.role)}
                              disabled={u.id === user.id}
                            >
                              {u.role === "admin" ? (
                                <>
                                  <ShieldOff className="mr-1 h-3 w-3" />
                                  Remove Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="mr-1 h-3 w-3" />
                                  Make Admin
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: "user",
                                  id: u.id,
                                  name: u.name || u.email || "this user",
                                })
                              }
                              disabled={u.id === user.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips">
            <Card>
              <CardHeader>
                <CardTitle>Trip Management</CardTitle>
                <CardDescription>Manage and moderate trip listings</CardDescription>
              </CardHeader>
              <CardContent>
                {tripsLoading ? (
                  <p>Loading trips...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell className="font-medium">{trip.title}</TableCell>
                          <TableCell>{trip.location}</TableCell>
                          <TableCell>{trip.organizer?.name || "Unknown"}</TableCell>
                          <TableCell>
                            {new Date(trip.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: "trip",
                                  id: trip.id,
                                  name: trip.title,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shops Tab */}
          <TabsContent value="shops">
            <Card>
              <CardHeader>
                <CardTitle>Shop Management</CardTitle>
                <CardDescription>Manage and moderate shop listings</CardDescription>
              </CardHeader>
              <CardContent>
                {shopsLoading ? (
                  <p>Loading shops...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shops.map((shop) => (
                        <TableRow key={shop.id}>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell>
                            {shop.city && shop.state ? `${shop.city}, ${shop.state}` : "N/A"}
                          </TableCell>
                          <TableCell>{shop.addedByUser?.name || "Unknown"}</TableCell>
                          <TableCell>
                            {new Date(shop.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: "shop",
                                  id: shop.id,
                                  name: shop.name,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, name: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteDialog.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

