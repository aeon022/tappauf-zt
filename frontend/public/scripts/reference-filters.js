(() => {
  const setupReferenceFilters = () => {
    const root = document.querySelector('[data-reference-filter-root]');
    if (!root || root.dataset.filterBound === 'true') return;

    const chips = Array.from(root.querySelectorAll('[data-reference-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-reference-card]'));
    const countNode = document.querySelector('[data-reference-filter-count]');
    const labelNode = document.querySelector('[data-reference-filter-label]');
    const searchInput = root.querySelector('[data-reference-search-input]');

    if (!chips.length || !cards.length) {
      root.dataset.filterBound = 'true';
      return;
    }

    let activeFilter = 'alle';
    let activeLabel = 'Alle';
    let searchTerm = '';

    const normalize = (value) => (value || '').trim().toLowerCase();
    const getLabelByValue = (value) =>
      chips.find((chip) => chip.dataset.referenceFilter === value)?.querySelector('span')?.textContent || 'Alle';

    const matchesSearch = (card, value) => {
      if (!value) return true;
      const haystack = card.dataset.search || '';
      return value.split(/\s+/).filter(Boolean).every((token) => haystack.includes(token));
    };

    const syncUrl = () => {
      const url = new URL(window.location.href);
      if (activeFilter && activeFilter !== 'alle') {
        url.searchParams.set('category', activeFilter);
      } else {
        url.searchParams.delete('category');
      }

      if (searchTerm) {
        url.searchParams.set('q', searchTerm);
      } else {
        url.searchParams.delete('q');
      }

      window.history.replaceState({}, '', url);
    };

    const applyFilter = (value, label, nextSearch = searchTerm) => {
      activeFilter = value;
      activeLabel = label;
      searchTerm = normalize(nextSearch);
      let visible = 0;

      cards.forEach((card) => {
        const matches = (value === 'alle' || card.dataset.category === value) && matchesSearch(card, searchTerm);
        card.toggleAttribute('hidden', !matches);
        card.classList.toggle('reference-card--hidden', !matches);
        if (matches) visible += 1;
      });

      chips.forEach((chip) => {
        const active = chip.dataset.referenceFilter === value;
        chip.classList.toggle('reference-filter-chip--active', active);
        chip.classList.toggle('border-slate-900', active);
        chip.classList.toggle('bg-slate-900', active);
        chip.classList.toggle('text-white', active);
        chip.classList.toggle('border-slate-200', !active);
        chip.classList.toggle('bg-white', !active);
        chip.classList.toggle('text-slate-700', !active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (countNode) countNode.textContent = String(visible);
      if (labelNode) labelNode.textContent = label;
      if (searchInput && searchInput.value !== searchTerm) searchInput.value = searchTerm;
      syncUrl();
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        applyFilter(chip.dataset.referenceFilter || 'alle', chip.querySelector('span')?.textContent || 'Alle');
      });
    });

    searchInput?.addEventListener('input', () => {
      applyFilter(activeFilter, activeLabel, searchInput.value);
    });

    searchInput?.addEventListener('keydown', (event) => {
      if (event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        window.__tappaufOpenCommandPalette?.();
      }
    });

    const params = new URLSearchParams(window.location.search);
    const initialFilter = chips.some((chip) => chip.dataset.referenceFilter === params.get('category'))
      ? params.get('category')
      : 'alle';
    const initialSearch = params.get('q') || '';
    applyFilter(initialFilter, getLabelByValue(initialFilter), initialSearch);

    root.dataset.filterBound = 'true';
  };

  setupReferenceFilters();
  document.addEventListener('astro:page-load', setupReferenceFilters);
})();
