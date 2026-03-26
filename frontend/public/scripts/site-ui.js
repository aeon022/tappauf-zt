(() => {
  const THEME_STORAGE_KEY = 'tappauf-theme';
  const CONTRAST_STORAGE_KEY = 'tappauf-contrast';
  const MOTION_STORAGE_KEY = 'tappauf-motion';
  const COOKIE_CONSENT_STORAGE_KEY = 'tappauf-cookie-consent';
  const THEME_MODES = ['light', 'dark', 'system'];

  const serializedCommandIndex =
    document.getElementById('global-command-index')?.textContent ?? '[]';
  const GLOBAL_COMMAND_INDEX = JSON.parse(serializedCommandIndex);

  const getPreferredTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const getStoredThemeMode = () => {
    try {
      const value = localStorage.getItem(THEME_STORAGE_KEY);
      return THEME_MODES.includes(value) ? value : null;
    } catch {
      return null;
    }
  };

  const persistThemeMode = (mode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  };

  const readCookieConsent = () => {
    try {
      const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeCookieConsent = (consent) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
    } catch {}
  };

  const syncExternalEmbeds = (consent = readCookieConsent()) => {
    const externalAllowed = consent?.external === true;

    document.querySelectorAll('[data-external-content]').forEach((container) => {
      const iframe = container.querySelector('[data-external-iframe]');
      const placeholder = container.querySelector('[data-external-placeholder]');
      const src = iframe?.dataset.src;

      if (!iframe || !placeholder || !src) return;

      if (externalAllowed) {
        if (iframe.getAttribute('src') !== src) {
          iframe.setAttribute('src', src);
        }
        iframe.hidden = false;
        placeholder.hidden = true;
      } else {
        iframe.hidden = true;
        placeholder.hidden = false;
        iframe.removeAttribute('src');
      }
    });
  };

  const applyCookieConsent = () => {
    const notice = document.querySelector('[data-cookie-notice]');
    const consent = readCookieConsent();

    if (notice) {
      notice.hidden = Boolean(consent);
    }

    syncExternalEmbeds(consent);
  };

  const resolveTheme = (mode) => (mode === 'system' ? getPreferredTheme() : mode);

  const getThemeModeLabel = (mode) => {
    if (mode === 'light') return 'Hell';
    if (mode === 'dark') return 'Dunkel';
    return 'System';
  };

  const getNextThemeMode = (mode) => {
    const index = THEME_MODES.indexOf(mode);
    return THEME_MODES[(index + 1 + THEME_MODES.length) % THEME_MODES.length];
  };

  const setThemeMeta = (theme) => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#020617' : '#f8fafc');
    }
  };

  const applyThemeMode = (mode) => {
    const root = document.documentElement;
    const resolvedTheme = resolveTheme(mode);
    root.dataset.theme = resolvedTheme;
    root.dataset.themeMode = mode;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    setThemeMeta(resolvedTheme);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = button.querySelector('.theme-toggle__label');
      if (label) label.textContent = getThemeModeLabel(mode);
      button.setAttribute('aria-pressed', resolvedTheme === 'dark' ? 'true' : 'false');
      button.setAttribute('title', `Farbschema wechseln (${getThemeModeLabel(mode)})`);
    });
  };

  const applyAccessibilityPreferences = () => {
    const root = document.documentElement;
    let contrast = null;
    let motion = null;

    try {
      contrast = localStorage.getItem(CONTRAST_STORAGE_KEY);
      motion = localStorage.getItem(MOTION_STORAGE_KEY);
    } catch {}

    root.classList.toggle('high-contrast', contrast === 'high');
    root.classList.toggle('easy-access', contrast === 'high');
    root.classList.toggle('reduced-motion', motion === 'reduce');

    const contrastLabel = document.querySelector('[data-site-command-contrast-label]');
    const motionLabel = document.querySelector('[data-site-command-motion-label]');
    const themeLabel = document.querySelector('[data-site-command-theme-label]');

    if (contrastLabel) {
      contrastLabel.textContent = contrast === 'high' ? 'Aktiv' : 'Aktivieren';
    }

    if (motionLabel) {
      motionLabel.textContent = motion === 'reduce' ? 'Einschalten' : 'Ausschalten';
    }

    if (themeLabel) {
      themeLabel.textContent = getThemeModeLabel(root.dataset.themeMode || 'system');
    }
  };

  const changeThemeMode = (nextMode) => {
    persistThemeMode(nextMode);
    applyThemeMode(nextMode);
  };

  const setupThemeToggle = () => {
    const root = document.documentElement;
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    applyThemeMode(getStoredThemeMode() || root.dataset.themeMode || 'system');

    buttons.forEach((button) => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';

      button.addEventListener('click', () => {
        const nextMode = getNextThemeMode(root.dataset.themeMode || 'system');
        changeThemeMode(nextMode);
        applyAccessibilityPreferences();
      });
    });

    if (!window.__tappaufThemeMediaBound) {
      media.addEventListener('change', () => {
        const currentMode = document.documentElement.dataset.themeMode || getStoredThemeMode() || 'system';
        if (currentMode !== 'system') return;
        applyThemeMode('system');
        applyAccessibilityPreferences();
      });
      window.__tappaufThemeMediaBound = true;
    }
  };

  const setupMobileMenu = () => {
    const root = document.documentElement;
    const menu = document.querySelector('[data-mobile-menu]');
    if (!menu || menu.dataset.menuBound === 'true') return;

    const openButtons = document.querySelectorAll('[data-mobile-menu-open]');
    const closeButtons = document.querySelectorAll('[data-mobile-menu-close]');
    const links = document.querySelectorAll('[data-mobile-menu-link]');

    const syncButtons = (expanded) => {
      openButtons.forEach((button) => button.setAttribute('aria-expanded', expanded ? 'true' : 'false'));
    };

    const openMenu = () => {
      menu.hidden = false;
      menu.setAttribute('aria-hidden', 'false');
      root.classList.add('mobile-menu-open');
      syncButtons(true);
    };

    const closeMenu = () => {
      menu.setAttribute('aria-hidden', 'true');
      root.classList.remove('mobile-menu-open');
      syncButtons(false);
      window.setTimeout(() => {
        if (menu.getAttribute('aria-hidden') === 'true') {
          menu.hidden = true;
        }
      }, 260);
    };

    openButtons.forEach((button) => {
      button.addEventListener('click', openMenu);
    });

    closeButtons.forEach((button) => {
      button.addEventListener('click', closeMenu);
    });

    links.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-hidden') === 'false') {
        closeMenu();
      }
    });

    document.addEventListener('astro:before-swap', closeMenu);
    menu.dataset.menuBound = 'true';
  };

  const setupReveal = () => {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('reveal-enhanced');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index % 6 * 70}ms`);
      observer.observe(item);
    });
  };

  const setupCookieNotice = () => {
    const notice = document.querySelector('[data-cookie-notice]');
    const rejectButtons = document.querySelectorAll('[data-cookie-reject-external]');
    const acceptNecessaryButtons = document.querySelectorAll('[data-cookie-accept-necessary]');
    const acceptExternalButtons = document.querySelectorAll('[data-cookie-accept-external]');
    const enableExternalButtons = document.querySelectorAll('[data-cookie-enable-external]');

    const saveConsent = (external, choice = external ? 'external' : 'necessary') => {
      writeCookieConsent({
        necessary: true,
        external,
        choice,
        updatedAt: new Date().toISOString(),
      });
      if (notice) {
        notice.hidden = true;
      }
      syncExternalEmbeds(readCookieConsent());
    };

    rejectButtons.forEach((button) => {
      if (button.dataset.cookieBound === 'true') return;
      button.dataset.cookieBound = 'true';
      button.addEventListener('click', () => saveConsent(false, 'rejected'));
    });

    acceptNecessaryButtons.forEach((button) => {
      if (button.dataset.cookieBound === 'true') return;
      button.dataset.cookieBound = 'true';
      button.addEventListener('click', () => saveConsent(false, 'necessary'));
    });

    acceptExternalButtons.forEach((button) => {
      if (button.dataset.cookieBound === 'true') return;
      button.dataset.cookieBound = 'true';
      button.addEventListener('click', () => saveConsent(true, 'external'));
    });

    enableExternalButtons.forEach((button) => {
      if (button.dataset.cookieBound === 'true') return;
      button.dataset.cookieBound = 'true';
      button.addEventListener('click', () => saveConsent(true, 'external'));
    });

    applyCookieConsent();
  };

  const setupGlobalCommandPalette = () => {
    const dialog = document.querySelector('[data-site-command-dialog]');
    const openButtons = document.querySelectorAll('[data-site-command-open]');
    const closeButton = document.querySelector('[data-site-command-close]');
    const input = document.querySelector('[data-site-command-input]');
    const resultsNode = document.querySelector('[data-site-command-results]');
    const emptyNode = document.querySelector('[data-site-command-empty]');
    const themeButton = document.querySelector('[data-site-command-theme]');
    const contrastButton = document.querySelector('[data-site-command-contrast]');
    const motionButton = document.querySelector('[data-site-command-motion]');

    if (!dialog || !input || !resultsNode || !emptyNode) return;

    let activeIndex = 0;
    const normalize = (value) => (value || '').trim().toLowerCase();

    const renderResults = (value) => {
      const query = normalize(value);
      const tokens = query.split(/\s+/).filter(Boolean);

      if (!tokens.length) {
        resultsNode.innerHTML = '';
        resultsNode.hidden = true;
        emptyNode.hidden = true;
        activeIndex = 0;
        return [];
      }

      const results = GLOBAL_COMMAND_INDEX.filter((entry) => {
        return tokens.every((token) =>
          entry.search.includes(token) ||
          entry.title.toLowerCase().includes(token) ||
          entry.type.toLowerCase().includes(token) ||
          entry.section.toLowerCase().includes(token)
        );
      }).sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aPageBonus = a.type === 'Seite' ? 30 : 0;
        const bPageBonus = b.type === 'Seite' ? 30 : 0;
        const aExact = tokens.some((token) => aTitle === token || aTitle.startsWith(token)) ? 20 : 0;
        const bExact = tokens.some((token) => bTitle === token || bTitle.startsWith(token)) ? 20 : 0;
        const aTitleHits = tokens.filter((token) => aTitle.includes(token)).length;
        const bTitleHits = tokens.filter((token) => bTitle.includes(token)).length;
        const aScore = aPageBonus + aExact + aTitleHits;
        const bScore = bPageBonus + bExact + bTitleHits;
        return bScore - aScore;
      }).slice(0, 10);

      if (!results.length) {
        resultsNode.innerHTML = '';
        resultsNode.hidden = true;
        emptyNode.hidden = false;
        return results;
      }

      resultsNode.innerHTML = results.map((entry, index) => `
        <button
          type="button"
          class="reference-command-result${index === activeIndex ? ' reference-command-result--active' : ''}"
          data-site-command-result
          data-site-command-href="${entry.href}"
        >
          <span class="reference-command-result__title">${entry.title}</span>
          <span class="reference-command-result__meta">${[entry.type, entry.section, entry.description].filter(Boolean).join(' · ')}</span>
        </button>
      `).join('');
      resultsNode.hidden = false;
      emptyNode.hidden = true;
      return results;
    };

    const openDialog = () => {
      dialog.hidden = false;
      dialog.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('reference-command-open');
      activeIndex = 0;
      input.value = '';
      resultsNode.innerHTML = '';
      resultsNode.hidden = true;
      emptyNode.hidden = true;
      applyAccessibilityPreferences();
      input.focus();
    };

    window.__tappaufOpenCommandPalette = openDialog;

    const closeDialog = () => {
      dialog.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('reference-command-open');
      window.setTimeout(() => {
        if (dialog.getAttribute('aria-hidden') === 'true') {
          dialog.hidden = true;
        }
      }, 220);
    };

    openButtons.forEach((button) => {
      if (button.dataset.commandBound === 'true') return;
      button.dataset.commandBound = 'true';
      button.addEventListener('click', openDialog);
    });

    if (closeButton && closeButton.dataset.commandBound !== 'true') {
      closeButton.dataset.commandBound = 'true';
      closeButton.addEventListener('click', closeDialog);
    }

    if (dialog.dataset.commandBound !== 'true') {
      dialog.dataset.commandBound = 'true';
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog();
      });
    }

    if (resultsNode.dataset.commandBound !== 'true') {
      resultsNode.dataset.commandBound = 'true';
      resultsNode.addEventListener('click', (event) => {
        const target = event.target.closest('[data-site-command-result]');
        if (!target) return;
        const href = target.dataset.siteCommandHref;
        closeDialog();
        if (href) window.location.href = href;
      });
    }

    if (input.dataset.commandBound !== 'true') {
      input.dataset.commandBound = 'true';
      input.addEventListener('input', () => {
        activeIndex = 0;
        renderResults(input.value);
      });

      input.addEventListener('keydown', (event) => {
        const items = Array.from(resultsNode.querySelectorAll('[data-site-command-result]'));
        if (event.key === 'ArrowDown' && items.length) {
          event.preventDefault();
          activeIndex = (activeIndex + 1) % items.length;
          renderResults(input.value);
        } else if (event.key === 'ArrowUp' && items.length) {
          event.preventDefault();
          activeIndex = (activeIndex - 1 + items.length) % items.length;
          renderResults(input.value);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          items[activeIndex]?.click();
        } else if (event.key === 'Escape') {
          closeDialog();
        }
      });
    }

    if (themeButton && themeButton.dataset.commandBound !== 'true') {
      themeButton.dataset.commandBound = 'true';
      themeButton.addEventListener('click', () => {
        const root = document.documentElement;
        const nextMode = getNextThemeMode(root.dataset.themeMode || 'system');
        changeThemeMode(nextMode);
        window.setTimeout(applyAccessibilityPreferences, 30);
      });
    }

    if (contrastButton && contrastButton.dataset.commandBound !== 'true') {
      contrastButton.dataset.commandBound = 'true';
      contrastButton.addEventListener('click', () => {
        const root = document.documentElement;
        const next = root.classList.contains('high-contrast') ? 'normal' : 'high';
        root.classList.toggle('high-contrast', next === 'high');
        root.classList.toggle('easy-access', next === 'high');
        try {
          localStorage.setItem(CONTRAST_STORAGE_KEY, next === 'high' ? 'high' : 'normal');
        } catch {}
        applyAccessibilityPreferences();
      });
    }

    if (motionButton && motionButton.dataset.commandBound !== 'true') {
      motionButton.dataset.commandBound = 'true';
      motionButton.addEventListener('click', () => {
        const root = document.documentElement;
        const next = root.classList.contains('reduced-motion') ? 'full' : 'reduce';
        root.classList.toggle('reduced-motion', next === 'reduce');
        try {
          localStorage.setItem(MOTION_STORAGE_KEY, next === 'reduce' ? 'reduce' : 'full');
        } catch {}
        applyAccessibilityPreferences();
      });
    }
  };

  const bindGlobalCommandShortcut = () => {
    if (window.__tappaufGlobalCommandHandler) {
      document.removeEventListener('keydown', window.__tappaufGlobalCommandHandler);
    }

    window.__tappaufGlobalCommandHandler = (event) => {
      const dialog = document.querySelector('[data-site-command-dialog]');
      if (!dialog) return;

      if (event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        window.__tappaufOpenCommandPalette?.();
      } else if (event.key === 'Escape' && dialog.getAttribute('aria-hidden') === 'false') {
        document.querySelector('[data-site-command-close]')?.click();
      }
    };

    document.addEventListener('keydown', window.__tappaufGlobalCommandHandler);
  };

  const runSafely = (fn) => {
    try {
      fn();
    } catch (error) {
      console.error('[tappauf-ui]', error);
    }
  };

  const initializeUi = () => {
    runSafely(setupThemeToggle);
    runSafely(applyAccessibilityPreferences);
    runSafely(applyCookieConsent);
    runSafely(setupMobileMenu);
    runSafely(setupCookieNotice);
    runSafely(setupGlobalCommandPalette);
    runSafely(bindGlobalCommandShortcut);

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => runSafely(setupReveal), { timeout: 1200 });
    } else {
      window.setTimeout(() => runSafely(setupReveal), 120);
    }
  };

  initializeUi();
  document.addEventListener('astro:page-load', initializeUi);
})();
