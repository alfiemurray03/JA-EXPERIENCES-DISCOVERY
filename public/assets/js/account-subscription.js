fetch("/account/profile", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Profile data was not available.")))
  .then((data) => {
    const profile = data.profile || {};
    const fullName = profile.displayName || profile.verifiedName || "Customer";
    const plan = profile.currentPlan || "Standard";
    const planType = profile.currentPlanType || profile.customerStatus || "Standard";
    const linked = Boolean(profile.stripeCustomerId);
    document.getElementById("subscriptionHeading").textContent = fullName;
    document.getElementById("subscriptionCaption").textContent = profile.email ? `Signed in as ${profile.email}` : "Signed in securely with Microsoft Entra ID";
    document.getElementById("subscriptionAvatar").textContent = (fullName || "JA").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "JA";
    document.getElementById("currentSubscription").textContent = plan;
    document.getElementById("currentSubscriptionDetail").textContent = plan;
    document.getElementById("billingFrequency").textContent = profile.lifetimeAccess ? "Lifetime" : "Monthly / per plan";
    document.getElementById("billingFrequencyDetail").textContent = profile.lifetimeAccess ? "Lifetime" : "Monthly / per plan";
    document.getElementById("billingStatus").textContent = linked ? "Linked" : "Not linked";
    document.getElementById("billingStatusDetail").textContent = profile.hasEligibleAccess ? "Active" : "Restricted";
    document.getElementById("billingStatusBadge").textContent = profile.hasEligibleAccess ? "Active account" : "Restricted access";
    document.getElementById("renewalDate").textContent = "Managed by current plan terms";
    document.getElementById("nextPayment").textContent = profile.lifetimeAccess ? "No renewal due" : "Shown in Stripe checkout and receipts";
    document.getElementById("nextPaymentDetail").textContent = profile.lifetimeAccess ? "No renewal due" : "Shown in Stripe checkout and receipts";
    document.getElementById("planFeatures").textContent = planType;
    document.getElementById("sidebarAvatar").textContent = (fullName || "JA").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "JA";
    document.getElementById("sidebarName").textContent = fullName;
    document.getElementById("sidebarEmail").textContent = profile.email || "Signed in securely";
  })
  .catch((error) => {
    document.getElementById("subscriptionHeading").textContent = "Unable to load billing";
    document.getElementById("subscriptionCaption").textContent = error.message || "Billing data could not be loaded.";
    for (const id of ["currentSubscription", "currentSubscriptionDetail", "billingStatus", "billingStatusDetail", "planFeatures"]) {
      document.getElementById(id).textContent = "Unavailable";
    }
  });
