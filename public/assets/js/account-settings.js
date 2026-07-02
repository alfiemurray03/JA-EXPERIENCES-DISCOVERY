const SETTINGS_KEY = "ja-account-settings";
const defaults = { themeSelect: "system", colourPreference: "default", emailAlerts: true, smsAlerts: false, marketing: true, privacyMode: false, dataSharing: false, cookiesPref: true, language: "English (UK)", region: "United Kingdom", timeZone: "Europe/London", textSize: false, highContrast: false, dyslexiaFont: false, reducedMotion: false, underlineLinks: false, focusEnhancements: true };
const ids = Object.keys(defaults);
const read = () => {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return { ...defaults };
  }
};
const write = (value) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
const apply = (value) => {
  document.documentElement.dataset.theme = value.themeSelect;
  document.documentElement.style.fontSize = value.textSize ? "112.5%" : "100%";
  document.body.classList.toggle("a11y-underlines", Boolean(value.underlineLinks));
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    if (element.type === "checkbox") element.checked = Boolean(value[id]);
    else element.value = value[id] ?? defaults[id];
  });
};
const collect = () => {
  const value = {};
  ids.forEach((id) => {
    const element = document.getElementById(id);
    value[id] = element?.type === "checkbox" ? Boolean(element.checked) : (element?.value || defaults[id]);
  });
  return value;
};
const message = document.getElementById("settingsMessage");
apply(read());
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  const next = collect();
  write(next);
  apply(next);
  if (message) message.textContent = "Settings saved in this browser.";
});
document.getElementById("resetSettingsBtn").addEventListener("click", () => {
  localStorage.removeItem(SETTINGS_KEY);
  apply(defaults);
  if (message) message.textContent = "Preferences reset.";
});
