import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import LoginNavbar from "@/components/LoginNavbar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
    if (!isValidEmail(email.trim())) {
      alert('Enter a valid email');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data: _loginData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      console.error('Login error:', error);
      toast.error(error.message);
    } else {
      console.log('Login successful:', _loginData);
      toast.success('Login successful!');
      navigate('/leaderboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo at top left */}
      <LoginNavbar />

      <div className="flex flex-1">
        {/* Left side - Empty space (60%) */}
        <div className="hidden md:flex md:w-[60%] bg-background border-r border-border"></div>

        {/* Right side - Login form (40%) */}
        <div className="flex-1 md:w-[40%] flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-6">

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-sm text-muted-foreground">Your email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-muted border-0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-muted border-0"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#FF6B35] hover:bg-[#FF5722] text-white font-medium text-base"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
          </form>

          <div className="text-center text-sm">
            <Link to="/signup" className="text-[#FF6B35] hover:underline">
              Sign up instead
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
