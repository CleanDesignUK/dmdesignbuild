async function loadPartial(targetId, filePath) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}`);
    }

    const html = await response.text();
    target.innerHTML = html;

    if (targetId === "site-navbar") {
      initMobileNav();
      setActiveNavLink();
    }
  } catch (error) {
    console.error(error);
  }
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const wrap = document.querySelector(".nav-wrap");

  if (!toggle || !nav || !wrap) return;

  const closeNav = () => {
    nav.classList.remove("open");
    wrap.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    wrap.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeNav();
    }
  });
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function initPhoneValidation() {
  const phoneFields = document.querySelectorAll('input[type="tel"]');

  phoneFields.forEach((field) => {
    field.addEventListener("input", () => {
      field.value = field.value.replace(/[^0-9+()\-\s]/g, "");
    });
  });
}

function isValidEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return false;
  if (trimmed.length > 254) return false;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(trimmed)) return false;

  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;

  const [localPart, domainPart] = parts;

  if (!localPart || !domainPart) return false;
  if (localPart.length > 64) return false;
  if (domainPart.startsWith(".") || domainPart.endsWith(".")) return false;
  if (domainPart.includes("..")) return false;

  return true;
}

function hasTooManyRepeatedDigits(phoneValue) {
  const digitsOnly = phoneValue.replace(/\D/g, "");
  return /(\d)\1\1\1/.test(digitsOnly);
}

function isLikelySpamText(value) {
  const trimmed = value.trim().toLowerCase();

  const junkPatterns = [
    /^test+$/,
    /^asdf+$/,
    /^qwer+$/,
    /^1234+$/,
    /^aaaa+$/,
    /^xxx+$/,
    /^n\/?a$/,
    /^none$/
  ];

  return junkPatterns.some((pattern) => pattern.test(trimmed));
}

function showFieldError(field, message) {
  alert(message);
  field.focus();
}

function initForms() {
  const forms = document.querySelectorAll(".quote-form");

  forms.forEach((form) => {
    form.dataset.loadedAt = String(Date.now());

    form.addEventListener("submit", (event) => {
      const now = Date.now();
      const loadedAt = Number(form.dataset.loadedAt || now);
      const timeTaken = now - loadedAt;

      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[type="email"]');
      const phoneInput = form.querySelector('input[type="tel"]');
      const areaInput = form.querySelector('input[name="area"]');
      const serviceInput = form.querySelector('select[name="service"]');

      const honeypot =
        form.querySelector('input[name="website"]') ||
        form.querySelector('input[name="company"]') ||
        form.querySelector('input[data-honeypot="true"]');

      if (honeypot && honeypot.value.trim() !== "") {
        event.preventDefault();
        return;
      }

      if (timeTaken < 2500) {
        event.preventDefault();
        alert("Please take a moment to complete the form properly.");
        return;
      }

      if (nameInput) {
        const nameValue = nameInput.value.trim();
        if (nameValue.length < 2 || isLikelySpamText(nameValue)) {
          event.preventDefault();
          showFieldError(nameInput, "Please enter your full name.");
          return;
        }
      }

      if (emailInput) {
        const emailValue = emailInput.value.trim();
        if (!isValidEmail(emailValue)) {
          event.preventDefault();
          showFieldError(emailInput, "Please enter a valid email address.");
          return;
        }
      }

      if (phoneInput) {
        const phoneValue = phoneInput.value.trim();
        const digitsOnly = phoneValue.replace(/\D/g, "");

        if (digitsOnly.length < 10) {
          event.preventDefault();
          showFieldError(phoneInput, "Please enter a valid phone number.");
          return;
        }

        if (hasTooManyRepeatedDigits(phoneValue)) {
          event.preventDefault();
          showFieldError(phoneInput, "Please enter a valid phone number without too many repeated digits.");
          return;
        }
      }

      if (areaInput) {
        const areaValue = areaInput.value.trim();
        if (areaValue.length < 2 || isLikelySpamText(areaValue)) {
          event.preventDefault();
          showFieldError(areaInput, "Please enter your area.");
          return;
        }
      }

      if (serviceInput) {
        const serviceValue = serviceInput.value.trim();
        if (!serviceValue) {
          event.preventDefault();
          showFieldError(serviceInput, "Please choose a service.");
          return;
        }
      }

      event.preventDefault();
      alert("Thank you. We've received your enquiry and will be in touch soon.");
      form.reset();
      form.dataset.loadedAt = String(Date.now());
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("site-navbar", "components/navbar.html");
  await loadPartial("site-footer", "components/footer.html");

  initPhoneValidation();
  initForms();
});