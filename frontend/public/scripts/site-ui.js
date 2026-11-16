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
    const panel = dialog?.querySelector('.reference-command-panel');
    const openButtons = document.querySelectorAll('[data-site-command-open]');
    const closeButton = document.querySelector('[data-site-command-close]');
    const input = document.querySelector('[data-site-command-input]');
    const resultsNode = document.querySelector('[data-site-command-results]');
    const emptyNode = document.querySelector('[data-site-command-empty]');
    const statusNode = document.querySelector('[data-site-command-status]');
    const themeButton = document.querySelector('[data-site-command-theme]');
    const contrastButton = document.querySelector('[data-site-command-contrast]');
    const motionButton = document.querySelector('[data-site-command-motion]');

    if (!dialog || !panel || !input || !resultsNode || !emptyNode) return;

    const RECENT_KEY = 'tappauf-command-recent';
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const normalize = (value) => (value || '').trim().toLowerCase();
    const mailLink = dialog.querySelector('a[href^="mailto:"]');
    const telLink = dialog.querySelector('a[href^="tel:"]');

    // Aktionen sind wie Seiten suchbar: Bedienoptionen und Kontakt ohne die Tastatur zu verlassen.
    const ACTIONS = [
      { id: 'theme', title: 'Darstellung wechseln', type: 'Aktion', section: 'Bedienung', description: 'Hell, Dunkel oder System', search: 'darstellung design theme dunkel hell dark light modus farben', run: () => themeButton?.click(), keepOpen: true },
      { id: 'contrast', title: 'Erleichterte Bedienung ein oder aus', type: 'Aktion', section: 'Bedienung', description: 'Hoher Kontrast, größere Schrift', search: 'erleichterte bedienung kontrast barrierefrei barrierefreiheit lesbarkeit schrift gross groß accessibility', run: () => contrastButton?.click(), keepOpen: true },
      { id: 'motion', title: 'Bewegung reduzieren ein oder aus', type: 'Aktion', section: 'Bedienung', description: 'Animationen abschalten', search: 'bewegung animation animationen reduzieren ruhig motion', run: () => motionButton?.click(), keepOpen: true },
      ...(mailLink ? [{ id: 'mail', title: 'E-Mail schreiben', type: 'Aktion', section: 'Kontakt', description: mailLink.textContent.trim(), search: 'email e-mail mail schreiben kontakt nachricht', href: mailLink.getAttribute('href') }] : []),
      ...(telLink ? [{ id: 'tel', title: 'Anrufen', type: 'Aktion', section: 'Kontakt', description: telLink.textContent.trim(), search: 'anrufen telefon tel kontakt call', href: telLink.getAttribute('href') }] : []),
    ];
    const ALL = [...GLOBAL_COMMAND_INDEX, ...ACTIONS];
    const byKey = (entry) => entry.id || entry.href;

    const readRecent = () => {
      try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
    };
    const writeRecent = (entry) => {
      try {
        const keys = [byKey(entry), ...readRecent().filter((k) => k !== byKey(entry))].slice(0, 5);
        localStorage.setItem(RECENT_KEY, JSON.stringify(keys));
      } catch {}
    };

    let current = [];
    let activeIndex = 0;
    let lastFocus = null;

    const highlight = (text, tokens) => {
      const safe = esc(text);
      if (!tokens.length) return safe;
      const re = new RegExp(`(${tokens.map((t) => esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
      return safe.replace(re, '<mark class="reference-command-mark">$1</mark>');
    };

    const search = (query) => {
      const tokens = normalize(query).split(/\s+/).filter(Boolean);
      const hits = ALL.filter((entry) => tokens.every((token) =>
        (entry.search || '').includes(token) ||
        entry.title.toLowerCase().includes(token) ||
        (entry.type || '').toLowerCase().includes(token) ||
        (entry.section || '').toLowerCase().includes(token)
      ));
      const score = (entry) => {
        const title = entry.title.toLowerCase();
        return (entry.type === 'Seite' ? 30 : 0) + (tokens.some((t) => title === t || title.startsWith(t)) ? 20 : 0) + tokens.filter((t) => title.includes(t)).length;
      };
      return hits.sort((a, b) => score(b) - score(a)).slice(0, 12);
    };

    const quickList = () => {
      const recent = readRecent().map((key) => ALL.find((e) => byKey(e) === key)).filter(Boolean);
      const pages = GLOBAL_COMMAND_INDEX.filter((e) => e.type === 'Seite' && !recent.includes(e));
      return { label: recent.length ? 'Zuletzt geöffnet' : 'Schnellzugriff', entries: [...recent, ...pages, ...ACTIONS.filter((a) => !recent.includes(a))].slice(0, 8) };
    };

    const announce = (message) => { if (statusNode) statusNode.textContent = message; };

    const render = () => {
      const query = input.value;
      const tokens = normalize(query).split(/\s+/).filter(Boolean);
      dialog.classList.toggle('has-query', tokens.length > 0);
      let heading = '';
      if (!tokens.length) {
        const quick = quickList();
        current = quick.entries;
        heading = quick.label;
      } else {
        current = search(query);
      }
      if (activeIndex >= current.length) activeIndex = 0;

      emptyNode.hidden = !(tokens.length && !current.length);
      resultsNode.hidden = !current.length;
      if (!current.length) {
        resultsNode.innerHTML = '';
        input.removeAttribute('aria-activedescendant');
        input.setAttribute('aria-expanded', 'false');
        announce(tokens.length ? 'Keine passenden Einträge gefunden.' : '');
        return;
      }

      let lastType = null;
      resultsNode.innerHTML = (heading ? `<p class="reference-command-group" aria-hidden="true">${esc(heading)}</p>` : '') + current.map((entry, index) => {
        const group = !heading && entry.type !== lastType ? `<p class="reference-command-group" aria-hidden="true">${esc(entry.type)}</p>` : '';
        lastType = entry.type;
        const meta = [entry.type, entry.section, entry.description].filter(Boolean).join(' · ');
        return `${group}<button type="button" role="option" id="command-option-${index}" aria-selected="${index === activeIndex}" tabindex="-1" class="reference-command-result${index === activeIndex ? ' reference-command-result--active' : ''}" data-site-command-result data-index="${index}">
          <span class="reference-command-result__title">${highlight(entry.title, tokens)}</span>
          <span class="reference-command-result__meta">${esc(meta)}</span>
        </button>`;
      }).join('');
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-activedescendant', `command-option-${activeIndex}`);
      announce(tokens.length ? `${current.length} ${current.length === 1 ? 'Treffer' : 'Treffer'}. Mit Pfeiltasten auswählen, Enter öffnet.` : '');
    };

    const setActive = (index) => {
      activeIndex = index;
      resultsNode.querySelectorAll('[role="option"]').forEach((node, i) => {
        const on = i === index;
        node.classList.toggle('reference-command-result--active', on);
        node.setAttribute('aria-selected', String(on));
        if (on) node.scrollIntoView({ block: 'nearest' });
      });
      input.setAttribute('aria-activedescendant', `command-option-${index}`);
    };

    const closeDialog = () => {
      if (dialog.getAttribute('aria-hidden') === 'true') return;
      dialog.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('reference-command-open');
      document.body.style.removeProperty('overflow');
      window.setTimeout(() => {
        if (dialog.getAttribute('aria-hidden') === 'true') dialog.hidden = true;
      }, 220);
      (lastFocus && document.contains(lastFocus) ? lastFocus : document.querySelector('[data-site-command-open]'))?.focus?.();
    };

    const openDialog = () => {
      lastFocus = document.activeElement;
      dialog.hidden = false;
      dialog.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('reference-command-open');
      document.body.style.overflow = 'hidden';
      activeIndex = 0;
      input.value = '';
      render();
      applyAccessibilityPreferences();
      input.focus();
    };
    window.__tappaufOpenCommandPalette = openDialog;

    const choose = (index) => {
      const entry = current[index];
      if (!entry) return;
      writeRecent(entry);
      if (entry.run) {
        entry.run();
        if (entry.keepOpen) { announce(`${entry.title}: erledigt.`); input.focus(); return; }
      }
      closeDialog();
      if (entry.href) window.location.href = entry.href;
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
      dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
      // Fokus bleibt im Dialog; Esc schließt
      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); closeDialog(); return; }
        if (event.key !== 'Tab') return;
        const focusable = [...panel.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), a[href], input')].filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
    }

    if (resultsNode.dataset.commandBound !== 'true') {
      resultsNode.dataset.commandBound = 'true';
      resultsNode.addEventListener('click', (event) => {
        const target = event.target.closest('[data-site-command-result]');
        if (target) choose(Number(target.dataset.index));
      });
      resultsNode.addEventListener('mousemove', (event) => {
        const target = event.target.closest('[data-site-command-result]');
        if (target && Number(target.dataset.index) !== activeIndex) setActive(Number(target.dataset.index));
      });
    }

    if (input.dataset.commandBound !== 'true') {
      input.dataset.commandBound = 'true';
      input.addEventListener('input', () => { activeIndex = 0; render(); });
      input.addEventListener('keydown', (event) => {
        const n = current.length;
        if (event.key === 'ArrowDown' && n) { event.preventDefault(); setActive((activeIndex + 1) % n); }
        else if (event.key === 'ArrowUp' && n) { event.preventDefault(); setActive((activeIndex - 1 + n) % n); }
        else if (event.key === 'Home' && n && !input.value) { event.preventDefault(); setActive(0); }
        else if (event.key === 'End' && n && !input.value) { event.preventDefault(); setActive(n - 1); }
        else if (event.key === 'Enter') { event.preventDefault(); choose(activeIndex); }
      });
    }

    const toggleHandler = (button, getNext) => {
      if (!button || button.dataset.commandBound === 'true') return;
      button.dataset.commandBound = 'true';
      button.addEventListener('click', getNext);
    };
    toggleHandler(themeButton, () => {
      const root = document.documentElement;
      changeThemeMode(getNextThemeMode(root.dataset.themeMode || 'system'));
      window.setTimeout(applyAccessibilityPreferences, 30);
    });
    toggleHandler(contrastButton, () => {
      const root = document.documentElement;
      const next = root.classList.contains('high-contrast') ? 'normal' : 'high';
      root.classList.toggle('high-contrast', next === 'high');
      root.classList.toggle('easy-access', next === 'high');
      try { localStorage.setItem(CONTRAST_STORAGE_KEY, next === 'high' ? 'high' : 'normal'); } catch {}
      applyAccessibilityPreferences();
    });
    toggleHandler(motionButton, () => {
      const root = document.documentElement;
      const next = root.classList.contains('reduced-motion') ? 'full' : 'reduce';
      root.classList.toggle('reduced-motion', next === 'reduce');
      try { localStorage.setItem(MOTION_STORAGE_KEY, next === 'reduce' ? 'reduce' : 'full'); } catch {}
      applyAccessibilityPreferences();
    });
  };

  // «/» oder Strg/⌘ + K öffnet die Suche. «/» zählt nicht, wenn man gerade in ein Feld schreibt.
  const bindGlobalCommandShortcut = () => {
    if (window.__tappaufGlobalCommandHandler) {
      document.removeEventListener('keydown', window.__tappaufGlobalCommandHandler);
    }
    window.__tappaufGlobalCommandHandler = (event) => {
      const dialog = document.querySelector('[data-site-command-dialog]');
      if (!dialog || event.defaultPrevented || event.isComposing) return;
      const open = dialog.getAttribute('aria-hidden') === 'false';
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      const isK = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';
      const isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !typing;
      if ((isK || isSlash) && !open) {
        event.preventDefault();
        window.__tappaufOpenCommandPalette?.();
      } else if (isK && open) {
        event.preventDefault();
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
