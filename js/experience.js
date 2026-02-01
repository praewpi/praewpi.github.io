// js/experience.js
// Fetches data/experience.json and renders into templates in experience.html
(async function loadExperience(){
  try{
    const res = await fetch('data/experience.json', {cache:'no-cache'});
    if(!res.ok) throw new Error('Failed to load experience.json');
    const data = await res.json();

    const tpl = document.getElementById('exp-tpl');
    const renderList = (items, containerId) => {
      const container = document.getElementById(containerId);
      if(!container || !tpl) return;
      items.forEach((e, i) => {
        const node = tpl.content.cloneNode(true);
        const title = node.querySelector('.exp-title');
        const subtitle = node.querySelector('.exp-subtitle');
        const year = node.querySelector('.exp-year');
        if(title) title.textContent = e.title || '';
        if(subtitle) subtitle.textContent = e.subtitle || '';
        if(year) year.textContent = e.year || '';
        container.appendChild(node);
        if(i !== items.length - 1){
          const hr = document.createElement('hr');
          hr.className = 'divider short';
          container.appendChild(hr);
        }
      });
    };

    if(Array.isArray(data.experience)) renderList(data.experience, 'experience-list');
    if(Array.isArray(data.extracurricular)) renderList(data.extracurricular, 'extracurricular-list');
  }catch(err){
    // don't break page rendering for users; log for dev
    console.error('loadExperience error:', err);
  }
})();
