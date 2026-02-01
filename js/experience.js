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
        const location = node.querySelector('.exp-location');
        const year = node.querySelector('.exp-year');
        const detailInner = node.querySelector('.exp-detail-inner');

        if(title) title.textContent = e.title || '';
        //`position` for work items, `subtitle` for other sections
        const subtitleText = e.position ?? e.subtitle ?? '';
        if(subtitle) subtitle.textContent = subtitleText;
        if(location) {
          if (e.location) {
            location.textContent = e.location;
            location.style.display = '';
          } else {
            location.style.display = 'none';
          }
        }
        if(year) year.textContent = e.year || '';
        if(detailInner) detailInner.textContent = e.description ?? '';

        // append to DOM first so we can measure heights and attach listeners
        container.appendChild(node);
        const articleEl = container.lastElementChild;
        const arrow = articleEl.querySelector('.exp-arrow');
        const detail = articleEl.querySelector('.exp-detail');

        // If there's no description, make arrow lighter and disable interaction
        if(!e.description || !String(e.description).trim()){
          if(arrow) {
            arrow.classList.add('disabled');
            arrow.setAttribute('aria-hidden','true');
            arrow.style.pointerEvents = 'none';
          }
        } else {
          if(arrow) arrow.classList.remove('disabled');
          const row = articleEl.querySelector('.exp-row');
          const toggle = () => {
            const isOpen = articleEl.classList.toggle('open');
            if(isOpen){
              // set max-height to content height for a smooth transition
              detail.style.maxHeight = detail.scrollHeight + 'px';
              arrow.classList.add('open');
              detail.setAttribute('aria-hidden','false');
            } else {
              detail.style.maxHeight = '0px';
              arrow.classList.remove('open');
              detail.setAttribute('aria-hidden','true');
            }
          };
          if(row) row.addEventListener('click', (ev)=> { toggle(); });
          if(arrow) arrow.addEventListener('click', (ev)=> { ev.stopPropagation(); toggle(); });
        }

        if(i !== items.length - 1){
          const hr = document.createElement('hr');
          hr.className = 'divider short';
          container.appendChild(hr);
        }
      });
    };

    if(Array.isArray(data.workExperience)) renderList(data.workExperience, 'experience-list');
    if(Array.isArray(data.extracurricularActivities)) renderList(data.extracurricularActivities, 'extracurricular-list');
    if(Array.isArray(data.achievementsAwards)) renderList(data.achievementsAwards, 'achievements-list');
  }catch(err){
    // don't break page rendering for users; log for dev
    console.error('loadExperience error:', err);
  }
})();
