import { useState } from "react";
import { Info, Zap } from "lucide-react";

interface SignInProps {
  onLogin: (userID: number) => void;
}

function InventoryIllustration() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
      <div
        className="absolute rounded-2xl"
        style={{
          width: 260, height: 260,
          background: "#1e293b",
          boxShadow: "0 8px 48px rgba(15,23,42,0.5)",
          top: 20, left: 20,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="rounded-t-2xl" style={{ height: 52, background: "#2563eb" }} />
        <div className="px-6 pt-5 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="rounded-full flex-shrink-0" style={{ width: 18, height: 18, background: "#3b82f6" }} />
              <div className="rounded-full flex-1" style={{ height: 10, background: "#334155" }} />
              {i === 3 && <div className="rounded-full" style={{ width: "40%", height: 10, background: "#334155" }} />}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute" style={{ bottom: 0, right: 10 }}>
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
          <polygon points="55,10 100,32 55,54 10,32" fill="#334155" />
          <polygon points="10,32 55,54 55,100 10,78" fill="#1e293b" />
          <polygon points="100,32 55,54 55,100 100,78" fill="#2563eb" opacity="0.7" />
          <line x1="55" y1="54" x2="55" y2="100" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4" />
          <line x1="30" y1="43" x2="80" y2="43" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}

export function SignIn({ onLogin }: SignInProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      if (res.ok) {
        const user = await res.json();
        onLogin(user.userID);
      } else {
        setError("Invalid username or password. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("Cannot connect to the server. Is your C# backend running?");
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)", background: "#1e293b",
    color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full flex items-center justify-between gap-8 px-12" style={{ maxWidth: 1100 }}>
        <div style={{ flex: "0 0 420px", maxWidth: 420 }}>
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: "#2563eb" }}>
              <Zap size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Carbs Technologies</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>Inventory System</div>
            </div>
          </div>
          <div className="mb-10">
            <h1 style={{ color: "#f1f5f9", fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
              Inventory and<br />Stock Control<br /><span style={{ color: "#3b82f6" }}>System</span>
            </h1>
          </div>
          {error && <div className="mb-4 px-4 py-2 rounded-lg" style={{ background: "#ef444418", color: "#f87171", fontSize: 13 }}>{error}</div>}
          <div className="mb-4">
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Username:</label>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKey} style={inputStyle} />
          </div>
          <div className="mb-8">
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#cbd5e1", marginBottom: 8 }}>Password:</label>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKey} style={inputStyle} />
          </div>
          <div className="flex justify-center mb-8">
            <button onClick={handleLogin} disabled={loading} style={{ width: 280, padding: "14px 0", background: loading ? "#1d4ed8" : "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: 15, borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", transition: "background 0.15s" }}>
              {loading ? "Signing in…" : "Login"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded" style={{ width: 28, height: 28, background: "#2563eb" }}><Info size={15} color="#ffffff" /></div>
            <a href="#" style={{ color: "#3b82f6", fontWeight: 600, fontSize: 14, textDecoration: "underline" }} onClick={(e) => e.preventDefault()}>Need help?</a>
          </div>
        </div>
        <div className="flex items-center justify-center" style={{ flex: 1 }}>
          <InventoryIllustration />
        </div>
      </div>
    </div>
  );
}