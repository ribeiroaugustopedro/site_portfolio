export function renderNavbar(lang, translations) {
  const nav = document.createElement('nav');
  nav.style.position = 'fixed';
  nav.style.top = '0';
  nav.style.width = '100%';
  nav.style.padding = '20px 40px';
  nav.style.display = 'flex';
  nav.style.justifyContent = 'space-between';
  nav.style.alignItems = 'center';
  nav.style.zIndex = '100';
  nav.style.backgroundColor = 'var(--nav-bg)';
  nav.style.backdropFilter = 'blur(10px)';

  const leftContainer = document.createElement('div');
  leftContainer.style.display = 'flex';
  leftContainer.style.alignItems = 'center';
  leftContainer.style.gap = '20px';

  const logo = document.createElement('div');
  logo.textContent = 'PEDRO AUGUSTO RIBEIRO';
  logo.style.fontFamily = 'var(--font-mono)';
  logo.style.fontWeight = 'bold';
  logo.style.fontSize = '1.2rem';
  leftContainer.appendChild(logo);

  // Theme Toggle Button
  const themeToggle = document.createElement('button');
  themeToggle.id = 'theme-toggle';
  themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  themeToggle.style.color = 'var(--text-primary)';
  themeToggle.style.padding = '8px';
  themeToggle.style.borderRadius = '50%';
  themeToggle.style.transition = 'background 0.3s ease';
  themeToggle.title = 'Toggle Light/Dark Mode';

  themeToggle.addEventListener('mouseenter', () => {
    themeToggle.style.background = 'linear-gradient(90deg, rgba(255, 0, 0, 0.1), rgba(0, 255, 0, 0.1), rgba(0, 0, 255, 0.1))';
    themeToggle.style.backgroundSize = '200% 200%';
    themeToggle.style.animation = 'rainbowSlide 2s linear infinite';
  });
  themeToggle.addEventListener('mouseleave', () => {
    themeToggle.style.background = 'transparent';
  });

  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'; // Sun for Dark
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'; // Moon for Light
    }
  });

  leftContainer.appendChild(themeToggle);

  // Language Toggle Button
  const langToggle = document.createElement('button');
  const currentLang = localStorage.getItem('lang') || 'pt';
  langToggle.textContent = currentLang === 'pt' ? 'BR' : 'EN';
  langToggle.style.color = 'var(--text-primary)';
  langToggle.style.padding = '8px 12px';
  langToggle.style.borderRadius = '4px';
  langToggle.style.marginLeft = '10px';
  langToggle.style.border = '1px solid var(--border-color)';
  langToggle.style.backgroundColor = 'transparent';
  langToggle.style.cursor = 'pointer';
  langToggle.style.fontFamily = 'var(--font-mono)';
  langToggle.style.transition = 'all 0.3s ease';
  langToggle.title = 'Switch Language';

  langToggle.addEventListener('mouseenter', () => {
    langToggle.style.borderColor = 'var(--accent-color)';
    langToggle.style.color = 'var(--accent-color)';
  });
  langToggle.addEventListener('mouseleave', () => {
    langToggle.style.borderColor = 'var(--border-color)';
    langToggle.style.color = 'var(--text-primary)';
  });

  langToggle.addEventListener('click', () => {
    const newLang = currentLang === 'pt' ? 'en' : 'pt';
    localStorage.setItem('lang', newLang);
    window.location.reload(); // Simple reload to apply language changes
  });

  leftContainer.appendChild(langToggle);

  nav.appendChild(leftContainer);

  const ul = document.createElement('ul');
  ul.className = 'nav-menu'; // Added class for mobile styles
  ul.style.display = 'flex';
  ul.style.gap = '30px';
  ul.style.listStyle = 'none';

  const links = [
    { name: translations[lang].navbar.work, id: 'highlights' },
    { name: translations[lang].navbar.projects, id: 'projects' },
    { name: translations[lang].navbar.about, id: 'resume' },
    { name: translations[lang].navbar.playground, id: 'playground' },
  ];

  links.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${link.id}`;
    a.textContent = link.name;
    a.style.fontSize = '0.9rem';
    a.style.fontFamily = 'var(--font-mono)';

    // Close menu on link click (for mobile)
    a.addEventListener('click', () => {
      ul.classList.remove('active');
      hamburger.classList.remove('active');
    });

    li.appendChild(a);
    ul.appendChild(li);
  });

  // Hamburger Button for Mobile
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    ul.classList.toggle('active');
  });

  nav.appendChild(ul);
  nav.appendChild(hamburger);

  // Responsive padding adjustment in JS for the nav itself
  const updateNavPadding = () => {
    if (window.innerWidth <= 768) {
      nav.style.padding = '15px 20px';
    } else {
      nav.style.padding = '20px 40px';
    }
  };
  window.addEventListener('resize', updateNavPadding);
  updateNavPadding();

  return nav;
}
