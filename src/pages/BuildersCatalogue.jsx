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
      <section className="builder-hero">
        <div className="shell-container text-center">
          <span className="badge-primary mb-4">JA Plan Studio builders</span>
          <h1>Build a plan that feels made for you</h1>
          <p>Answer a few guided questions and turn your ideas into a clear, personalised plan you can return to whenever you need it.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="builder-catalogue">
        <div className="shell-container">
          <div className="catalogue-heading">
            <div><span className="eyebrow">Builder gallery</span><h2>Choose what you want to plan</h2></div>
            <span className="catalogue-count">{filtered.length} {filtered.length === 1 ? "builder" : "builders"}</span>
          </div>
          <div className="filter-row" aria-label="Filter builders by category">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={filter === cat ? "filter-pill active" : "filter-pill"}
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
            <div className="builder-grid">
              {filtered.map(builder => (
                <article key={builder.id} className="builder-card">
                  <div className="builder-card-top">
                    <span className="builder-icon">{builder.icon}</span>
                    <div>
                      <h3>{builder.name}</h3>
                      <span className="builder-category">{builder.category}</span>
                    </div>
                    {builder.featured && <span className="badge-success ml-auto">Featured</span>}
                  </div>
                  <p className="builder-summary">{builder.short_description}</p>
                  <p className="builder-output"><strong>You'll create:</strong> {builder.creates_description}</p>
                  <div className="builder-meta">
                    <span>~{builder.estimated_minutes} min</span>
                    <span className="capitalize">{builder.min_plan} access</span>
                  </div>
                  <Link to={`/builders/${builder.slug}`} className="builder-link">
                    Open builder <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
