import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import Home from "./pages/Home";
import Attract from "./pages/Attract";
import Convert from "./pages/Convert";
import Deliver from "./pages/Deliver";
import Automate from "./pages/Automate";
import HumanElement from "./pages/HumanElement";
import SavedProjects from "./pages/SavedProjects";
import SharedReport from "./pages/SharedReport";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/attract">
        <AppLayout><Attract /></AppLayout>
      </Route>
      <Route path="/convert">
        <AppLayout><Convert /></AppLayout>
      </Route>
      <Route path="/deliver">
        <AppLayout><Deliver /></AppLayout>
      </Route>
      <Route path="/automate">
        <AppLayout><Automate /></AppLayout>
      </Route>
      <Route path="/human-element">
        <AppLayout><HumanElement /></AppLayout>
      </Route>
      <Route path="/saved">
        <AppLayout><SavedProjects /></AppLayout>
      </Route>
      <Route path="/share/:token" component={SharedReport} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <OnboardingProvider>
            <Toaster theme="dark" position="top-right" />
            <Router />
          </OnboardingProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
