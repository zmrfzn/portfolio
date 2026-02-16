// --- Theme Toggle ---
const toggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggle.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
}

const saved = localStorage.getItem('theme');
if (saved) setTheme(saved);
else if (window.matchMedia('(prefers-color-scheme: light)').matches) setTheme('light');
else setTheme('dark');

toggle.addEventListener('click', function () {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// --- Mobile Nav Toggle ---
const mobileToggle = document.getElementById('nav-mobile-toggle');
const navLinks = document.getElementById('nav-links');

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

// --- Scroll Fade-In ---
var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-in').forEach(function (el) { fadeObserver.observe(el); });

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        var target = document.querySelector(anchor.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
});

// --- Talk Filtering ---
var activeFilter = 'all';
var activeTopic = null;
var filterContainer = document.getElementById('speaking-filters');
var speakingContent = document.getElementById('speaking-content');
var topicIndicator = document.getElementById('topic-filter-indicator');
var topicLabelEl = document.getElementById('topic-filter-label');
var topicClearBtn = document.getElementById('topic-clear-btn');

function applyFilter() {
    speakingContent.querySelectorAll('.talk-card').forEach(function (card) {
        var tags = (card.dataset.tags || '').split(',');
        var topics = (card.dataset.topics || '').split(',').filter(Boolean);

        if (activeFilter === 'all') {
            card.style.display = '';
        } else if (tags.indexOf(activeFilter) >= 0 || topics.indexOf(activeFilter) >= 0) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });

    speakingContent.querySelectorAll('.year-group').forEach(function (group) {
        var content = group.querySelector('.year-content');
        var visibleCards = content.querySelectorAll('.talk-card:not([style*="display: none"])');
        var countSpan = group.querySelector('.year-count');

        if (visibleCards.length === 0) {
            group.style.display = 'none';
        } else {
            group.style.display = '';
            countSpan.textContent = visibleCards.length + ' talk' + (visibleCards.length > 1 ? 's' : '');
        }
    });
}

// Filter button clicks
filterContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        filterContainer.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        activeTopic = null;
        topicIndicator.style.display = 'none';
        applyFilter();
    });
});

// Topic card clicks
var topicLabels = {
    opentelemetry: 'OpenTelemetry', aws: 'AWS & Cloud Services',
    adot: 'ADOT (AWS Distro for OTel)', kubernetes: 'Kubernetes & Cloud-Native',
    observability: 'Full-Stack Observability', 'ai-llm': 'AI / LLM Monitoring',
    security: 'SecurityOps & Observability'
};

document.querySelectorAll('.topic-card[data-topic]').forEach(function (card) {
    function handleClick() {
        var topic = card.dataset.topic;
        activeFilter = topic;
        activeTopic = topic;
        filterContainer.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        topicLabelEl.textContent = topicLabels[topic] || topic;
        topicIndicator.style.display = '';
        applyFilter();
        document.getElementById('speaking').scrollIntoView({ behavior: 'smooth' });
    }

    card.addEventListener('click', handleClick);
    card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
    });
});

// Topic clear button
topicClearBtn.addEventListener('click', function () {
    activeTopic = null;
    activeFilter = 'all';
    topicIndicator.style.display = 'none';
    var allBtn = filterContainer.querySelector('[data-filter="all"]');
    if (allBtn) allBtn.classList.add('active');
    applyFilter();
});

// --- Year Group Toggles ---
speakingContent.querySelectorAll('.year-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var group = btn.parentElement;
        var content = group.querySelector('.year-content');
        var chevron = btn.querySelector('.year-chevron');
        var isOpen = group.classList.contains('open');

        if (isOpen) {
            content.style.display = 'none';
            group.classList.remove('open');
            chevron.innerHTML = '\u25BC';
            btn.setAttribute('aria-expanded', 'false');
        } else {
            content.style.display = '';
            group.classList.add('open');
            chevron.innerHTML = '\u25B2';
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

// --- YouTube View Counts ---
function formatCount(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
}

(function loadYTStats() {
    var viewSpans = document.querySelectorAll('[data-video-id]');
    if (viewSpans.length === 0) return;

    function renderStats(viewCounts) {
        var totalViews = 0;
        viewSpans.forEach(function (span) {
            var id = span.dataset.videoId;
            if (viewCounts[id]) {
                // Ensure raw number for addition, string for display
                var count = typeof viewCounts[id] === 'string' ? parseInt(viewCounts[id].replace(/,/g, ''), 10) : viewCounts[id];
                span.textContent = formatCount(count) + ' views';
                totalViews += count;
            }
        });

        if (totalViews > 0) {
            var banner = document.getElementById('yt-total-banner');
            var totalEl = document.getElementById('yt-total-count');
            if (totalEl) totalEl.textContent = formatCount(totalViews) + '+';
            if (banner) banner.style.display = '';
        }
    }

    // 1. Try Cloudflare Worker (Single efficient request)
    // NOTE: Replace with your actual Worker URL after deployment
    var WORKER_URL = 'https://yt-stats.zmrfzn.workers.dev';

    fetch(WORKER_URL)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
            if (data && Object.keys(data).length > 0) {
                renderStats(data);
            } else {
                throw new Error('No data from worker');
            }
        })
        .catch(function () {
            // 2. Fallback: Individual requests to public API
            console.log('Fetching from fallback API...');
            var videoIds = Array.from(viewSpans).map(function (el) { return el.dataset.videoId; });
            Promise.allSettled(
                videoIds.map(function (id) {
                    return fetch('https://returnyoutubedislikeapi.com/votes?videoId=' + id)
                        .then(function (r) { return r.json(); })
                        .then(function (data) { return { id: id, views: data && data.viewCount }; });
                })
            ).then(function (results) {
                var viewCounts = {};
                results.forEach(function (r) {
                    if (r.status === 'fulfilled' && r.value.views) {
                        viewCounts[r.value.id] = r.value.views;
                    }
                });
                renderStats(viewCounts);
            });
        });
})();
