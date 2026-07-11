import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/builder-engine`;

export function BuilderRunner() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [builder, setBuilder] = useState(null);
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const getAuthHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabase.auth.session()?.access_token || ""}`,
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
  }, []);

  // Load builder definition and create/get run
  useEffect(() => {
    async function init() {
      try {
        const token = supabase.auth.session()?.access_token;
        if (!token) {
          navigate("/signin");
          return;
        }

        // Fetch builder definition
        const resp = await fetch(`${API_URL}/builders/${slug}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        });
        const data = await resp.json();

        if (!resp.ok) {
          setError(data.error || "Failed to load builder.");
          setLoading(false);
          return;
        }

        setBuilder(data.builder);

        if (!data.access.allowed) {
          setAccessDenied(data.access);
          setLoading(false);
          return;
        }

        // Create a new run
        const runResp = await fetch(`${API_URL}/runs`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ builder_id: data.builder.id }),
        });
        const runData = await runResp.json();

        if (!runResp.ok) {
          setError(runData.error || "Failed to start builder.");
          setLoading(false);
          return;
        }

        setRun(runData.run);
        setAnswers(runData.run.answers || {});
        setCurrentStep(runData.run.current_step || 0);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    }
    init();
  }, [slug, navigate, getAuthHeaders]);

  // Autosave
  const autosave = useCallback(async (newAnswers, newStep) => {
    if (!run) return;
    try {
      await fetch(`${API_URL}/runs/${run.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          answers: newAnswers,
          current_step: newStep,
          status: "draft",
        }),
      });
    } catch (e) {
      console.error("Autosave failed:", e);
    }
  }, [run, getAuthHeaders]);

  // Get visible questions (respecting conditionals)
  const visibleQuestions = builder?.questions?.filter(q => {
    if (!q.conditional) return true;
    return answers[q.conditional.field] === q.conditional.value;
  }) || [];

  const currentQuestion = visibleQuestions[currentStep];
  const isLastStep = currentStep >= visibleQuestions.length - 1;
  const progress = visibleQuestions.length > 0 ? ((currentStep + 1) / visibleQuestions.length) * 100 : 0;

  function handleAnswer(value) {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    setValidationError(null);
    autosave(newAnswers, currentStep);
  }

  function handleContinue() {
    // Validate required
    if (currentQuestion.required) {
      const val = answers[currentQuestion.id];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        setValidationError("This field is required.");
        return;
      }
    }
    // Validate number
    if (currentQuestion.type === "number" && answers[currentQuestion.id] !== undefined) {
      const num = Number(answers[currentQuestion.id]);
      if (isNaN(num)) { setValidationError("Please enter a valid number."); return; }
      if (currentQuestion.min !== undefined && num < currentQuestion.min) { setValidationError(`Minimum value is ${currentQuestion.min}.`); return; }
      if (currentQuestion.max !== undefined && num > currentQuestion.max) { setValidationError(`Maximum value is ${currentQuestion.max}.`); return; }
    }

    if (isLastStep) {
      setShowReview(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (showReview) { setShowReview(false); return; }
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  async function handleGenerate() {
    setGenerating(true);
    setValidationError(null);
    try {
      const resp = await fetch(`${API_URL}/runs/${run.id}/generate`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await resp.json();

      if (!resp.ok) {
        if (resp.status === 402) {
          setError(data.error + ` (You have ${data.balance} tokens, need ${data.required}.)`);
        } else if (resp.status === 409) {
          setError(data.error);
        } else {
          setError(data.error || "Generation failed.");
        }
        setGenerating(false);
        return;
      }

      setGenerationResult(data.run);
    } catch (e) {
      setError(e.message);
      setGenerating(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="alert-error mb-4">{error}</div>
      <Link to="/builders" className="btn-secondary">Back to Builders</Link>
    </div>
  );
  if (accessDenied) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card-base text-center">
        <h2 className="text-xl font-bold mb-3">Access Required</h2>
        <p className="text-gray-600 mb-4">{accessDenied.reason}</p>
        {accessDenied.action === "view_plans" && <Link to="/signup" className="btn-primary">View Plans</Link>}
        {accessDenied.action === "upgrade_plan" && <Link to="/signup" className="btn-primary">Upgrade Plan</Link>}
        {accessDenied.action === "purchase_tokens" && <Link to="/account/plans" className="btn-primary">Purchase Tokens</Link>}
      </div>
    </div>
  );

  // Generation result view
  if (generationResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card-base mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{builder.icon}</span>
            <div>
              <h1 className="text-2xl font-extrabold">{builder.name}</h1>
              <span className="badge-success">Completed</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">{run.token_price} tokens charged</p>
        </div>

        {generationResult.result?.sections?.map((section, i) => (
          <div key={i} className="card-base mb-4">
            <h2 className="text-lg font-bold mb-3">{section.title}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.content}</p>
          </div>
        ))}

        <div className="flex gap-4">
          <Link to="/account/plans" className="btn-primary">View My Plans</Link>
          <Link to="/builders" className="btn-secondary">Back to Builders</Link>
        </div>
      </div>
    );
  }

  // Review screen
  if (showReview) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold mb-2">Review Your Answers</h1>
          <p className="text-sm text-gray-500">Please review before generating your plan.</p>
        </div>

        <div className="card-base mb-6">
          <div className="space-y-4">
            {visibleQuestions.map((q, i) => {
              const answer = answers[q.id];
              const display = Array.isArray(answer) ? answer.join(", ") : answer || "Not answered";
              return (
                <div key={q.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-semibold text-gray-700">{q.label}</span>
                  <span className="text-sm text-gray-600 text-right">{display}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="alert-info mb-6">
          <strong>Token Cost:</strong> {builder.token_cost} Builder Usage Tokens will be deducted when you generate your plan.
        </div>

        <div className="flex gap-4">
          <button onClick={handleBack} className="btn-secondary" disabled={generating}>Back</button>
          <button onClick={handleGenerate} className="btn-primary" disabled={generating}>
            {generating ? (
              <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> Generating...</>
            ) : (
              <>Generate Plan ({builder.token_cost} tokens)</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Question step
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{builder.icon}</span>
          <div>
            <h1 className="text-2xl font-extrabold">{builder.name}</h1>
            <p className="text-sm text-gray-500">{builder.short_description}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Step {currentStep + 1} of {visibleQuestions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-brand-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question */}
      <div className="card-base mb-6">
        <label className="label-field" htmlFor={currentQuestion.id}>{currentQuestion.label}</label>
        {currentQuestion.help && <p className="text-xs text-gray-500 mb-3">{currentQuestion.help}</p>}

        {renderInput(currentQuestion, answers[currentQuestion.id], handleAnswer)}

        {validationError && <div className="alert-error mt-3 text-sm">{validationError}</div>}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button onClick={handleBack} className="btn-secondary" disabled={currentStep === 0}>Back</button>
        <button onClick={handleContinue} className="btn-primary ml-auto">
          {isLastStep ? "Review Answers" : "Continue"}
        </button>
      </div>

      {/* Exit */}
      <div className="mt-8 text-center">
        <Link to="/account/builders" className="text-sm text-gray-400 hover:text-gray-600">Save and continue later</Link>
      </div>
    </div>
  );
}

function renderInput(question, value, onChange) {
  switch (question.type) {
    case "short_text":
      return (
        <input
          id={question.id}
          type="text"
          className="input-field"
          placeholder={question.placeholder || ""}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        />
      );
    case "long_text":
      return (
        <textarea
          id={question.id}
          className="input-field min-h-[100px]"
          placeholder={question.placeholder || ""}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          id={question.id}
          type="number"
          className="input-field"
          placeholder={question.placeholder || ""}
          value={value ?? ""}
          min={question.min}
          max={question.max}
          onChange={e => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
    case "date":
      return (
        <input
          id={question.id}
          type="date"
          className="input-field"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        />
      );
    case "yes_no":
      return (
        <div className="flex gap-3">
          <button
            type="button"
            className={value === true ? "btn-primary" : "btn-secondary"}
            onClick={() => onChange(true)}
          >Yes</button>
          <button
            type="button"
            className={value === false ? "btn-primary" : "btn-secondary"}
            onClick={() => onChange(false)}
          >No</button>
        </div>
      );
    case "single_choice":
      return (
        <div className="space-y-2">
          {question.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                value === opt.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-300 hover:border-brand-300"
              }`}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    case "multiple_choice":
      return (
        <div className="space-y-2">
          {question.options.map(opt => {
            const selected = Array.isArray(value) && value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selected
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-300 hover:border-brand-300"
                }`}
                onClick={() => {
                  const arr = Array.isArray(value) ? [...value] : [];
                  if (selected) {
                    onChange(arr.filter(v => v !== opt.value));
                  } else {
                    onChange([...arr, opt.value]);
                  }
                }}
              >
                {selected && "✓ "}{opt.label}
              </button>
            );
          })}
        </div>
      );
    case "selectable_cards":
      return (
        <div className="grid grid-cols-2 gap-3">
          {question.options.map(opt => {
            const selected = Array.isArray(value) && value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className={`p-4 rounded-lg border text-center transition-all ${
                  selected
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-300 hover:border-brand-300"
                }`}
                onClick={() => {
                  const arr = Array.isArray(value) ? [...value] : [];
                  if (selected) {
                    onChange(arr.filter(v => v !== opt.value));
                  } else {
                    onChange([...arr, opt.value]);
                  }
                }}
              >
                <div className="text-2xl mb-1">{opt.icon}</div>
                <div className="text-sm font-semibold">{opt.label}</div>
              </button>
            );
          })}
        </div>
      );
    default:
      return <input id={question.id} type="text" className="input-field" value={value || ""} onChange={e => onChange(e.target.value)} />;
  }
}
