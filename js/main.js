/* ========================================
   Zameer Fouzan - Portfolio JS
   Data-driven talks, filters, collapsible,
   evidence cards, YouTube stats
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
  var topicsGrid = document.getElementById('topics-grid');
  var ytStatsRow = document.getElementById('yt-stats-row');
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

  // Topic display config
  var TOPIC_CONFIG = {
    opentelemetry: { label: 'OpenTelemetry', filterTag: null },
    aws:           { label: 'AWS & Cloud Services', filterTag: null },
    kubernetes:    { label: 'Kubernetes & Cloud-Native', filterTag: null },
    observability: { label: 'Full-Stack Observability', filterTag: null },
    'ai-llm':     { label: 'AI / LLM Monitoring', filterTag: null },
    security:      { label: 'SecurityOps & Observability', filterTag: null }
  };

  // Desired display order for topics
  var TOPIC_ORDER = ['opentelemetry', 'aws', 'kubernetes', 'observability', 'ai-llm', 'security'];

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
        // Support both tag-based and topic-based filtering
        if (talk.tags.indexOf(activeFilter) !== -1) return true;
        if (talk.topics && talk.topics.indexOf(activeFilter) !== -1) return true;
        return false;
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

  // === ENHANCEMENT 1: Evidence Cards ===
  function computeTopicStats() {
    var stats = {};

    TOPIC_ORDER.forEach(function (topic) {
      stats[topic] = {
        count: 0,
        keynotes: 0,
        international: 0,
        workshops: 0,
        minYear: Infinity,
        conferences: {}
      };
    });

    talksData.forEach(function (talk) {
      var topics = talk.topics || [];
      topics.forEach(function (topic) {
        if (!stats[topic]) return;
        stats[topic].count++;
        if (talk.tags.indexOf('keynote') !== -1) stats[topic].keynotes++;
        if (talk.tags.indexOf('international') !== -1) stats[topic].international++;
        if (talk.tags.indexOf('workshop') !== -1) stats[topic].workshops++;
        if (talk.year < stats[topic].minYear) stats[topic].minYear = talk.year;
        stats[topic].conferences[talk.event] = true;
      });
    });

    return stats;
  }

  function renderTopicCards() {
    if (!topicsGrid) return;

    var stats = computeTopicStats();
    var html = '';

    TOPIC_ORDER.forEach(function (topic) {
      var s = stats[topic];
      if (s.count === 0) return;

      var cfg = TOPIC_CONFIG[topic] || { label: topic };
      var confCount = Object.keys(s.conferences).length;

      // Build the 4-stat grid
      var statsHtml = '<div class="topic-evidence">';
      statsHtml += '<div class="topic-stat"><span class="topic-stat-value">' + s.count + '</span><span class="topic-stat-label">Talks</span></div>';
      statsHtml += '<div class="topic-stat"><span class="topic-stat-value">' + confCount + '</span><span class="topic-stat-label">Events</span></div>';

      // Third stat: keynotes or workshops (whichever is higher/more interesting)
      if (s.keynotes > 0) {
        statsHtml += '<div class="topic-stat"><span class="topic-stat-value">' + s.keynotes + '</span><span class="topic-stat-label">Keynotes</span></div>';
      } else if (s.workshops > 0) {
        statsHtml += '<div class="topic-stat"><span class="topic-stat-value">' + s.workshops + '</span><span class="topic-stat-label">Workshops</span></div>';
      } else if (s.international > 0) {
        statsHtml += '<div class="topic-stat"><span class="topic-stat-value">' + s.international + '</span><span class="topic-stat-label">Int\'l</span></div>';
      } else {
        statsHtml += '<div class="topic-stat"><span class="topic-stat-value">&mdash;</span><span class="topic-stat-label">&nbsp;</span></div>';
      }

      // Fourth stat: since year
      var sinceYear = s.minYear === Infinity ? '—' : s.minYear;
      statsHtml += '<div class="topic-stat"><span class="topic-stat-value">' + sinceYear + '</span><span class="topic-stat-label">Since</span></div>';
      statsHtml += '</div>';

      html += '<div class="topic-card" data-topic="' + topic + '" role="button" tabindex="0" title="View ' + cfg.label + ' talks">' +
        '<div class="topic-card-header">' +
          '<div class="topic-name">' + cfg.label + '</div>' +
          '<span class="topic-arrow">&#8599;</span>' +
        '</div>' +
        statsHtml +
      '</div>';
    });

    topicsGrid.innerHTML = html;

    // ENHANCEMENT 4: Clickable Topic Filters — clicking a topic card navigates to speaking section
    topicsGrid.querySelectorAll('.topic-card[data-topic]').forEach(function (card) {
      function handleClick() {
        var topic = card.getAttribute('data-topic');

        // Set the active filter to this topic
        activeFilter = topic;

        // Re-render talks with this topic filter
        renderTalks();

        // Update filter button visual state — reset all, mark 'All' as not active
        if (filterContainer) {
          filterContainer.querySelectorAll('.filter-btn').forEach(function (b) {
            b.classList.remove('active');
          });
          // No matching filter button for topics (they're separate from tags), so leave none active
          // This is intentional — the user can click a tag filter to reset
        }

        // Scroll to speaking section
        var speakingSection = document.getElementById('speaking');
        if (speakingSection) {
          speakingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }

      card.addEventListener('click', handleClick);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      });
    });
  }

  // === ENHANCEMENT 3: YouTube View Counts ===
  function getVideoIdsFromTalks() {
    var videos = [];
    talksData.forEach(function (talk) {
      if (talk.links && talk.links.video) {
        var url = talk.links.video;
        var match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (match) {
          videos.push({
            id: match[1],
            title: talk.title,
            event: talk.event,
            url: url
          });
        }
      }
    });
    return videos;
  }

  function formatViewCount(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  }

  function renderYouTubeStats(videos, viewCounts) {
    if (!ytStatsRow) return;

    var html = '';
    var totalViews = 0;

    videos.forEach(function (video) {
      var views = viewCounts[video.id];
      var viewsText = views !== undefined ? formatViewCount(views) + ' views' : '';
      if (views !== undefined) totalViews += views;

      html += '<a href="' + video.url + '" target="_blank" rel="noopener" class="yt-stat-chip">' +
        '<span class="yt-stat-icon">&#9654;</span>' +
        '<span class="yt-stat-title">' + video.title + '</span>' +
        (viewsText ? '<span class="yt-stat-views">' + viewsText + '</span>' : '') +
      '</a>';
    });

    if (totalViews > 0) {
      html += '<div class="yt-total-banner">' +
        '<span class="yt-stat-icon">&#9654;</span> ' +
        '<span>Total recorded talk views: <strong>' + formatViewCount(totalViews) + '+</strong></span>' +
      '</div>';
    }

    ytStatsRow.innerHTML = html;
  }

  function fetchYouTubeViewCounts(videos) {
    // YouTube Data API v3 — requires an API key for public data
    // For a portfolio site, we use the noembed.com free proxy as a no-key fallback
    var viewCounts = {};
    var pending = videos.length;

    if (pending === 0) {
      renderYouTubeStats(videos, viewCounts);
      return;
    }

    // Try noembed.com (free, no API key needed)
    videos.forEach(function (video) {
      fetch('https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + video.id)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          // noembed doesn't return view counts, but we still render the list
          // For actual view counts, we'll try the YouTube oEmbed as well
          pending--;
          if (pending === 0) {
            // Try YouTube iframe API for view count (returnyoutubedislike proxy)
            fetchViewCountsFallback(videos, viewCounts);
          }
        })
        .catch(function () {
          pending--;
          if (pending === 0) {
            fetchViewCountsFallback(videos, viewCounts);
          }
        });
    });
  }

  function fetchViewCountsFallback(videos, viewCounts) {
    // Use returnyoutubedislikeapi.com which provides view counts without API key
    var pending = videos.length;

    videos.forEach(function (video) {
      fetch('https://returnyoutubedislikeapi.com/votes?videoId=' + video.id)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.viewCount) {
            viewCounts[video.id] = data.viewCount;
          }
        })
        .catch(function () {
          // Silently fail — view counts just won't show
        })
        .finally(function () {
          pending--;
          if (pending === 0) {
            renderYouTubeStats(videos, viewCounts);
          }
        });
    });
  }

  // === Main data load ===
  fetch('data/talks.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      talksData = data;
      renderFilters();
      renderTalks();
      renderTopicCards();

      // Fetch YouTube stats
      var videos = getVideoIdsFromTalks();
      if (videos.length > 0) {
        fetchViewCountsFallback(videos, {});
      } else if (ytStatsRow) {
        ytStatsRow.innerHTML = '';
      }
    })
    .catch(function (err) {
      console.warn('Could not load talks.json:', err);
    });

})();
