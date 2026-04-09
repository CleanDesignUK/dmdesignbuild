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

document.addEventListener("DOMContentLoaded", function () {
  const cards = Array.from(document.querySelectorAll(".gallery-card"));
  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImage = document.getElementById("galleryLightboxImage");
  const lightboxTitle = document.getElementById("galleryLightboxTitle");
  const lightboxMeta = document.getElementById("galleryLightboxMeta");
  const closeBtn = document.querySelector(".gallery-lightbox-close");
  const prevBtn = document.querySelector(".gallery-lightbox-prev");
  const nextBtn = document.querySelector(".gallery-lightbox-next");

  if (!cards.length || !lightbox || !lightboxImage) return;

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function getCardData(card) {
    const img = card.querySelector("img");
    const title = card.querySelector(".gallery-caption h3");
    const meta = card.querySelector(".gallery-caption p");

    return {
      src: img ? img.getAttribute("src") : "",
      alt: img ? img.getAttribute("alt") : "",
      title: title ? title.textContent.trim() : "",
      meta: meta ? meta.textContent.trim() : ""
    };
  }

  function openLightbox(index) {
    currentIndex = index;
    const data = getCardData(cards[currentIndex]);

    lightboxImage.src = data.src;
    lightboxImage.alt = data.alt;
    lightboxTitle.textContent = data.title;
    lightboxMeta.textContent = data.meta;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % cards.length;
    openLightbox(currentIndex);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    openLightbox(currentIndex);
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => openLightbox(index));
  });

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  lightbox.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", function (e) {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < 40) return;

    if (diff > 0) {
      showNext();
    } else {
      showPrev();
    }
  }, { passive: true });
});

document.addEventListener("DOMContentLoaded", () => {
  const galleryCards = Array.from(
  document.querySelectorAll(".gallery-card, .lightbox-trigger")
);
  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImage = document.getElementById("galleryLightboxImage");
  const lightboxTitle = document.getElementById("galleryLightboxTitle");
  const lightboxMeta = document.getElementById("galleryLightboxMeta");
  const closeBtn = document.getElementById("galleryClose");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");

  if (!galleryCards.length || !lightbox || !lightboxImage) return;

  let currentIndex = 0;
  let startX = 0;
  let endX = 0;

  const updateLightbox = (index) => {
    const card = galleryCards[index];
    const image = card.dataset.image || card.querySelector("img")?.src || "";
    const alt = card.querySelector("img")?.alt || card.dataset.title || "Gallery image";
    const title = card.dataset.title || "Project image";
    const category = card.dataset.category || "";
    const location = card.dataset.location || "";
    const description = card.dataset.description || "";

    lightboxImage.src = image;
    lightboxImage.alt = alt;
    lightboxTitle.textContent = title;

    let metaParts = [category, location].filter(Boolean);
    let metaText = metaParts.join(" • ");
    if (description) {
      metaText = metaText ? `${metaText} • ${description}` : description;
    }
    lightboxMeta.textContent = metaText;
  };

  const openLightbox = (index) => {
    currentIndex = index;
    updateLightbox(currentIndex);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-lightbox-open");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-lightbox-open");
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % galleryCards.length;
    updateLightbox(currentIndex);
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + galleryCards.length) % galleryCards.length;
    updateLightbox(currentIndex);
  };

  galleryCards.forEach((card, index) => {
    card.addEventListener("click", () => openLightbox(index));
  });

  closeBtn?.addEventListener("click", closeLightbox);
  nextBtn?.addEventListener("click", showNext);
  prevBtn?.addEventListener("click", showPrev);

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showNext();
    if (event.key === "ArrowLeft") showPrev();
  });

  lightbox?.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox?.addEventListener("touchend", (event) => {
    endX = event.changedTouches[0].clientX;
    const distance = endX - startX;

    if (Math.abs(distance) < 40) return;
    if (distance < 0) showNext();
    if (distance > 0) showPrev();
  }, { passive: true });
});

document.addEventListener("DOMContentLoaded", () => {
  initTestimonialSlider();
});

function initTestimonialSlider() {
  const track = document.getElementById("testimonialsTrack");
  const prevBtn = document.querySelector(".testimonials-prev");
  const nextBtn = document.querySelector(".testimonials-next");

  if (!track || !prevBtn || !nextBtn) return;
  if (window.innerWidth > 760) return;

  const getScrollAmount = () => {
    const card = track.querySelector(".testimonial-card");
    if (!card) return track.clientWidth;
    const gap = 14;
    return card.getBoundingClientRect().width + gap;
  };

  prevBtn.addEventListener("click", () => {
    track.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth"
    });
  });

  nextBtn.addEventListener("click", () => {
    track.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth"
    });
  });
}