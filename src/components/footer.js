export function renderFooter(lang, translations) {
    const footer = document.createElement('footer');
    footer.style.padding = '40px 20px';
    footer.style.borderTop = '1px solid var(--border-color)';
    footer.style.backgroundColor = 'var(--bg-color)';
    footer.style.color = 'var(--text-secondary)';
    footer.style.fontSize = '0.9rem';
    footer.style.fontFamily = 'var(--font-mono)';
    footer.className = 'reveal';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'center';
    footer.style.alignItems = 'center';
    footer.style.position = 'relative';

    const leftContainer = document.createElement('div');
    leftContainer.style.display = 'flex';
    leftContainer.style.gap = '20px';
    leftContainer.style.marginBottom = '15px'; // Space below icons on mobile
    
    // Check if we are on wide screens to potentially keep them side-by-side or stacked
    const updateFooterLayout = () => {
        if (window.innerWidth <= 768) {
            footer.style.flexDirection = 'column';
            leftContainer.style.position = 'static';
            leftContainer.style.justifyContent = 'center';
        } else {
            footer.style.flexDirection = 'row';
            leftContainer.style.position = 'absolute';
            leftContainer.style.left = '40px';
            leftContainer.style.marginBottom = '0';
        }
    };
    window.addEventListener('resize', updateFooterLayout);
    updateFooterLayout();

    const socialLinks = [
        {
            name: 'LinkedIn',
            href: 'https://www.linkedin.com/in/pedro-augusto-ribeiro',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>'
        },
        {
            name: 'GitHub',
            href: 'https://github.com/ribeiroaugustopedro',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>'
        },
        {
            name: 'Email',
            href: 'mailto:ribeiroaugustopedro@gmail.com',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
        }
    ];

    socialLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.target = '_blank';
        a.innerHTML = link.icon;
        a.style.color = 'var(--text-secondary)';
        a.style.transition = 'color 0.3s ease, transform 0.3s ease';
        a.style.display = 'flex';
        a.style.alignItems = 'center';
        a.title = link.name;

        a.addEventListener('mouseenter', () => {
            a.style.color = 'var(--accent-color)';
            a.style.transform = 'translateY(-3px)';
        });
        a.addEventListener('mouseleave', () => {
            a.style.color = 'var(--text-secondary)';
            a.style.transform = 'translateY(0)';
        });

        leftContainer.appendChild(a);
    });

    const p = document.createElement('p');
    p.innerHTML = translations[lang].footer.rights;
    p.style.margin = '0';

    footer.appendChild(leftContainer);
    footer.appendChild(p);
    return footer;
}
