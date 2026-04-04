async function loadPartial(targetId, filePath) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
    const html = await response.text();
    target.innerHTML = html;

    if (targetId === 'site-navbar') {
      initMobileNav();
      setActiveNavLink();
    }
  } catch (error) {
    console.error(error);
  }
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

function initPhoneValidation() {
  const phoneFields = document.querySelectorAll('input[type="tel"]');

  phoneFields.forEach((field) => {
    field.addEventListener('input', () => {
      field.value = field.value.replace(/[^0-9+()\\-\\s]/g, '');
    });
  });
}

function initForms() {
  const forms = document.querySelectorAll('.quote-form');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const phoneInput = form.querySelector('input[type="tel"]');

      if (phoneInput) {
        const digitsOnly = phoneInput.value.replace(/\\D/g, '');
        if (/([0-9])\\1\\1\\1/.test(digitsOnly)) {
          event.preventDefault();
          alert('Please enter a valid phone number without too many repeated digits.');
          phoneInput.focus();
          return;
        }
      }

      event.preventDefault();
      alert("Thank you. We've received your enquiry and will be in touch soon.");
      form.reset();
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartial('site-navbar', 'components/navbar.html');
  await loadPartial('site-footer', 'components/footer.html');
  initPhoneValidation();
  initForms();
});