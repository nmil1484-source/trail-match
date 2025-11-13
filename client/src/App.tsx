import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PostTrip from "./pages/PostTrip";
import EditTrip from "./pages/EditTrip";
import TripDetail from "./pages/TripDetail";
import Profile from "./pages/Profile";
import Shops from "./pages/Shops";
import ShopDetail from "./pages/ShopDetail";
import AddShop from "./pages/AddShop";
import EditShop from "./pages/EditShop";

import Admin from "./pages/Admin";
import AdminSetup from "./pages/AdminSetup";
import AdminDatabaseFix from "./pages/AdminDatabaseFix";
import AdminMigration from "./pages/AdminMigration";
import AdminMigratePrivate from "./pages/AdminMigratePrivate";
import JoinRequests from "./pages/JoinRequests";
import Messages from "./pages/Messages";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import AdminMessagingMigration from "./pages/AdminMessagingMigration";
import AdminGroupChatMigration from "./pages/AdminGroupChatMigration";
import UserProfile from "./pages/UserProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/post-trip"} component={PostTrip} />
      <Route path={"/edit-trip/:id"} component={EditTrip} />
      <Route path={"/trip/:id"} component={TripDetail} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/user/:id"} component={UserProfile} />
      <Route path={"/shops"} component={Shops} />
      <Route path={"/shops/add"} component={AddShop} />
      <Route path={"/shops/:id"} component={ShopDetail} />
      <Route path={"/edit-shop/:id"} component={EditShop} />

      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin-setup"} component={AdminSetup} />
      <Route path={"/admin/fix-database"} component={AdminDatabaseFix} />
      <Route path={"/admin/migrate-shops"} component={AdminMigration} />
      <Route path={"/admin/migrate-private"} component={AdminMigratePrivate} />
      <Route path={"/admin/migrate-messaging"} component={AdminMessagingMigration} />
      <Route path={"/admin/migrate-groupchat"} component={AdminGroupChatMigration} />
      <Route path={"/join-requests"} component={JoinRequests} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/about"} component={About} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

