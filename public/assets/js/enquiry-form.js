document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#discoveryEnquiryForm");
  const status = document.querySelector("#enquiryStatus");
  if (!form || !status) return;

  const startedAt = form.querySelector('[name="startedAt"]');
  startedAt.value = String(Date.now());

  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  const destination = params.get("destination");
  if (plan && form.elements.plan) form.elements.plan.value = plan;
  if (destination && form.elements.destination) form.elements.destination.value = destination;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = "Sending enquiry...";
    status.className = "form-status";
    status.textContent = "";

    const data = Object.fromEntries(new FormData(form).entries());
    data.socialTariff = form.elements.socialTariff.checked;
    data.specialCategoryConsent = form.elements.specialCategoryConsent.checked;
    data.privacyAccepted = form.elements.privacyAccepted.checked;

    if (data.supportNeeds.trim() && !data.specialCategoryConsent) {
      status.className = "form-status error";
      status.textContent = "Please confirm the sensitive-information consent, or remove the access or support information.";
      submit.disabled = false;
      submit.textContent = "Send free enquiry";
      return;
    }

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "The enquiry could not be sent.");

      form.hidden = true;
      status.className = "form-status success";
      status.innerHTML = `<strong>Enquiry sent.</strong><br>Your reference is <strong>${result.reference}</strong>. We aim to reply within one to three working days.`;
    } catch (error) {
      status.className = "form-status error";
      status.textContent = error.message;
      submit.disabled = false;
      submit.textContent = "Send free enquiry";
    }
  });
});
