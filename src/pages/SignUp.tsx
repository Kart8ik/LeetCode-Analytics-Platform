import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import LoginNavbar from "@/components/LoginNavbar";
import { useAuth } from "@/context/AuthContext"
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const { isDark } = useAuth()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
    const isValidPassword = (value: string) => value.length >= 6;

    if (!isValidEmail(email.trim())) {
      alert('Enter a valid email');
      return;
    }
    if (!isValidPassword(password)) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });


    setLoading(false);

    if (error) {
      console.error('Sign up error:', error);
      alert(error.message);
    } else {
      alert("Sign up successful! Please check your email to verify your account.");
      navigate('/login');
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <LoginNavbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Empty space (60%) */}
        <div className="hidden md:flex md:w-[60%] bg-background border-r border-border overflow-hidden h-full">
          {isDark ? (
            <img
              src="Dark_Mode_Image.png"
              alt="Background"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="Light_Mode_Image.png"
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {/* Right side - Signup form (40%) */}
        <div className="flex-1 md:w-[40%] bg-background p-6 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-md mx-auto space-y-6">

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted border-0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send a verification link to confirm your account. Your email stays private.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-muted border-0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters. Use a strong password with letters, numbers, and symbols.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#FF6B35] hover:bg-[#FF5722] text-white font-medium text-base"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-[#FF6B35] hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}