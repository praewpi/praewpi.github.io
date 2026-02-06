// js/skills.js
// Fetches data/skills.json and renders skill categories + tags into #skills-grid
(async function loadSkills() {
  try {
    const res = await fetch('data/skills.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load skills.json');
    const data = await res.json();

    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    data.categories.forEach(function (cat) {
      // Row wrapper
      const row = document.createElement('div');
      row.className = 'skills-row';

      // Category heading
      const heading = document.createElement('h3');
      heading.className = 'skills-category';
      heading.textContent = cat.name;
      row.appendChild(heading);

      // Tags container
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'skills-tags';

      cat.items.forEach(function (skill) {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        tagsDiv.appendChild(tag);
      });

      row.appendChild(tagsDiv);
      grid.appendChild(row);
    });
  } catch (err) {
    console.error('skills.js:', err);
  }
})();
