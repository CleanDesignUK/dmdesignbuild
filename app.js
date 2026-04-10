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
  const wrap = document.querySelector('.nav-wrap');
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

  if (!toggle || !nav || !wrap) return;
  if (toggle.dataset.navBound === 'true') return;

  const closeDropdowns = () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove('open');
    });

    dropdownToggles.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const closeNav = () => {
    nav.classList.remove('open');
    wrap.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    closeDropdowns();
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    wrap.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));

    if (!isOpen) {
      closeDropdowns();
    }
  });

  nav.querySelectorAll('.nav-link').forEach((link) => {
    if (!link.classList.contains('nav-dropdown-toggle')) {
      link.addEventListener('click', closeNav);
    }
  });

  nav.querySelectorAll('.nav-dropdown-link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  dropdownToggles.forEach((button) => {
    button.addEventListener('click', (event) => {
      const dropdown = button.closest('.nav-dropdown');
      if (!dropdown) return;

      const isMobile = window.innerWidth <= 980;

      if (isMobile) {
        event.preventDefault();
        const isOpen = dropdown.classList.contains('open');

        closeDropdowns();

        if (!isOpen) {
          dropdown.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-dropdown')) {
      closeDropdowns();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      nav.classList.remove('open');
      wrap.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      closeDropdowns();
    }
  });

  toggle.dataset.navBound = 'true';
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  const dropdownLinks = document.querySelectorAll('.nav-dropdown-link');
  const servicesToggle = document.querySelector('.nav-dropdown-toggle');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  let servicePageMatched = false;

  dropdownLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
      servicePageMatched = true;
    } else {
      link.classList.remove('active');
    }
  });

  if (servicesToggle) {
    if (servicePageMatched || currentPage === 'services.html') {
      servicesToggle.classList.add('active');
    } else {
      servicesToggle.classList.remove('active');
    }
  }
}

function initPhoneValidation() {
  const phoneFields = document.querySelectorAll('input[type="tel"]');

  phoneFields.forEach((field) => {
    if (field.dataset.phoneBound === 'true') return;

    field.addEventListener('input', () => {
      field.value = field.value.replace(/[^0-9+()\-\s]/g, '');
    });

    field.dataset.phoneBound = 'true';
  });
}

function isValidEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return false;
  if (trimmed.length > 254) return false;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(trimmed)) return false;

  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domainPart] = parts;

  if (!localPart || !domainPart) return false;
  if (localPart.length > 64) return false;
  if (domainPart.startsWith('.')) return false;
  if (domainPart.endsWith('.')) return false;
  if (domainPart.includes('..')) return false;

  return true;
}

function hasTooManyRepeatedDigits(phoneValue) {
  const digitsOnly = phoneValue.replace(/\D/g, '');
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
  const forms = document.querySelectorAll('.quote-form');

  forms.forEach((form) => {
    if (form.dataset.formBound === 'true') return;

    form.dataset.loadedAt = String(Date.now());

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const now = Date.now();
      const loadedAt = Number(form.dataset.loadedAt || now);
      const timeTaken = now - loadedAt;

      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[type="email"]');
      const phoneInput = form.querySelector('input[type="tel"]');
      const areaInput = form.querySelector('input[name="area"]');
      const serviceInput = form.querySelector('select[name="service"]');
      const submitButton = form.querySelector('button[type="submit"]');

      const honeypot = form.querySelector('input[name="botcheck"]');

      if (honeypot && honeypot.checked) {
        return;
      }

      if (timeTaken < 2500) {
        Swal.fire({
          icon: 'warning',
          title: 'Please try again',
          text: 'Please take a moment to complete the form properly.'
        });
        return;
      }

      if (nameInput) {
        const nameValue = nameInput.value.trim();
        if (nameValue.length < 2 || isLikelySpamText(nameValue)) {
          showSweetAlertError(nameInput, 'Please enter your full name.');
          return;
        }
      }

      if (emailInput) {
        const emailValue = emailInput.value.trim();
        if (!isValidEmail(emailValue)) {
          showSweetAlertError(emailInput, 'Please enter a valid email address.');
          return;
        }
      }

      if (phoneInput) {
        const phoneValue = phoneInput.value.trim();
        const digitsOnly = phoneValue.replace(/\D/g, '');

        if (digitsOnly.length < 10) {
          showSweetAlertError(phoneInput, 'Please enter a valid phone number.');
          return;
        }

        if (hasTooManyRepeatedDigits(phoneValue)) {
          showSweetAlertError(phoneInput, 'Please enter a valid phone number.');
          return;
        }
      }

      if (areaInput) {
        const areaValue = areaInput.value.trim();
        if (areaValue.length < 2 || isLikelySpamText(areaValue)) {
          showSweetAlertError(areaInput, 'Please enter your area.');
          return;
        }
      }

      if (serviceInput) {
        const serviceValue = serviceInput.value.trim();
        if (!serviceValue) {
          showSweetAlertError(serviceInput, 'Please choose a service.');
          return;
        }
      }

      const formData = new FormData(form);

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Thank you!',
            text: 'Our team will be in touch with you soon.',
            confirmButtonText: 'Close'
          });

          form.reset();
          form.dataset.loadedAt = String(Date.now());
        } else {
          throw new Error(result.message || 'Something went wrong.');
        }
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: 'error',
          title: 'Submission failed',
          text: 'Something went wrong while sending your enquiry. Please try again.'
        });
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.originalText || 'Submit';
        }
      }
    });

    form.dataset.formBound = 'true';
  });
}

function initGalleryLightbox() {
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card, .lightbox-trigger'));
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('galleryLightboxImage');
  const lightboxTitle = document.getElementById('galleryLightboxTitle');
  const lightboxMeta = document.getElementById('galleryLightboxMeta');
  const closeBtn = document.getElementById('galleryClose') || document.querySelector('.gallery-lightbox-close');
  const prevBtn = document.getElementById('galleryPrev') || document.querySelector('.gallery-lightbox-prev');
  const nextBtn = document.getElementById('galleryNext') || document.querySelector('.gallery-lightbox-next');

  if (!galleryCards.length || !lightbox || !lightboxImage) return;
  if (lightbox.dataset.lightboxBound === 'true') return;

  let currentIndex = 0;
  let startX = 0;

  const getCardData = (card) => {
    const imageEl = card.querySelector('img');
    const titleEl = card.querySelector('.gallery-caption h3');
    const metaEl = card.querySelector('.gallery-caption p');

    const title = card.dataset.title || titleEl?.textContent.trim() || 'Project image';
    const category = card.dataset.category || '';
    const location = card.dataset.location || '';
    const description = card.dataset.description || '';
    const fallbackMeta = metaEl?.textContent.trim() || '';

    let metaParts = [category, location].filter(Boolean);
    let metaText = metaParts.join(' • ');

    if (description) {
      metaText = metaText ? `${metaText} • ${description}` : description;
    }

    if (!metaText) {
      metaText = fallbackMeta;
    }

    return {
      src: card.dataset.image || imageEl?.getAttribute('src') || '',
      alt: imageEl?.getAttribute('alt') || title,
      title,
      meta: metaText
    };
  };

  const updateLightbox = (index) => {
    const data = getCardData(galleryCards[index]);
    lightboxImage.src = data.src;
    lightboxImage.alt = data.alt;
    if (lightboxTitle) lightboxTitle.textContent = data.title;
    if (lightboxMeta) lightboxMeta.textContent = data.meta;
  };

  const openLightbox = (index) => {
    currentIndex = index;
    updateLightbox(currentIndex);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gallery-lightbox-open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gallery-lightbox-open');
    document.body.style.overflow = '';
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
    card.addEventListener('click', () => openLightbox(index));
  });

  closeBtn?.addEventListener('click', closeLightbox);
  nextBtn?.addEventListener('click', showNext);
  prevBtn?.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') showNext();
    if (event.key === 'ArrowLeft') showPrev();
  });

  lightbox.addEventListener(
    'touchstart',
    (event) => {
      startX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    'touchend',
    (event) => {
      const endX = event.changedTouches[0].clientX;
      const distance = endX - startX;

      if (Math.abs(distance) < 40) return;
      if (distance < 0) showNext();
      if (distance > 0) showPrev();
    },
    { passive: true }
  );

  lightbox.dataset.lightboxBound = 'true';
}

function initServicePageMobileSliders() {
  const sliderButtons = document.querySelectorAll('[data-slider-target]');

  sliderButtons.forEach((button) => {
    if (button.dataset.sliderBound === 'true') return;

    const targetId = button.getAttribute('data-slider-target');
    const track = document.getElementById(targetId);
    if (!track) return;

    const moveSlider = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const firstCard = track.firstElementChild;
      const trackStyles = window.getComputedStyle(track);
      const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '14') || 14;

      const scrollAmount = firstCard
        ? firstCard.getBoundingClientRect().width + gap
        : track.clientWidth;

      const direction = button.classList.contains('mobile-card-prev') ? -1 : 1;

      track.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
      });
    };

    button.addEventListener('click', moveSlider, { passive: false });
    button.dataset.sliderBound = 'true';
  });
}

function initExtensionFloatingForm() {
  const layout = document.getElementById('extensionStickyLayout');
  const sidebar = document.getElementById('extensionStickySidebar');
  const card = document.getElementById('extensionStickyCard');

  if (!layout || !sidebar || !card) return;

  const updateFloatingForm = () => {
    if (window.innerWidth <= 1180) {
      card.classList.remove('is-fixed', 'is-bottom');
      card.style.width = '';
      return;
    }

    const layoutRect = layout.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    const cardHeight = card.offsetHeight;
    const topOffset = 110;
    const stopPoint = layoutRect.bottom - cardHeight - topOffset;

    card.classList.remove('is-fixed', 'is-bottom');
    card.style.width = '';

    if (layoutRect.top > topOffset) {
      return;
    }

    if (stopPoint <= 0) {
      card.classList.add('is-bottom');
      return;
    }

    card.classList.add('is-fixed');
    card.style.width = `${sidebarRect.width}px`;
  };

  if (layout.dataset.stickyBound !== 'true') {
    window.addEventListener('scroll', updateFloatingForm, { passive: true });
    window.addEventListener('resize', updateFloatingForm);
    layout.dataset.stickyBound = 'true';
  }

  updateFloatingForm();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartial('site-navbar', 'components/navbar.html');
  await loadPartial('site-footer', 'components/footer.html');

  initPhoneValidation();
  initForms();
  initGalleryLightbox();
  initServicePageMobileSliders();
  initExtensionFloatingForm();
});

function showSweetAlertError(field, message) {
  Swal.fire({
    icon: 'error',
    title: 'Please check the form',
    text: message
  }).then(() => {
    field.focus();
  });
}