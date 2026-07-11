import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";

export function MyPlans() {
  const { id } = useParams();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPlans() {
      if (!user) return;
      try {
        const { data, err } = await supabase
          .from("saved_outputs")
          .select("*")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setPlans(data || []);

        if (id) {
          const plan = (data || []).find(p => p.id === id);
          if (plan) setSelectedPlan(plan);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [user, id]);

  async function handleDelete(planId) {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const { err } = await supabase.from("saved_outputs").delete().eq("id", planId);
      if (err) throw err;
      setPlans(plans.filter(p => p.id !== planId));
      if (selectedPlan?.id === planId) setSelectedPlan(null);
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-12"><div className="alert-error">{error}</div></div>;

  // Detail view
  if (selectedPlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link to="/account/plans" className="text-sm text-brand-600 hover:underline">&larr; Back to My Plans</Link>
        </div>
        <div className="card-base mb-6">
          <h1 className="text-2xl font-extrabold mb-2">{selectedPlan.title}</h1>
          <p className="text-sm text-gray-500">{selectedPlan.tokens_used} tokens · {new Date(selectedPlan.created_at).toLocaleDateString('en-GB')}</p>
        </div>

        {selectedPlan.content?.sections?.map((section, i) => (
          <div key={i} className="card-base mb-4">
            <h2 className="text-lg font-bold mb-3">{section.title}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.content}</p>
          </div>
        )) || (
          <div className="card-base">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedPlan.content, null, 2)}</pre>
          </div>
        )}

        <button onClick={() => handleDelete(selectedPlan.id)} className="btn-destructive mt-6">Delete Plan</button>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-2">My Plans</h1>
        <p className="text-sm text-gray-500">Your saved personalised plans.</p>
      </div>

      {plans.length === 0 ? (
        <div className="card-base text-center py-12">
          <h3 className="text-lg font-bold mb-2">No saved plans yet</h3>
          <p className="text-sm text-gray-500 mb-4">Complete a builder to generate your first plan.</p>
          <Link to="/builders" className="btn-primary">Browse Builders</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <div key={plan.id} className="card-base flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{plan.title}</h3>
                <p className="text-xs text-gray-500">{plan.tokens_used} tokens · {new Date(plan.created_at).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/account/plans/${plan.id}`} className="btn-secondary text-sm">Open</Link>
                <button onClick={() => handleDelete(plan.id)} className="btn-ghost text-sm text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
