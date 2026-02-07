export function renderResume(lang, translations) {
  const t = translations[lang].resume;

  const section = document.createElement('section');
  section.className = 'section container reveal';
  section.id = 'resume';
  section.style.maxWidth = '1000px'; // Increased for better layout

  const h2 = document.createElement('h2');
  h2.textContent = t.title;
  h2.style.borderLeft = '4px solid var(--border-color)';
  h2.style.paddingLeft = '16px';
  h2.style.marginBottom = '40px';

  const content = document.createElement('div');
  content.className = 'resume-container';

  // Professional Summary
  const summaryBox = document.createElement('div');
  summaryBox.style.marginBottom = '48px';
  summaryBox.className = 'project-card'; // Reuse card style for consistency
  summaryBox.style.borderLeft = '4px solid var(--border-color)';

  summaryBox.innerHTML = `
    <h3 style="margin-bottom: 16px; display: inline-block; color: var(--text-primary);">${t.summaryTitle}</h3>
    <p style="font-size: 1rem; color: var(--text-primary);">${t.summary}</p>
  `;
  content.appendChild(summaryBox);

  // Grid Layout
  const grid = document.createElement('div');
  grid.className = 'resume-grid';
  // Note: resume-grid in CSS is 2fr 1fr.

  // Left Column: Experience & Education
  const leftCol = document.createElement('div');
  leftCol.className = 'resume-col';

  // Experience
  const expSection = document.createElement('div');
  expSection.innerHTML = `<h3 style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">${t.experienceTitle}</h3>`;

  t.experiences.forEach(job => {
    const item = document.createElement('div');
    item.className = 'resume-item';
    item.innerHTML = `
      <h4>${job.role}</h4>
      <span class="company">${job.company} | ${job.period}</span>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">${job.description}</p>
    `;
    expSection.appendChild(item);
  });

  // Education
  const eduSection = document.createElement('div');
  eduSection.style.marginTop = '48px';
  eduSection.innerHTML = `<h3 style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">${t.educationTitle}</h3>`;

  t.education.forEach(edu => {
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

  // Right Column: Skills, Certifications, Languages
  const rightCol = document.createElement('div');
  rightCol.className = 'resume-col';

  // Skills
  const skillsConfig = t.skillCategories;
  rightCol.innerHTML = `<h3 style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">${t.skillsTitle}</h3>`;

  skillsConfig.forEach(skillSet => {
    const group = document.createElement('div');
    group.className = 'skill-group';
    group.innerHTML = `
      <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 8px;">${skillSet.name}</h4>
      <div class="tags">
        ${skillSet.items.map(skill => `<span class="tag" style="background: rgba(255, 255, 255, 0.03);">${skill}</span>`).join('')}
      </div>
    `;
    rightCol.appendChild(group);
  });

  // Certifications
  const certSection = document.createElement('div');
  certSection.style.marginTop = '40px';
  certSection.innerHTML = `<h3 style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">${t.certificationsTitle}</h3>`;

  const certList = document.createElement('ul');
  certList.style.listStyle = 'none';
  certList.style.padding = '0';

  t.certifications.forEach(cert => {
    const li = document.createElement('li');
    li.style.marginBottom = '12px';
    li.style.fontSize = '0.9rem';
    li.style.color = 'var(--text-secondary)';
    li.style.display = 'flex';
    li.style.alignItems = 'start';

    // Custom bullet
    li.innerHTML = `
      <span class="rainbow-text" style="margin-right: 10px; line-height: 1.6;">▹</span>
      <span style="line-height: 1.6;">${cert}</span>
    `;
    certList.appendChild(li);
  });
  certSection.appendChild(certList);
  rightCol.appendChild(certSection);

  // Languages
  const langSection = document.createElement('div');
  langSection.style.marginTop = '40px';
  langSection.innerHTML = `<h3 style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">${t.languagesTitle}</h3>`;

  const langList = document.createElement('ul');
  langList.style.listStyle = 'none';
  langList.style.padding = '0';

  t.languages.forEach(lang => {
    const parts = lang.split('|');
    const name = parts[0].trim();
    const level = parts[1] ? parts[1].trim() : '';

    const li = document.createElement('li');
    li.style.marginBottom = '12px';
    li.style.fontSize = '0.9rem';
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.borderBottom = '1px dashed var(--border-color)';
    li.style.paddingBottom = '4px';

    li.innerHTML = `
      <span style="color: var(--text-primary); font-weight: 500;">${name}</span>
      <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary);">${level}</span>
    `;
    langList.appendChild(li);
  });
  langSection.appendChild(langList);
  rightCol.appendChild(langSection);

  // Download Button
  const btnContainer = document.createElement('div');
  btnContainer.style.marginTop = '48px';
  btnContainer.innerHTML = `
    <a href="cv_pedro_augusto_ribeiro_en-us.txt" download class="btn-primary" 
       style="display: inline-block; padding: 12px 24px; border: 2px solid var(--text-primary); border-radius: 4px; font-weight: bold; text-align: center; width: 100%; transition: all 0.3s ease; text-decoration: none; color: var(--text-primary); font-family: var(--font-mono);">
      ${t.downloadResume}
    </a>
  `;

  const btn = btnContainer.querySelector('a');
  btn.addEventListener('mouseenter', (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
  });
  btn.addEventListener('mouseleave', (e) => {
    e.target.style.background = 'transparent';
  });

  rightCol.appendChild(btnContainer);

  grid.appendChild(leftCol);
  grid.appendChild(rightCol);

  content.appendChild(grid);
  section.appendChild(h2);
  section.appendChild(content);

  return section;
}
