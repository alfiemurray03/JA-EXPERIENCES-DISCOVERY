document.addEventListener("DOMContentLoaded", () => {
  const banner = document.querySelector("#cookieBanner");
  const accept = document.querySelector("#acceptCookies");
  const essential = document.querySelector("#essentialCookies");
  const key = "ja-travel-cookie-choice";

  if (banner && !localStorage.getItem(key)) {
    banner.classList.add("show");
    document.body.classList.add("cookie-open");
  }

  function closeBanner(choice) {
    localStorage.setItem(key, choice);
    banner?.classList.remove("show");
    document.body.classList.remove("cookie-open");
  }

  accept?.addEventListener("click", () => closeBanner("accepted"));
  essential?.addEventListener("click", () => closeBanner("essential"));
});
