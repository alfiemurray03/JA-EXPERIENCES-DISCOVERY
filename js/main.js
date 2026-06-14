document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });
  }

  const forms = document.querySelectorAll('form[data-validate="true"]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const status = form.querySelector('.status-box');
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.setAttribute('aria-invalid', 'false');
        }
      });

      if (!valid) {
        if (status) {
          status.className = 'status-box error';
          status.textContent = 'Please complete all required fields before submitting.';
        }
        return;
      }

      if (status) {
        status.className = 'status-box';
        status.textContent = 'Form ready for backend submission. No fake submission has been performed.';
      }
    });
  });

  const filterInput = document.querySelector('[data-destination-filter]');
  const cards = document.querySelectorAll('[data-destination-card]');

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', function () {
      const value = this.value.toLowerCase().trim();
      cards.forEach(function (card) {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(value) ? '' : 'none';
      });
    });
  }

  const config = {
    enquiryEndpoint: '/api/enquiries',
    contactEndpoint: '/api/contact'
  };

  document.querySelectorAll('[data-form-endpoint]').forEach(function (button) {
    button.addEventListener('click', function () {
      const endpoint = this.getAttribute('data-form-endpoint');
      console.info('Future form endpoint configured for', endpoint, config);
    });
  });
});
