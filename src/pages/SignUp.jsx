import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";

export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await signUp(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Create profile
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: email,
        full_name: fullName || null,
      });
      navigate("/builders");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card-base">
          <h1 className="text-2xl font-extrabold mb-2">Create account</h1>
          <p className="text-sm text-gray-500 mb-6">Create your JA Plan Studio account and start building personalised plans.</p>
          {error && <div className="alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field" htmlFor="fullName">Full name (optional)</label>
              <input id="fullName" type="text" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label-field" htmlFor="email">Email</label>
              <input id="email" type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label-field" htmlFor="password">Password</label>
              <input id="password" type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Already have an account? <Link to="/signin" className="text-brand-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
