/* ========================================
   Zameer Fouzan - Portfolio JS
   Data-driven talks, filters, collapsible
   ======================================== */

(function () {
  // --- Theme Toggle ---
  var toggle = document.getElementById('theme-toggle');
  var html = document.documentElement;

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggle.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
  }

  var saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  } else {
    setTheme('dark');
  }

  toggle.addEventListener('click', function () {
    var current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Mobile Nav Toggle ---
  var mobileToggle = document.getElementById('nav-mobile-toggle');
  var navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      mobileToggle.textContent = navLinks.classList.contains('open') ? '\u2715' : '\u2630';
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        mobileToggle.textContent = '\u2630';
      });
    });
  }

  // --- Scroll Fade-In ---
  var faders = document.querySelectorAll('.fade-in');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  faders.forEach(function (el) { observer.observe(el); });

  // --- Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Load talks from JSON and render ---
  var speakingContainer = document.getElementById('speaking-content');
  var filterContainer = document.getElementById('speaking-filters');
  var activeFilter = 'all';
  var talksData = [];

  // Tag display config
  var TAG_CONFIG = {
    keynote:       { label: 'Keynote',       cls: 'keynote' },
    international: { label: 'International', cls: 'international' },
    workshop:      { label: 'Workshop',      cls: 'workshop' },
    online:        { label: 'Online',        cls: 'online' },
    panel:         { label: 'Panel',         cls: 'online' },
    talk:          { label: 'Talk',          cls: 'talk' }
  };

  // Link icon map
  function linkIcon(type) {
    switch (type) {
      case 'video': return '&#9654; Video';
      case 'slides': return 'Slides &#8599;';
      case 'event': return 'Event &#8599;';
      case 'announcement': return 'Post &#8599;';
      default: return type + ' &#8599;';
    }
  }

  function renderTalkCard(talk) {
    var tagsHtml = talk.tags.map(function (t) {
      var cfg = TAG_CONFIG[t] || { label: t, cls: 'talk' };
      return '<span class="talk-tag ' + cfg.cls + '">' + cfg.label + '</span>';
    }).join('');

    var linksHtml = '';
    if (talk.links) {
      var linkEntries = Object.keys(talk.links);
      if (linkEntries.length > 0) {
        linksHtml = '<div class="talk-links">' +
          linkEntries.map(function (key) {
            return '<a href="' + talk.links[key] + '" target="_blank" rel="noopener" class="talk-link">' + linkIcon(key) + '</a>';
          }).join('') +
          '</div>';
      }
    }

    return '<div class="talk-card" data-tags="' + talk.tags.join(',') + '">' +
      '<div>' +
        '<div class="talk-title">' + talk.title + '</div>' +
        '<div class="talk-event">' + talk.event + ' &bull; ' + talk.date + ' &bull; ' + talk.location + '</div>' +
        '<div class="talk-meta">' + tagsHtml + '</div>' +
      '</div>' +
      linksHtml +
    '</div>';
  }

  function renderTalks() {
    if (!speakingContainer || talksData.length === 0) return;

    // Group by year
    var years = {};
    talksData.forEach(function (talk) {
      if (!years[talk.year]) years[talk.year] = [];
      years[talk.year].push(talk);
    });

    var sortedYears = Object.keys(years).sort(function (a, b) { return b - a; });
    var html = '';

    sortedYears.forEach(function (year, idx) {
      var isOpen = idx < 2; // last 2 years open by default
      var filteredTalks = years[year].filter(function (talk) {
        if (activeFilter === 'all') return true;
        return talk.tags.indexOf(activeFilter) !== -1;
      });

      // Skip year if no talks match filter
      if (filteredTalks.length === 0) return;

      var count = filteredTalks.length;
      html += '<div class="year-group' + (isOpen ? ' open' : '') + '">';
      html += '<button class="year-toggle" aria-expanded="' + isOpen + '">';
      html += '<span class="year-label">' + year + '</span>';
      html += '<span class="year-count">' + count + ' talk' + (count > 1 ? 's' : '') + '</span>';
      html += '<span class="year-chevron">' + (isOpen ? '&#9650;' : '&#9660;') + '</span>';
      html += '</button>';
      html += '<div class="year-content"' + (isOpen ? '' : ' style="display:none"') + '>';

      filteredTalks.forEach(function (talk) {
        html += renderTalkCard(talk);
      });

      html += '</div></div>';
    });

    speakingContainer.innerHTML = html;

    // Bind collapse toggles
    speakingContainer.querySelectorAll('.year-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.parentElement;
        var content = group.querySelector('.year-content');
        var chevron = btn.querySelector('.year-chevron');
        var isOpen = group.classList.contains('open');

        if (isOpen) {
          content.style.display = 'none';
          group.classList.remove('open');
          chevron.innerHTML = '&#9660;';
          btn.setAttribute('aria-expanded', 'false');
        } else {
          content.style.display = '';
          group.classList.add('open');
          chevron.innerHTML = '&#9650;';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function renderFilters() {
    if (!filterContainer) return;

    // Collect unique tags
    var tagCounts = {};
    talksData.forEach(function (talk) {
      talk.tags.forEach(function (t) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    var filterOrder = ['all', 'keynote', 'international', 'workshop', 'talk', 'online', 'panel'];
    var html = '<button class="filter-btn active" data-filter="all">All (' + talksData.length + ')</button>';

    filterOrder.forEach(function (tag) {
      if (tag === 'all' || !tagCounts[tag]) return;
      var cfg = TAG_CONFIG[tag] || { label: tag };
      html += '<button class="filter-btn" data-filter="' + tag + '">' + cfg.label + ' (' + tagCounts[tag] + ')</button>';
    });

    filterContainer.innerHTML = html;

    // Bind filter clicks
    filterContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterContainer.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderTalks();
      });
    });
  }

  // Fetch talks data
  fetch('data/talks.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      talksData = data;
      renderFilters();
      renderTalks();
    })
    .catch(function (err) {
      console.warn('Could not load talks.json:', err);
    });

})();
