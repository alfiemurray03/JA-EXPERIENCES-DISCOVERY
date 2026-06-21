async function loadAdminCustomers() {
  const status = document.getElementById("adminStatus");
  const adminName = document.getElementById("adminName");
  const adminEmail = document.getElementById("adminEmail");
  const customerCount = document.getElementById("customerCount");
  const tableBody = document.getElementById("customerRows");
  const emptyState = document.getElementById("emptyState");

  try {
    const response = await fetch("/admin/customers", {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Admin data could not be loaded.");
    }

    status.textContent = "Admin access verified";
    adminName.textContent = data.admin.name || "JA admin";
    adminEmail.textContent = data.admin.email || "";
    customerCount.textContent = String(data.count || 0);

    tableBody.innerHTML = "";

    if (!data.customers || data.customers.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    data.customers.forEach((customer) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>
          <strong>${escapeHtml(customer.display_name || customer.verified_name || customer.email)}</strong>
          <span>${escapeHtml(customer.email || "")}</span>
        </td>
        <td>${escapeHtml(customer.contact_email || customer.email || "")}</td>
        <td>${escapeHtml(customer.phone || "Not added")}</td>
        <td>${escapeHtml(customer.communication_preference || "Email")}</td>
        <td>${escapeHtml(formatDate(customer.updated_at || customer.created_at))}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    status.textContent = "Admin access problem";
    tableBody.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent = error.message || "Unable to load admin customers.";
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

document.addEventListener("DOMContentLoaded", loadAdminCustomers);
