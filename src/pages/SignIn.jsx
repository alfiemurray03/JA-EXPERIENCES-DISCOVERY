import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/builders");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card-base">
          <h1 className="text-2xl font-extrabold mb-2">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to JA Experiences & Discovery</p>
          {error && <div className="alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field" htmlFor="email">Email</label>
              <input id="email" type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label-field" htmlFor="password">Password</label>
              <input id="password" type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Don't have an account? <Link to="/signup" className="text-brand-600 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
