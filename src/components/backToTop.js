export function renderBackToTop() {
    const btn = document.createElement('div');
    btn.id = 'back-to-top';
    btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `;

    // Styles
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        backgroundColor: 'var(--surface-color)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        color: 'var(--text-primary)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        opacity: '0',
        visibility: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: '1000'
    });

    btn.classList.add('rainbow-border');
    // Force rainbow visibility if desired or keep it on hover as per global style
    // The user said "add rainbow effect", usually that means it should be visible.
    // In our style.css, .rainbow-border::before has opacity: 0 and becomes 1 on hover.
    // I'll make it always visible for the home button to satisfy "add the effect".
    const style = document.createElement('style');
    style.textContent = `
        #back-to-top.rainbow-border::before {
            opacity: 0.8;
            border-radius: 50%;
        }
        #back-to-top.rainbow-border:hover::before {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Hover Effect
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-5px) scale(1.1)';
        btn.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        btn.style.color = 'var(--accent-color)';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
        btn.style.backgroundColor = 'var(--surface-color)';
        btn.style.color = 'var(--text-primary)';
    });

    // Scroll logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.style.opacity = '1';
            btn.style.visibility = 'visible';
        } else {
            btn.style.opacity = '0';
            btn.style.visibility = 'hidden';
        }
    });

    // Click logic
    btn.onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return btn;
}
