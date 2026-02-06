// Lightweight client-side search over a small index.
(async function(){
  const input = document.querySelector('#searchInput');
  const resultsEl = document.querySelector('#results');
  if(!input || !resultsEl) return;

  const res = await fetch('js/index.json');
  const idx = await res.json();

  function esc(s){ return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function render(items){
    resultsEl.innerHTML = items.slice(0, 12).map(it => {
      return `
        <div class="result">
          <a href="${esc(it.href)}"><strong>${esc(it.title)}</strong></a>
          <div class="small">${esc(it.city)} · ${esc(it.type)}</div>
          <div>${esc(it.snippet)}</div>
        </div>
      `;
    }).join('') || `<div class="result"><div class="small">没有匹配结果。试试输入：教堂 / 运河 / 文艺复兴 / 斗兽场 …</div></div>`;
  }

  function search(q){
    q = q.trim().toLowerCase();
    if(!q){ render(idx.featured); return; }
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored = idx.items.map(it => {
      const hay = (it.title + ' ' + it.city + ' ' + it.type + ' ' + it.snippet + ' ' + it.keywords.join(' ')).toLowerCase();
      let score = 0;
      for(const t of tokens){
        if(hay.includes(t)) score += 3;
      }
      return {it, score};
    }).filter(x => x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.it);
    render(scored);
  }

  input.addEventListener('input', () => search(input.value));
  render(idx.featured);
})();
