import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import LoginNavbar from "@/components/LoginNavbar";
import {useAuth} from "@/context/AuthContext"

export default function SignUp() {
  const {isDark} = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    realName: "",
    userUrl: "",
    section: "",
    semester: "",
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
          user_url: formData.userUrl,
          section: formData.section,
          semester: formData.semester,
        },
      },
    });

    console.log(_signUpData);

    setLoading(false);

    if (error) {
      console.error('Sign up error:', error);
      alert(error.message);
    } else {
      console.log('Sign up successful:', _signUpData);
      alert("Sign up successful! Please check your email to verify your account.");
      navigate('/login');
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <LoginNavbar />

      <div className="flex flex-1 overflow-hidden min-h-0">
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
        <div className="flex-1 md:w-[40%] flex items-center justify-center p-8 bg-background overflow-hidden">
          <div className="w-full max-w-md space-y-6 py-8">

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">LeetCode Username</label>
              <Input
                type="text"
                name="username"
                placeholder="your-handle"
                value={formData.username}
                onChange={handleChange}
                className="h-12 bg-muted border-0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12 bg-muted border-0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="h-12 bg-muted border-0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Real name</label>
                <Input
                  type="text"
                  name="realName"
                  placeholder="John Doe"
                  value={formData.realName}
                  onChange={handleChange}
                  className="h-12 bg-muted border-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">User URL</label>
                <Input
                  type="url"
                  name="userUrl"
                  placeholder="https://example.com/profile"
                  value={formData.userUrl}
                  onChange={handleChange}
                  className="h-12 bg-muted border-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Input
                  type="text"
                  name="section"
                  placeholder="A"
                  value={formData.section}
                  onChange={handleChange}
                  className="h-12 bg-muted border-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Input
                  type="text"
                  name="semester"
                  placeholder="5"
                  value={formData.semester}
                  onChange={handleChange}
                  className="h-12 bg-muted border-0"
                  required
                />
              </div>
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
