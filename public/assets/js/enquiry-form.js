document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#customerForm");
  const status = document.querySelector("#formStatus");
  if (!form || !status) return;

  const startedAt = form.querySelector('[name="startedAt"]');
  startedAt.value = String(Date.now());

  const params = new URLSearchParams(window.location.search);
  const destination = params.get("destination");
  if (destination && form.elements.destination) form.elements.destination.value = destination;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submit = form.querySelector('button[type="submit"]');
    const originalText = submit.textContent;
    submit.disabled = true;
    submit.textContent = "Sending...";
    status.className = "form-status";
    status.textContent = "";

    const data = Object.fromEntries(new FormData(form).entries());
    data.socialTariff = Boolean(form.elements.socialTariff?.checked);
    data.specialCategoryConsent = Boolean(form.elements.specialCategoryConsent?.checked);
    data.transportConfirmed = Boolean(form.elements.transportConfirmed?.checked);
    data.termsAccepted = Boolean(form.elements.termsAccepted?.checked);
    data.privacyAccepted = Boolean(form.elements.privacyAccepted?.checked);
    data.marketingConsent = Boolean(form.elements.marketingConsent?.checked);

    if (data.supportNeeds?.trim() && !data.specialCategoryConsent) {
      status.className = "form-status error";
      status.textContent = "Please confirm the sensitive-information consent, or remove the accessibility information.";
      submit.disabled = false;
      submit.textContent = originalText;
      return;
    }

    if (!data.termsAccepted || !data.privacyAccepted) {
      status.className = "form-status error";
      status.textContent = "Please confirm the Terms of Service and Privacy Notice before sending your enquiry.";
      submit.disabled = false;
      submit.textContent = originalText;
      return;
    }

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : { ok: false, message: "The online form could not be sent. Please try again later." };
      if (!response.ok || !result.ok) throw new Error(result.message || "The form could not be sent.");

      form.hidden = true;
      status.className = "form-status success";
      status.innerHTML = `<strong>Message sent.</strong><br>Your reference is <strong>${result.reference}</strong>.`;
    } catch (error) {
      status.className = "form-status error";
      status.textContent = error.message;
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
});
