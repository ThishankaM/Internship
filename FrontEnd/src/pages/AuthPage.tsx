import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Save token and go to dashboard
      localStorage.setItem("token", data.access_token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] p-8 rounded-2xl w-full max-w-md border border-[#333]">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} className="bg-[#242424] border-[#333] text-white" />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#242424] border-[#333] text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#242424] border-[#333] text-white" />
          </div>
          
          <Button type="submit" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
            {isLogin ? "Login" : "Register"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#8B5CF6] hover:underline">
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
