import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PostTrip from "./pages/PostTrip";
import TripDetail from "./pages/TripDetail";
import Profile from "./pages/Profile";
import Shops from "./pages/Shops";
import AddShop from "./pages/AddShop";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/post-trip"} component={PostTrip} />
      <Route path={"/trip/:id"} component={TripDetail} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/shops"} component={Shops} />
      <Route path={"/shops/add"} component={AddShop} />
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

