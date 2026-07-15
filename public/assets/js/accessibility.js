(() => {
  const KEY = "ja_a11y_state";
  const defaults = { fontSizeLevel: 0, highContrast: false, reduceMotion: false, dyslexiaFont: false, underlineLinks: false, grayscale: false };
  const read = () => { try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return { ...defaults }; } };
  const save = state => localStorage.setItem(KEY, JSON.stringify(state));
  const apply = state => {
    const root = document.documentElement;
    root.style.fontSize = state.fontSizeLevel ? `${100 + state.fontSizeLevel * 10}%` : "";
    root.toggleAttribute("data-a11y-contrast", state.highContrast);
    root.toggleAttribute("data-a11y-motion", state.reduceMotion);
    root.toggleAttribute("data-a11y-font", state.dyslexiaFont);
    root.toggleAttribute("data-a11y-links", state.underlineLinks);
    root.toggleAttribute("data-a11y-grayscale", state.grayscale);
  };
  function create() {
    if (document.getElementById("accessibilityWidget")) return;
    let state = read(); apply(state);
    const widget = document.createElement("div");
    widget.id = "accessibilityWidget";
    widget.className = "donor-a11y";
    widget.innerHTML = `<button class="donor-a11y-launch" type="button" aria-expanded="false" aria-controls="accessibilityPanel" aria-label="Accessibility options">♿</button>
      <section id="accessibilityPanel" class="donor-a11y-panel" role="dialog" aria-label="Accessibility options" hidden>
        <header><strong>♿ Accessibility</strong><button type="button" data-close aria-label="Close">×</button></header>
        <div class="donor-a11y-body">
          <div class="donor-text-size"><span>Text Size</span><div><button type="button" data-font="minus" aria-label="Decrease text size">−</button><output>Default</output><button type="button" data-font="plus" aria-label="Increase text size">+</button></div></div>
          <button type="button" data-setting="highContrast"><span>◐ High Contrast</span><i></i></button>
          <button type="button" data-setting="reduceMotion"><span>⊘ Reduce Motion</span><i></i></button>
          <button type="button" data-setting="dyslexiaFont"><span>A Dyslexia-Friendly Font</span><i></i></button>
          <button type="button" data-setting="underlineLinks"><span>↗ Underline All Links</span><i></i></button>
          <button type="button" data-setting="grayscale"><span>◉ Grayscale Mode</span><i></i></button>
          <button type="button" class="donor-a11y-reset" data-reset>↻ Reset All</button>
        </div>
      </section>`;
    document.body.appendChild(widget);
    const launch = widget.querySelector(".donor-a11y-launch");
    const panel = widget.querySelector(".donor-a11y-panel");
    const output = widget.querySelector("output");
    const sync = () => {
      output.textContent = state.fontSizeLevel === 0 ? "Default" : `${state.fontSizeLevel > 0 ? "+" : ""}${state.fontSizeLevel * 10}%`;
      widget.querySelectorAll("[data-setting]").forEach(button => { const active = Boolean(state[button.dataset.setting]); button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
      apply(state); save(state);
    };
    launch.addEventListener("click", () => { panel.hidden = !panel.hidden; launch.setAttribute("aria-expanded", String(!panel.hidden)); });
    widget.querySelector("[data-close]").addEventListener("click", () => { panel.hidden = true; launch.setAttribute("aria-expanded", "false"); });
    widget.querySelectorAll("[data-setting]").forEach(button => button.addEventListener("click", () => { const key = button.dataset.setting; state[key] = !state[key]; sync(); }));
    widget.querySelector('[data-font="minus"]').addEventListener("click", () => { state.fontSizeLevel = Math.max(-2, state.fontSizeLevel - 1); sync(); });
    widget.querySelector('[data-font="plus"]').addEventListener("click", () => { state.fontSizeLevel = Math.min(4, state.fontSizeLevel + 1); sync(); });
    widget.querySelector("[data-reset]").addEventListener("click", () => { state = { ...defaults }; sync(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") { panel.hidden = true; launch.setAttribute("aria-expanded", "false"); } });
    sync();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", create, { once: true }) : create();
})();
