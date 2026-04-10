(function () {
  const COOKIE_NAME = 'dm_cookie_consent';
  const COOKIE_DAYS = 180;

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i += 1) {
      let c = cookies[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }

    return null;
  }

  function hideBanner(banner) {
    banner.classList.remove('is-visible');
    banner.setAttribute('aria-hidden', 'true');
  }

  function showBanner(banner) {
    banner.classList.add('is-visible');
    banner.setAttribute('aria-hidden', 'false');
  }

  function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;
    if (banner.dataset.cookieBound === 'true') return;

    const acceptBtn = banner.querySelector('[data-cookie-action="accept"]');
    const declineBtn = banner.querySelector('[data-cookie-action="decline"]');
    const closeBtn = banner.querySelector('[data-cookie-action="close"]');

    const existingConsent = getCookie(COOKIE_NAME);

    if (!existingConsent) {
      setTimeout(() => {
        showBanner(banner);
      }, 500);
    }

    acceptBtn?.addEventListener('click', () => {
      setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
      hideBanner(banner);
    });

    declineBtn?.addEventListener('click', () => {
      setCookie(COOKIE_NAME, 'declined', COOKIE_DAYS);
      hideBanner(banner);
    });

    closeBtn?.addEventListener('click', () => {
      setCookie(COOKIE_NAME, 'dismissed', COOKIE_DAYS);
      hideBanner(banner);
    });

    banner.dataset.cookieBound = 'true';
  }

  document.addEventListener('DOMContentLoaded', initCookieBanner);
})();