export function renderResume(lang, translations) {
  const section = document.createElement('section');
  section.className = 'section container reveal';
  section.id = 'resume';
  section.style.maxWidth = '800px';

  const h2 = document.createElement('h2');
  h2.textContent = translations[lang].resume.title;
  h2.className = 'rainbow-border-left';
  h2.style.marginBottom = '32px';

  const content = document.createElement('div');
  content.style.lineHeight = '1.8';
  content.style.fontSize = '1.1rem';
  content.style.color = 'var(--text-secondary)';

  // Left Column: Experience & Education
  const leftCol = document.createElement('div');
  leftCol.className = 'resume-col';

  // Experience
  const expSection = document.createElement('div');
  expSection.innerHTML = `<h3>${translations[lang].resume.experienceTitle}</h3>`;

  translations[lang].resume.experiences.forEach(job => {
    const item = document.createElement('div');
    item.className = 'resume-item';
    item.innerHTML = `
      <h4>${job.role}</h4>
      <span class="company">${job.company} | ${job.period}</span>
      <p>${job.description}</p>
    `;
    expSection.appendChild(item);
  });

  // Education
  const eduSection = document.createElement('div');
  eduSection.style.marginTop = '40px';
  eduSection.innerHTML = `<h3>${translations[lang].resume.educationTitle}</h3>`;

  translations[lang].resume.education.forEach(edu => {
    const item = document.createElement('div');
    item.className = 'resume-item';
    item.innerHTML = `
      <h4>${edu.degree}</h4>
      <span class="company">${edu.school} | ${edu.period}</span>
    `;
    eduSection.appendChild(item);
  });

  leftCol.appendChild(expSection);
  leftCol.appendChild(eduSection);

  // Right Column: Skills
  const rightCol = document.createElement('div');
  rightCol.className = 'resume-col';

  const skillsConfig = [
    { category: translations[lang].resume.skillCategories.languages, items: ['Python (Pandas, Polars)', 'SQL (T-SQL, SparkSQL)', 'DAX', 'VBA'] },
    { category: translations[lang].resume.skillCategories.tools, items: ['Power BI', 'Databricks', 'Streamlit', 'AWS Glue', 'Excel Advanced'] },
    { category: translations[lang].resume.skillCategories.cloud, items: ['Azure', 'AWS', 'Oracle', 'PostgreSQL'] }
  ];

  rightCol.innerHTML = `<h3>${translations[lang].resume.skillsTitle}</h3>`;

  skillsConfig.forEach(skillSet => {
    const group = document.createElement('div');
    group.className = 'skill-group';
    group.innerHTML = `
      <h4>${skillSet.category}</h4>
      <div class="tags">
        ${skillSet.items.map(skill => `<span class="tag">${skill}</span>`).join('')}
      </div>
    `;
    rightCol.appendChild(group);
  });

  // Download Button
  const btnContainer = document.createElement('div');
  btnContainer.style.marginTop = '40px';
  btnContainer.innerHTML = `<a href="#" class="btn-primary">${translations[lang].resume.downloadResume}</a>`;
  rightCol.appendChild(btnContainer);

  const grid = document.createElement('div');
  grid.className = 'resume-grid';
  grid.appendChild(leftCol);
  grid.appendChild(rightCol);

  content.innerHTML = ''; // Clear previous content container usage or repurpose it
  // Actually, the structure in the file is h2 then content div with innerHTML.
  // I should append grid to content instead or replacing content.innerHTML.

  // Let's replace the whole content.innerHTML assignment and instead build the structure.
  // The original code sets content.innerHTML to a big string.
  // I will replace that block with the logic that builds 'grid' and appends it.

  content.appendChild(grid);

  section.appendChild(h2);
  section.appendChild(content);

  return section;
}
