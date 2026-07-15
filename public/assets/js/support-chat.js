(() => {
  function create() {
    if (document.getElementById("supportChatWidget")) return;
    const widget = document.createElement("div");
    widget.id = "supportChatWidget";
    widget.className = "donor-chat";
    widget.innerHTML = `<button class="donor-chat-launch" type="button" aria-expanded="false" aria-controls="supportChatPanel" aria-label="Open support chat">◯</button>
      <section id="supportChatPanel" class="donor-chat-panel" role="dialog" aria-label="JA Plan Studio support" hidden>
        <header><div><strong>JA Plan Studio Support</strong><small>How can we help?</small></div><button type="button" data-chat-close aria-label="Close">×</button></header>
        <div class="donor-chat-body"><p>Hello! Choose an option and we’ll point you in the right direction.</p>
          <a href="/faqs/">Help with builders</a><a href="/account/support/">Account and subscription support</a><a href="/contact/">Contact the JA Group Services team</a></div>
      </section>`;
    document.body.appendChild(widget);
    const launch = widget.querySelector(".donor-chat-launch"); const panel = widget.querySelector(".donor-chat-panel");
    launch.addEventListener("click", () => { panel.hidden = !panel.hidden; launch.setAttribute("aria-expanded", String(!panel.hidden)); });
    widget.querySelector("[data-chat-close]").addEventListener("click", () => { panel.hidden = true; launch.setAttribute("aria-expanded", "false"); });
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", create, { once: true }) : create();
})();
