(() => {
  "use strict";

  const status = document.getElementById("logout-status");
  const retry = document.getElementById("logout-retry");
  let logoutInProgress = false;

  async function completeLogout() {
    if (logoutInProgress) return;
    logoutInProgress = true;
    retry.hidden = true;
    status.textContent = "Ending your secure access session.";

    try {
      // Cloudflare Access does not support a post-logout redirect parameter.
      // Await its managed endpoint before starting the Microsoft Entra logout.
      const response = await fetch("/cdn-cgi/access/logout", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        redirect: "manual"
      });

      if (response.type !== "opaqueredirect" && !response.ok) {
        throw new Error("Cloudflare Access logout failed.");
      }

      status.textContent = "Opening Microsoft sign-out…";
      window.location.replace("/signed-out/microsoft-logout");
    } catch {
      logoutInProgress = false;
      status.textContent = "We could not complete secure sign-out. Check your connection and try again.";
      retry.hidden = false;
    }
  }

  retry.addEventListener("click", completeLogout);
  completeLogout();
})();
