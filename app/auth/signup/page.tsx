"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Leaf, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { signIn, getProviders } from "next-auth/react";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    getProviders().then((prov) => setProviders(prov));
  }, []);

  // Helper to check if provider is configured (simulate for now)
  const isProviderConfigured = (id: string) => {
    if (id === "google") return Boolean(process.env.NEXT_PUBLIC_GOOGLE_ENABLED);
    if (id === "azure-ad") return Boolean(process.env.NEXT_PUBLIC_AZURE_AD_ENABLED);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast({
          title: "Account created!",
          description:
            "Your account has been created successfully. You can now sign in.",
        });
        router.push("/auth/signin");
      } else {
        const data = await response.json();
        setError(data.error || "An error occurred");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">The House Plant Store</span>
          </div>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join us and discover beautiful plants for your home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth Providers */}
          {providers && (
            <>
              <div className="flex flex-col gap-3 mb-3">
                {Object.values(providers)
                  .filter((prov: any) => prov.id !== "credentials")
                  .map((prov: any) => {
                    let label = prov.name;
                    let icon = null;
                    if (prov.id === "google") {
                      label = "Google";
                      icon = <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.9 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 15 24 15c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3 15.6 3 8.1 8.1 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.9 0 11.3-2.1 15.5-5.7l-7.2-5.9C29.7 35.1 27 36 24 36c-5.9 0-10.8-3.8-12.6-9.1l-7 5.4C8.1 39.9 15.6 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.7 7.5-11.7 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3c-6.6 0-12 5.4-12 12s5.4 12 12 12c2.7 0 5.2-.9 7.2-2.4l6.4 6.4C33.5 42.9 28.1 45 24 45z"/></g></svg>;
                    } else if (prov.id === "azure-ad") {
                      label = "Microsoft";
                      icon = <svg className="h-5 w-5" viewBox="0 0 32 32"><rect fill="#F25022" x="2" y="2" width="13" height="13"/><rect fill="#7FBA00" x="17" y="2" width="13" height="13"/><rect fill="#00A4EF" x="2" y="17" width="13" height="13"/><rect fill="#FFB900" x="17" y="17" width="13" height="13"/></svg>;
                    }
                    const configured = isProviderConfigured(prov.id);
                    return (
                      <Button
                        key={prov.id}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 font-medium border-2 border-muted hover:border-primary transition"
                        onClick={() => {
                          if (configured) signIn(prov.id);
                          else alert('This login method will be available once configured.');
                        }}
                        disabled={false}
                      >
                        {icon}
                        Sign up with {label}
                      </Button>
                    );
                  })}
              </div>
              {(!isProviderConfigured('google') || !isProviderConfigured('azure-ad')) && (
                <div className="text-xs text-muted-foreground mb-3 text-center">
                  Google and Microsoft login will be available once configured.
                </div>
              )}
            </>
          )}
          {/* Divider */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground uppercase">or</span>
            <div className="flex-1 h-px bg-muted-foreground/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
