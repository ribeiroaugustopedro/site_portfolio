import { renderProjectCard } from '../components/projectCard.js';

export function renderProjects(projects, lang, translations) {
  const section = document.createElement('section');
  section.className = 'section container reveal';
  section.id = 'projects';

  const h2 = document.createElement('h2');
  h2.textContent = translations[lang].projects.title;
  h2.style.marginBottom = '40px';
  h2.className = 'rainbow-border-left';

  const grid = document.createElement('div');
  grid.className = 'grid stagger-reveal';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';

  projects.forEach(project => {
    grid.appendChild(renderProjectCard(project, lang, translations));
  });

  section.appendChild(h2);
  section.appendChild(grid);

  // Simple "Load More" button placeholder if needed
  // ...

  return section;
}
