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

        if(title) {
          title.textContent = e.title || '';
          if(e.honors){
            const honorsSpan = document.createElement('span');
            honorsSpan.className = 'exp-honors';
            honorsSpan.textContent = '\u00A0*' + e.honors + '*';
            title.appendChild(honorsSpan);
          }
        }
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

        // Render skill tags if present, under location
        if (Array.isArray(e.skills) && e.skills.length) {
          const skillsDiv = document.createElement('div');
          skillsDiv.className = 'exp-skills';
          e.skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag skill-tag-small';
            tag.textContent = skill;
            skillsDiv.appendChild(tag);
          });
          // Insert skillsDiv after location
          if (location && location.parentNode) {
            location.parentNode.insertBefore(skillsDiv, location.nextSibling);
          } else {
            articleEl.insertBefore(skillsDiv, articleEl.firstChild);
          }
        }

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
        // If this item has partner universities, render each as an indented, expandable article
        if(Array.isArray(e.partners) && e.partners.length){
          // insert a divider so spacing above the first partner matches other entries
          const hrBeforePartners = document.createElement('hr');
          hrBeforePartners.className = 'divider short';
          container.appendChild(hrBeforePartners);
          e.partners.forEach((p, pi) => {
            const pNode = tpl.content.cloneNode(true);
            const pTitle = pNode.querySelector('.exp-title');
            const pSubtitle = pNode.querySelector('.exp-subtitle');
            const pLocation = pNode.querySelector('.exp-location');
            const pYear = pNode.querySelector('.exp-year');
            const pDetailInner = pNode.querySelector('.exp-detail-inner');

            if(pTitle) {
              pTitle.textContent = p.name || p.title || '';
              if(p.honors){
                const pHon = document.createElement('span');
                pHon.className = 'exp-honors';
                pHon.textContent = '\u00A0*' + p.honors + '*';
                pTitle.appendChild(pHon);
              }
            }
            if(pSubtitle) pSubtitle.textContent = p.position ?? p.subtitle ?? '';
            if(pLocation) {
              if(p.location){
                pLocation.textContent = p.location;
                pLocation.style.display = '';
              } else {
                pLocation.style.display = 'none';
              }
            }
            if(pYear) pYear.textContent = p.year || '';
            if(pDetailInner) pDetailInner.textContent = p.description ?? '';

            // append partner article and mark it for styling
            container.appendChild(pNode);
            const pArticle = container.lastElementChild;
            pArticle.classList.add('exp-partner');

            const pArrow = pArticle.querySelector('.exp-arrow');
            const pDetail = pArticle.querySelector('.exp-detail');

            if(!p.description || !String(p.description).trim()){
              if(pArrow){
                pArrow.classList.add('disabled');
                pArrow.setAttribute('aria-hidden','true');
                pArrow.style.pointerEvents = 'none';
              }
            } else {
              if(pArrow) pArrow.classList.remove('disabled');
              const prow = pArticle.querySelector('.exp-row');
              const ptoggle = () => {
                const isOpen = pArticle.classList.toggle('open');
                if(isOpen){
                  pDetail.style.maxHeight = pDetail.scrollHeight + 'px';
                  pArrow.classList.add('open');
                  pDetail.setAttribute('aria-hidden','false');
                } else {
                  pDetail.style.maxHeight = '0px';
                  pArrow.classList.remove('open');
                  pDetail.setAttribute('aria-hidden','true');
                }
              };
              if(prow) prow.addEventListener('click', (ev) => { ptoggle(); });
              if(pArrow) pArrow.addEventListener('click', (ev) => { ev.stopPropagation(); ptoggle(); });
            }

            // add divider between partners
            if(pi !== e.partners.length - 1){
              const phr = document.createElement('hr');
              phr.className = 'divider short';
              container.appendChild(phr);
            }
          });
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
    if(Array.isArray(data.education)) renderList(data.education, 'education-list');
  }catch(err){
    // don't break page rendering for users; log for dev
    console.error('loadExperience error:', err);
  }
})();
