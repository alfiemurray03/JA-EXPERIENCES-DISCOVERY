async function loadAccessProfile() {
  bindDashboardShell();
  await applyAccountBranding();

  const params = new URLSearchParams(window.location.search);
  const shouldHydrateProfile = params.get("signedin") === "1" || params.get("hydrate") === "1";

  console.log("[debug] loadAccessProfile: shouldHydrateProfile=", shouldHydrateProfile);

  if (!shouldHydrateProfile) {
    // Silent check: sometimes Cloudflare Access authenticates and returns the user
    // to /account/ without the signedin=1 query parameter. In that case, try a
    // JSON fetch to /account/profile to see if a valid session/profile exists
    // and hydrate the page client-side. This avoids touching Access settings.
    try {
      console.log("[debug] loadAccessProfile: starting silent check fetch /account/profile");
      const check = await fetch("/account/profile", {
        credentials: "include",
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });

      console.log("[debug] loadAccessProfile: silent check response", check.status, check.statusText, check.headers.get("content-type"));

      if (check.ok) {
        try {
          const data = await check.json();
          console.log("[debug] loadAccessProfile: silent check parsed JSON", data?.profile?.email);
          const profile = data.profile;

          updateProfile(profile);
          populateForm(profile);
          populateConsent(data.consent || {});
          if (hasEligibleAccess(profile)) {
            bindProfileForm(profile);
            await loadAccountRequests();
            bindAccountRequestForms();
          } else {
            renderRestrictedLists();
          }
          return;
        } catch (e) {
          console.error("[debug] loadAccessProfile: silent check JSON parse failed", e && e.message);
        }
      }
    } catch (e) {
      console.error("[debug] loadAccessProfile: silent check fetch failed", e && e.message);
      // ignore and fall back to signed-out landing
    }

    showSignedOutLanding();
    return;
  }

  try {
    console.log("[debug] loadAccessProfile: signedin=1 flow - fetching /account/profile");
    const response = await fetch("/account/profile", {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });

    console.log("[debug] loadAccessProfile: signedin flow response", response.status, response.statusText, response.headers.get("content-type"));

    if (!response.ok) {
      throw new Error("Profile response was not available.");
    }

    try {
      const data = await response.json();
      console.log("[debug] loadAccessProfile: parsed profile JSON", data?.profile?.email);
      const profile = data.profile;

      updateProfile(profile);
      populateForm(profile);
      populateConsent(data.consent || {});
      if (hasEligibleAccess(profile)) {
        bindProfileForm(profile);
        await loadAccountRequests();
        bindAccountRequestForms();
      } else {
        renderRestrictedLists();
      }
    } catch (err) {
      console.error("[debug] loadAccessProfile: profile JSON parse failed", err && err.message);
      throw err;
    }
  } catch (error) {
    console.error("[debug] loadAccessProfile: signedin flow failed", error && error.message);
    showProfileError(error);
  }
}

function showSignedOutLanding() {
  setAccountSignedInState(false, false);
  setText("accountHeroTitle", "Customer account access");
  setText("accountHeroText", "Sign in with JA Group Services CIAM to access eligible customer services, data requests and support reports.");
  setText("secureAccountBadge", "Secure access");
}
