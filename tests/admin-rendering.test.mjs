import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { parseHTML } from "linkedom";

const source = await readFile(new URL("../public/assets/js/admin-control.js", import.meta.url), "utf8");

function adminContext() {
  const { window, document } = parseHTML("<!doctype html><html><body><main id='adminPanel'></main></body></html>");
  Object.defineProperty(window, "location", { value: { search: "", href: "https://experiences.example.test/admin/dashboard/" }, configurable: true });
  const context = vm.createContext({
    window,
    document,
    console,
    URL,
    URLSearchParams,
    Request,
    Response,
    Headers,
    fetch: async () => new Response("{}", { headers: { "Content-Type": "application/json" } }),
    localStorage: { getItem: () => null, setItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {} },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Blob,
    CSS: { escape: (value) => String(value) },
    crypto,
    Intl,
    Event: window.Event
  });
  vm.runInContext(source, context);
  return { context, document };
}

test("all nine System Settings tabs execute without an undefined icon helper", () => {
  const { context, document } = adminContext();
  const data = {
    site_status: "normal",
    coming_soon: { headline: "Coming Soon", subtext: "Preparing to launch", launchDate: "", countdownEnabled: false },
    platform: { builders: [], addons: [] },
    plans: [],
    stripe: {},
    email: {},
    policies: [],
    appearance: {}
  };
  assert.doesNotThrow(() => context.renderSystemSettings(data));
  const container = document.getElementById("systemSettingsTabContent");
  for (const tab of ["general", "stripe", "products", "plans", "email", "compliance", "appearance", "sitestatus", "troubleshooting"]) {
    assert.doesNotThrow(() => context.renderSystemSettingsTab(tab, container, data), tab);
    assert.ok(container.textContent.trim().length > 0, `${tab} should render content`);
  }
});
