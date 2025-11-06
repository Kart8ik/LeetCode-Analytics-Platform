import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/TopNavbar";
import Dashboard from "@/Pages/Dashboard";
import Leaderboard from "@/Pages/Leaderboard";
import { useAuth, AuthProvider } from "@/Context";
import { Toaster } from "sonner";

function Layout() {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const showNavbar = !!session;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-background overflow-hidden">
      {showNavbar && <Navbar />} {/* consistent top bar across all pages */}
      <main className="h-full w-full flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster richColors position="bottom-right" />
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}