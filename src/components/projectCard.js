export function renderProjectCard(project, lang, translations) {
  const card = document.createElement('div');
  card.className = 'project-card rainbow-border reveal';

  card.style.padding = '24px';
  card.style.transition = 'all 0.3s ease';
  card.style.cursor = 'pointer';
  card.style.backdropFilter = 'blur(10px)';
  card.style.background = 'var(--surface-color)';
  card.style.border = '1px solid var(--border-color)';
  card.style.borderRadius = '8px';

  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
    if (document.documentElement.getAttribute('data-theme') !== 'light') {
      card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
  });

  // Use a reliable fallback if lang/translations not passed, though they should be.
  const titleText = (project.title && project.title[lang]) ? project.title[lang] : (project.title || 'Untitled');
  const descText = (project.description && project.description[lang]) ? project.description[lang] : (project.description || '');
  const viewText = (translations && translations[lang] && translations[lang].projects) ? translations[lang].projects.viewProject : 'View Project';

  const title = document.createElement('h3');
  title.textContent = titleText;
  title.style.fontSize = '1.2rem';
  title.style.marginBottom = '10px';

  const desc = document.createElement('p');
  desc.textContent = descText;
  desc.style.fontSize = '0.9rem';
  desc.style.color = 'var(--text-secondary)';
  desc.style.marginBottom = '15px';

  const tags = document.createElement('div');
  tags.style.display = 'flex';
  tags.style.flexWrap = 'wrap';
  tags.style.gap = '8px';

  const uniqueTagColors = {
    'Python': '#3776AB',
    'SQL': '#3498DB',
    'Databricks': '#FF3621',
    'Data Modeling': '#E67E22',
    'ETL': '#27AE60',
    'Streamlit': '#FF4B4B',
    'Folium': '#16A085',
    'Geospatial': '#9B59B6',
    'Power BI': '#F1C40F',
    'DAX': '#34495E',
    'Governance': '#E74C3C',
    'NLP': '#8E44AD',
    'Generative AI': '#D35400',
    'Teams Integration': '#4B53BC',
    'Excel': '#1D6F42',
    'Data Analysis': '#2C3E50',
    'AWS Athena': '#FF9900',
    'AWS Glue': '#527FFF',
    'default': '#858585'
  };

  project.tags.forEach(tag => {
    const span = document.createElement('span');
    span.textContent = tag;
    span.style.fontSize = '0.75rem';
    span.style.padding = '4px 8px';
    span.style.borderRadius = '4px';

    const color = uniqueTagColors[tag] || uniqueTagColors.default;

    span.style.border = `1px solid ${color}`;
    span.style.color = color;
    span.style.background = 'var(--surface-color)';
    span.style.fontFamily = 'var(--font-mono)';
    tags.appendChild(span);
  });

  const link = document.createElement('div');
  link.style.marginTop = 'auto'; // Push to bottom if flex column
  // Actually card is not flex column by default in CSS probably, let's checking
  // But we can append it.

  // Reuse existing structure from previous file view:
  // card innerHTML was used.
  // Recreating structure with elements is cleaner but I need to make sure layout is preserved.
  // Previous code used innerHTML.

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(tags);

  // Add loop link
  const linkEl = document.createElement('a');
  linkEl.href = project.link;
  linkEl.className = 'project-link';
  linkEl.innerHTML = `${viewText} &rarr;`;
  linkEl.style.display = 'inline-block';
  linkEl.style.marginTop = '15px';
  linkEl.style.color = 'var(--text-primary)';
  linkEl.style.fontSize = '0.9rem';
  linkEl.style.fontWeight = 'bold';
  linkEl.style.textDecoration = 'none';

  card.appendChild(linkEl);

  return card;
}
