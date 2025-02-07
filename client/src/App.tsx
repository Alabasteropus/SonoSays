import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import Home from "@/pages/Home";
import Document from "@/pages/Document";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0]);
        if (res.status === 401) return null;
        return res.json();
      } catch (error) {
        return null;
      }
    }
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/signout");
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="/" className="font-bold text-lg">
              WriteWithAI
            </a>
            {!user ? (
              <a 
                href="/api/auth/google" 
                className="text-muted-foreground hover:text-foreground"
              >
                Sign in with Google
              </a>
            ) : (
              <span className="text-muted-foreground">
                {user.email}
              </span>
            )}
          </nav>

          {user && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8">
        {children}
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          WriteWithAI - AI-Enhanced Writing Platform
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/document/:id" component={Document} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;