import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export function BuildersCatalogue() {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    async function loadBuilders() {
      try {
        const { data, err } = await supabase
          .from("builder_definitions")
          .select("id, builder_key, name, slug, category, icon, short_description, creates_description, estimated_minutes, token_cost, min_plan, trial_eligible, featured, display_order")
          .eq("status", "published")
          .order("display_order");

        if (err) throw err;
        setBuilders(data || []);

        const cats = ["All", ...new Set((data || []).map(b => b.category))];
        setCategories(cats);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadBuilders();
  }, []);

  const filtered = filter === "All" ? builders : builders.filter(b => b.category === filter);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="max-w-6xl mx-auto px-4 py-12"><div className="alert-error">{error}</div></div>;

  return (
    <div>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="badge-primary mb-4">Experience Builders</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Build your next experience</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose a guided builder to create personalised, actionable plans. Preview for free — only use Builder Usage Tokens when you save.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={filter === cat ? "badge-primary" : "badge bg-gray-100 text-gray-500 border border-gray-200"}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Builder cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-bold mb-2">No builders found</h3>
              <p className="text-sm text-gray-500">Try a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(builder => (
                <div key={builder.id} className="card-hover">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{builder.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{builder.name}</h3>
                      <span className="badge bg-gray-100 text-gray-500 border border-gray-200">{builder.category}</span>
                    </div>
                    {builder.featured && <span className="badge-success ml-auto">Featured</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{builder.short_description}</p>
                  <p className="text-xs text-gray-500 mb-4"><strong className="text-gray-700">You'll create:</strong> {builder.creates_description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-3 border-t border-gray-100">
                    <span>~{builder.estimated_minutes} min</span>
                    <span>{builder.token_cost} tokens</span>
                    <span className="capitalize">{builder.min_plan} plan</span>
                    {builder.trial_eligible && <span className="text-green-600">Trial OK</span>}
                  </div>
                  <Link to={`/builders/${builder.slug}`} className="btn-primary w-full text-sm">
                    Start Builder
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
