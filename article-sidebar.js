(()=>{
 const side=document.querySelector('[data-arp-sidebar]');
 const article=document.querySelector('.article');
 if(!side||!article)return;
 const headings=[...article.querySelectorAll('h2[id]')];
 const ticks=Array.from({length:21},(_,i)=>`<i class="arp-side-tick ${i%2===0?'major':''}" style="top:${i*5}%"></i>`).join('');
 const code=side.getAttribute('data-code')||'ARP / 01';
 side.className='arp-sidebar';
 side.setAttribute('aria-label','Navegação do site e do artigo');
 side.innerHTML=`<div class="arp-side-brand"><a href="index.html" aria-label="Advanced Research Projects — página inicial"><img src="arp-logo-branco-transparente.png" alt="Advanced Research Projects"></a><span class="arp-side-code">${code}</span></div>
 <nav class="arp-side-links" aria-label="Navegação do site"><a href="index.html#hero">Início <span>↗</span></a><a href="index.html#vision">Projeto <span>↗</span></a><a href="index.html#artigos">Artigos <span>↗</span></a></nav>
 <div class="arp-side-progress" aria-label="Progresso de leitura"><div class="arp-side-scale">${ticks}<b class="arp-side-pointer" data-percent="000%"></b></div><div class="arp-side-caption"><span>LEITURA</span><span>INÍCIO</span><span>FIM</span></div></div>
 <div class="arp-side-chapters"><span class="arp-side-label">Índice do artigo</span><div>${headings.map(h=>`<a href="#${encodeURIComponent(h.id)}">${h.textContent.trim()}</a>`).join('')}</div></div>`;
 const pointer=side.querySelector('.arp-side-pointer'),links=[...side.querySelectorAll('.arp-side-chapters a')];
 let pending=false;
 function update(){pending=false;const max=document.documentElement.scrollHeight-innerHeight;const ratio=max>0?Math.max(0,Math.min(1,scrollY/max)):0;pointer.style.top=`${ratio*100}%`;pointer.dataset.percent=`${String(Math.round(ratio*100)).padStart(3,'0')}%`;let active=0;headings.forEach((h,i)=>{if(h.getBoundingClientRect().top<190)active=i});links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
})();
