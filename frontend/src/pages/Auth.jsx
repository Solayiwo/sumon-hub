import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom"; 
import { ArrowLeft } from "lucide-react";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Extract user from AuthContext
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();

  // Early return redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    let result;

    if (isSignUp) {
      result = await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
    } else {
      result = await login(
        formData.email,
        formData.password
      );
    }

    if (result && result.success) {
      navigate("/");
    } else {
      setError(result?.error || "Authentication route dropped. Please check connection configurations.");
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Branding & Lottie Display Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-indigo-100/40 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/60">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Store
            </Link>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                <Link to="/">
                  SuMon<span className="text-indigo-900">Hub</span>
                </Link>
              </h1>
              <p className="text-xs font-medium text-slate-600 leading-snug">
                Your premier destination for high-efficiency electronics.
              </p>
            </div>
          </div>

          <div className="w-full my-4 flex items-center justify-center max-h-[220px]">
            <DotLottiePlayer
              src="https://lottie.host/801c80ea-1200-47b2-b4fa-4b574229b1aa/bE3C5pQ6wz.json"
              autoplay
              loop
              className="w-full max-w-[200px] h-auto"
            />
          </div>

          <div className="space-y-1">
            <blockquote className="text-xs italic text-slate-500 leading-relaxed">
              &ldquo;The clarity and speed of SuMon Hub transformed our procurement process entirely.&rdquo;
            </blockquote>
            <p className="text-[11px] font-semibold text-slate-700">— Enterprise Partner</p>
          </div>
        </div>

        {/* Right Form Processing Panel */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isSignUp ? "Create your SuMon Hub Account" : "Sign in to SuMon Hub"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors"
                >
                  {isSignUp ? "Sign in here" : "Create one here"}
                </button>
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">First Name</label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required={isSignUp}
                      className="bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Last Name</label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required={isSignUp}
                      className="bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-indigo-600"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="jane.doe@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-indigo-600"
                />
                {isSignUp && (
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Must be at least 8 characters long.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 h-auto text-sm shadow-sm transition-all mt-2 active:scale-[0.99]"
              >
                {isLoading ? "Processing Action..." : isSignUp ? "Create Account Instance" : "Verify & Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Auth;