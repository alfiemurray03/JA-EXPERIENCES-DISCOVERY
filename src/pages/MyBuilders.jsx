import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/builder-engine`;

export function MyBuilders() {
  const { user } = useAuth();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRuns() {
      if (!user) return;
      try {
        const token = supabase.auth.session()?.access_token;
        const resp = await fetch(`${API_URL}/runs`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Failed to load runs.");
        setRuns(data.runs || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadRuns();
  }, [user]);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this builder run?")) return;
    try {
      const token = supabase.auth.session()?.access_token;
      await fetch(`${API_URL}/runs/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });
      setRuns(runs.filter(r => r.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-12"><div className="alert-error">{error}</div></div>;

  const inProgress = runs.filter(r => r.status === "draft" || r.status === "ready_for_generation");
  const completed = runs.filter(r => r.status === "completed");
  const failed = runs.filter(r => r.status === "failed");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-2">My Builders</h1>
        <p className="text-sm text-gray-500">Continue an unfinished builder or view completed plans.</p>
      </div>

      {/* In Progress */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">In Progress</h2>
        {inProgress.length === 0 ? (
          <div className="card-base text-center py-8">
            <p className="text-sm text-gray-500 mb-4">No builders in progress.</p>
            <Link to="/builders" className="btn-primary text-sm">Browse Builders</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {inProgress.map(run => (
              <div key={run.id} className="card-base flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{run.builder_definitions?.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{run.builder_definitions?.name}</h3>
                    <p className="text-xs text-gray-500">Started {new Date(run.started_at).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/builders/${run.builder_definitions?.slug}`} className="btn-secondary text-sm">Continue</Link>
                  <button onClick={() => handleDelete(run.id)} className="btn-ghost text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">Completed</h2>
        {completed.length === 0 ? (
          <div className="card-base text-center py-8">
            <p className="text-sm text-gray-500">No completed plans yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map(run => (
              <div key={run.id} className="card-base flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{run.builder_definitions?.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{run.builder_definitions?.name}</h3>
                    <p className="text-xs text-gray-500">{run.token_price} tokens · Completed {run.completed_at ? new Date(run.completed_at).toLocaleDateString('en-GB') : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/account/plans/${run.id}`} className="btn-secondary text-sm">View Plan</Link>
                  <button onClick={() => handleDelete(run.id)} className="btn-ghost text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Failed */}
      {failed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Failed</h2>
          <div className="space-y-3">
            {failed.map(run => (
              <div key={run.id} className="card-base flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{run.builder_definitions?.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{run.builder_definitions?.name}</h3>
                    <p className="text-xs text-red-500">{run.failure_info || "Generation failed"}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(run.id)} className="btn-ghost text-sm text-red-600">Delete</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
