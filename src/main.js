import './style.css';
import './ide.css';
import { initBackground } from './three/backgroundScene.js';
import { renderNavbar } from './components/navbar.js';
import { renderHero } from './sections/hero.js';
import { renderHighlights } from './sections/highlights.js';
import { renderProjects } from './sections/projects.js';
import { renderIDE } from './sections/playgroud.js';
import { renderResume } from './sections/resume.js';
// import { renderContact } from './sections/contact.js'; // Removed
import { renderFooter } from './components/footer.js';
import { renderBackToTop } from './components/backToTop.js';
import projectsData from './data/projects.json';
import { translations } from './data/translations.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = document.getElementById('app');
    let lang = localStorage.getItem('lang');
    if (lang !== 'en' && lang !== 'pt') {
      lang = 'pt';
    }

    // Render Navbar
    app.appendChild(renderNavbar(lang, translations));

    // Render Sections
    const main = document.createElement('main');
    main.appendChild(renderHero(lang, translations));
    main.appendChild(renderHighlights(projectsData, lang, translations));
    main.appendChild(renderProjects(projectsData, lang, translations));
    main.appendChild(renderResume(lang, translations));
    main.appendChild(renderIDE());
    // main.appendChild(renderContact()); // Removed, integrated into Hero
    app.appendChild(main);
    app.appendChild(renderFooter(lang, translations));
    app.appendChild(renderBackToTop());

    // Intersection Observer for Reveal Animations
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        } else {
          // Only remove if it's completely out of view to avoid flickering
          // But the user specifically asked for bidirectional
          entry.target.classList.remove('reveal-visible');
        }
      });
    }, observerOptions);

    const elementsToReveal = document.querySelectorAll('.reveal');
    elementsToReveal.forEach(el => observer.observe(el));
  } catch (e) {
    console.error("Critical Error:", e);
    document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace; white-space: pre-wrap; background: #fff;">
      <h1>Application Error</h1>
      <p>${e.toString()}</p>
      <p>${e.stack}</p>
    </div>`;
  }
});
