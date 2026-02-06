export function renderHero(lang, translations) {
  const section = document.createElement('section');
  section.className = 'section container reveal';
  section.id = 'hero';
  section.style.textAlign = 'center';
  section.style.height = '100vh';
  section.style.display = 'flex';
  section.style.flexDirection = 'column';
  section.style.justifyContent = 'center';
  section.style.alignItems = 'center';

  const content = document.createElement('div');
  content.className = 'stagger-reveal';

  const h1 = document.createElement('h1');
  h1.innerHTML = `${translations[lang].hero.titlePre} <span class="rainbow-text">${translations[lang].hero.titleHighlight}</span>`;
  h1.style.fontSize = 'clamp(2rem, 6vw, 3.5rem)';
  h1.style.lineHeight = '1.1';
  h1.style.marginBottom = '24px';

  const p = document.createElement('p');
  p.innerHTML = translations[lang].hero.description;
  p.style.fontSize = '1.2rem';
  p.style.color = 'var(--text-secondary)';
  p.style.maxWidth = '700px';
  p.style.margin = '0 auto 40px auto';

  const ctaContainer = document.createElement('div');
  ctaContainer.style.display = 'flex';
  ctaContainer.style.gap = '20px';
  ctaContainer.style.justifyContent = 'center';

  const cta = document.createElement('a');
  cta.href = '#highlights';
  cta.textContent = translations[lang].hero.ctaWork;
  cta.className = 'btn-rainbow';

  const ctaPlayground = document.createElement('a');
  ctaPlayground.href = '#playground';
  ctaPlayground.textContent = translations[lang].hero.ctaPlayground;
  ctaPlayground.className = 'btn-rainbow';
  ctaPlayground.style.filter = 'hue-rotate(45deg)'; // Alternate color slightly

  ctaContainer.appendChild(cta);
  ctaContainer.appendChild(ctaPlayground);

  // Contact Content embedded in Hero
  const contactContainer = document.createElement('div');
  contactContainer.id = 'contact';
  contactContainer.style.marginTop = 'auto'; // Push to bottom
  contactContainer.style.paddingBottom = '40px';
  contactContainer.style.width = '100%';

  const contactTitle = document.createElement('p');
  contactTitle.textContent = translations[lang].hero.contactTitle;
  contactTitle.style.fontSize = '1.1rem';
  contactTitle.style.fontWeight = 'bold';
  contactTitle.style.marginBottom = '16px';
  contactTitle.style.color = 'var(--text-primary)';

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.justifyContent = 'center';
  btnContainer.style.gap = '20px';
  btnContainer.style.flexWrap = 'wrap';

  const contacts = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/pedro-augusto-ribeiro',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>'
    },
    {
      label: 'GitHub',
      href: 'https://github.com/ribeiroaugustopedro',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>'
    },
    {
      label: 'Email',
      href: 'mailto:ribeiroaugustopedro@gmail.com',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
    }
  ];

  contacts.forEach(contact => {
    const btn = document.createElement('a');
    btn.href = contact.href;
    btn.target = '_blank';
    btn.className = 'rainbow-border';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.gap = '12px';
    btn.style.padding = '10px 20px';
    btn.style.color = 'var(--text-primary)';
    btn.style.textDecoration = 'none';
    btn.style.borderRadius = '4px';
    btn.style.fontSize = '0.9rem';
    btn.style.transition = 'all 0.3s ease';
    btn.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; // Slight background for visibility

    btn.innerHTML = `${contact.icon} <span>${contact.label}</span>`;

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(100, 255, 218, 0.1)';
      btn.style.transform = 'translateY(-2px)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255, 255, 255, 0.03)';
      btn.style.transform = 'translateY(0)';
    });

    btnContainer.appendChild(btn);
  });

  contactContainer.appendChild(contactTitle);
  contactContainer.appendChild(btnContainer);

  content.appendChild(h1);
  content.appendChild(p);
  content.appendChild(ctaContainer);

  // Create spacer to push content to center, then contact to bottom
  const spacerTop = document.createElement('div');
  spacerTop.style.flex = '1';
  section.appendChild(spacerTop); // Push central content down

  section.appendChild(content);

  const spacerBottom = document.createElement('div');
  spacerBottom.style.flex = '1';
  section.appendChild(spacerBottom); // Push contact down

  section.appendChild(contactContainer);

  return section;
}
