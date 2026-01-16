import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import LoginNavbar from "@/components/LoginNavbar";
import { useAuth } from "@/context/AuthContext"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SignUp() {
  const { isDark } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    realName: "",
    section: "",
    semester: "",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password;

    // Validation
    const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
    const isValidUsername = (value: string) => /^[a-zA-Z0-9_]{3,24}$/.test(value);
    const isValidPassword = (value: string) => value.length >= 6;

    if (!isValidUsername(username)) {
      alert('Username must be 3-24 chars (letters, numbers, _)');
      return;
    }
    if (!isValidEmail(email)) {
      alert('Enter a valid email');
      return;
    }
    if (!isValidPassword(password)) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data: _signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
          data: {
            username,
            real_name: formData.realName,
            section: formData.section,
            semester: formData.semester,
            is_private: formData.isPrivate,
          },
      },
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
                <Label htmlFor="username" className="text-sm font-medium">LeetCode Username</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="your-handle"
                  value={formData.username}
                  onChange={handleChange}
                  className="h-12 bg-muted border-0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your leetCode username in your leetcode profile, used to get your coding details, make sure it's correct.
                </p>
              </div> 

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 bg-muted border-0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters. Use a strong password with letters, numbers, and symbols.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="realName" className="text-sm font-medium">Real Name</Label>
                <Input
                  id="realName"
                  type="text"
                  name="realName"
                  placeholder="John Doe"
                  value={formData.realName}
                  onChange={handleChange}
                  className="h-12 bg-muted border-0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your full name for identification on the leaderboard.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="section" className="text-sm font-medium">Section</Label>
                  <Input
                    id="section"
                    type="text"
                    name="section"
                    placeholder="A"
                    value={formData.section}
                    onChange={handleChange}
                    className="h-12 bg-muted border-0"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your class section (e.g., A, B, C).
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="semester" className="text-sm font-medium">Semester</Label>
                  <Input
                    id="semester"
                    type="text"
                    name="semester"
                    placeholder="5"
                    value={formData.semester}
                    onChange={handleChange}
                    className="h-12 bg-muted border-0"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Current semester number (1-8).
                  </p>
                </div>
              </div>

              {/* Public/Private Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="public-toggle" className="text-sm font-medium">
                    {formData.isPrivate ? "Private Profile" : "Public Profile"}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isPrivate 
                      ? "Your stats will not be visible on the public leaderboard, only you and your friends can see your stats."
                      : "Your stats will be visible on the public leaderboard, everyone can see your stats."}
                  </p>
                </div>
                <Switch
                  id="public-toggle"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                  className="data-[state=checked]:bg-[#FF6B35]"
                />
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