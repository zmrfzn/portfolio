const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'styles', 'global.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Remove borders from toggle
css = css.replace(/(\.theme-toggle\s*\{[^}]*)border:\s*1px\s*solid\s*var\(--border\);\s*([^}]*\})/g, '$1$2');
css = css.replace(/(\.theme-toggle:hover\s*\{[^}]*)border-color:\s*var\(--border-hover\);\s*([^}]*\})/g, '$1background: var(--bg-card-hover);\n$2');

// 2. Remove borders from hero image and badges
css = css.replace(/(\.hero-image img\s*\{[^}]*)border:\s*3px\s*solid\s*var\(--border\);\s*([^}]*\})/g, '$1$2');
css = css.replace(/(\.hero-image img:hover\s*\{[^}]*)border-color:\s*var\(--accent\);\s*([^}]*\})/g, '$1opacity: 0.9;\n$2');
css = css.replace(/(\.hero-badge\s*\{[^}]*)border:\s*1px\s*solid\s*var\(--border\);\s*([^}]*\})/g, '$1$2');

// 3. Update pulsing dot animation to a soft ring
const oldPulse = `@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}`;
const newPulse = `@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}`;
css = css.replace(oldPulse, newPulse);

// 4. Flatten buttons
css = css.replace(/(\.btn\s*\{[^}]*)border:\s*1px\s*solid\s*transparent;\s*([^}]*\})/g, '$1$2');
css = css.replace(/(\.btn-primary:hover\s*\{[^}]*)transform:\s*translateY\(-1px\);\s*box-shadow:\s*0\s*4px\s*12px\s*rgba\(59, 130, 246, 0\.3\);\s*([^}]*\})/g, '$1opacity: 0.9;\n$2');

css = css.replace(/(\.btn-outline\s*\{[^}]*)border-color:\s*var\(--border\);\s*([^}]*\})/g, '$1background: var(--bg-card);\n$2');
css = css.replace(/(\.btn-outline:hover\s*\{[^}]*)border-color:\s*var\(--border-hover\);\s*([^}]*\})/g, '$1opacity: 0.8;\n$2');

// 5. Flatten Stats Grid
css = css.replace(/(\.stat-card\s*\{[^}]*)border:\s*1px\s*solid\s*var\(--border\);\s*([^}]*\})/g, '$1$2');
css = css.replace(/(\.stat-card:hover\s*\{[^}]*)border-color:\s*var\(--border-hover\);\s*([^}]*\})/g, '$1$2');
css = css.replace(/(\.stat-card:hover\s*\{[^}]*)transform:\s*translateY\(-2px\);\s*([^}]*\})/g, '$1opacity: 0.95;\n$2');

// 6. Generic border and translate replacements
css = css.replace(/border:\s*1px\s*solid\s*var\(--border\);/g, '/* border removed */');
css = css.replace(/border-color:\s*var\(--border-hover\);/g, '/* border hover removed */');
css = css.replace(/transform:\s*translateY\(-2px\);/g, '/* translateY removed */');

// 7. Fix box-shadows on hover (e.g. TalkCard hover)
css = css.replace(/box-shadow:\s*0\s*10px\s*40px\s*rgba\(0,\s*0,\s*0,\s*0\.08\);/g, 'opacity: 0.95;');
css = css.replace(/box-shadow:\s*0\s*10px\s*40px\s*rgba\(0,\s*0,\s*0,\s*0\.5\);/g, 'opacity: 0.95;');
css = css.replace(/box-shadow:\s*var\(--shadow-lg\);/g, 'opacity: 0.95;');

// Tweak variables for better contrast without borders
// Dark mode (lines 7-27)
css = css.replace('--bg-card: #18181b;', '--bg-card: #131316;');
css = css.replace('--bg-card-hover: #1f1f23;', '--bg-card-hover: #1a1a1f;');
// Light mode (lines 29-46)
css = css.replace('--bg-card: #ffffff;', '--bg-card: #f9f9fb;');
css = css.replace('--bg-card-hover: #f9f9fb;', '--bg-card-hover: #f1f1f4;');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS updated successfully.');
