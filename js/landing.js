/**
 * Advanced Research Projects // Script da Landing Page
 */

// 1. CARREGAMENTO E BUSCA DO PAINEL DE ARTIGOS
(() => {
  const grid = document.querySelector('#article-grid');
  const tableWrap = document.querySelector('#article-table-wrap');
  const tableBody = document.querySelector('#article-table-body');
  const input = document.querySelector('#article-search');
  const empty = document.querySelector('#article-empty');
  const count = document.querySelector('#article-count');
  const results = document.querySelector('#article-results');
  const sortSelect = document.querySelector('#article-sort');
  const btnTable = document.querySelector('#btn-view-table');
  const btnGrid = document.querySelector('#btn-view-grid');
  const catPills = [...document.querySelectorAll('#category-filters .cat-pill')];

  const ARTICLES_REGISTRY = [
  {
    "id": "ARP-01",
    "code": "ARP.01",
    "title": "Da Matemática ao Objeto Real",
    "subtitle": "Como construir uma mesa biônica orgânica usando código e engenharia computacional",
    "author": "Advanced Research Projects",
    "date": "2026-10-14",
    "dateFormatted": "14 Out 2026",
    "time": "06:36 BRT",
    "timestamp": "2026-10-14T06:36:00-03:00",
    "readTime": "5 min",
    "words": 779,
    "status": "STL Exportado // C# PicoGK",
    "highlight": "Superelipses, SDF e Gyroid TPMS",
    "url": "articles/artigo-da-matematica-ao-objeto-real.html",
    "image": "media/mesa-bionica/mesa-bionica-pontos.png",
    "alt": "Visualização pontilhada de uma mesa orgânica com tampo oval e pernas ramificadas",
    "category": "Engenharia computacional",
    "tags": [
      "design paramétrico",
      "PicoGK",
      "geometria implícita",
      "fabricação aditiva",
      "mesa biônica"
    ]
  },
  {
    "id": "ARP-02",
    "code": "ARP.02",
    "title": "A Forja da Superwood Doméstica",
    "subtitle": "Deslignificação termoquímica e colapso celular para produção em oficina de madeira densificada de até 587 MPa",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:06 BRT",
    "timestamp": "2026-10-30T23:06:00-03:00",
    "readTime": "5 min",
    "words": 836,
    "status": "Ensaio de Resistência // 587 MPa",
    "highlight": "Colapso celular térmico e prensagem a quente",
    "url": "articles/artigo-superwood-celulose-densificada.html",
    "image": "media/superwood/comparativo-tracao-especifica.png",
    "alt": "Gráfico comparativo de resistência à tração específica entre madeira superdensificada caseira, titânio, aço e madeira natural",
    "category": "Ciência dos materiais",
    "tags": [
      "superwood",
      "celulose densificada",
      "biomateriais",
      "deslignificação",
      "química prática",
      "alta resistência"
    ]
  },
  {
    "id": "ARP-03",
    "code": "ARP.03",
    "title": "Biocompostos de Alta Performance",
    "subtitle": "Análise quantitativa de doze sistemas compósitos acoplando curauá, linho e juta a matrizes bio-epóxi e poliuretano de mamona",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:15 BRT",
    "timestamp": "2026-10-30T23:15:00-03:00",
    "readTime": "6 min",
    "words": 764,
    "status": "Diagrama de Ashby // 12 Matrizes",
    "highlight": "Curauá, linho e juta com matriz vegetal",
    "url": "articles/artigo-biocompostos-fibras-eco-resinas.html",
    "image": "media/biocompostos/ashby-resistencia-modulo.png",
    "alt": "Diagrama de Ashby comparativo de resistência específica versus módulo de elasticidade específico de biocompostos",
    "category": "Compósitos sustentáveis",
    "tags": [
      "biocompostos",
      "fibras vegetais",
      "eco-resinas",
      "curauá",
      "linho",
      "matrizes bio-baseadas",
      "NFRP"
    ]
  },
  {
    "id": "ARP-04",
    "code": "ARP.04",
    "title": "Geopolímeros de Solo: Cerâmica a Frio",
    "subtitle": "Ativação alcalina de metacaulim e terra in-situ para síntese de matrizes minerais estruturais com cura em temperatura ambiente",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:22 BRT",
    "timestamp": "2026-10-30T23:22:00-03:00",
    "readTime": "6 min",
    "words": 898,
    "status": "Cura em Ambiente // Sem Forno",
    "highlight": "Ativação alcalina com solo in-situ e metacaulim",
    "url": "articles/artigo-geopolimeros-solo-ceramica-a-frio.html",
    "image": "media/geopolimeros/custo-vs-resistencia-compressao.png",
    "alt": "Gráfico de dispersão entre custo por metro cúbico e resistência à compressão de materiais de solo versus convencionais",
    "category": "Geopolímeros e solo",
    "tags": [
      "geopolímeros",
      "ativação alcalina",
      "metacaulim",
      "solo in-situ",
      "cerâmica a frio",
      "construção sustentável"
    ]
  },
  {
    "id": "ARP-05",
    "code": "ARP.05",
    "title": "Micromecânica da Celulose e Geometry Kernels",
    "subtitle": "Modelagem implícita volumétrica, campos de distância assinado (SDF) e otimização topológica para materiais anisotrópicos",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:29 BRT",
    "timestamp": "2026-10-30T23:29:00-03:00",
    "readTime": "6 min",
    "words": 847,
    "status": "Simulação Volumétrica // PicoGK",
    "highlight": "SDF, TPMS Gyroid e anisotropia elástica",
    "url": "articles/artigo-micromecanica-celulose-geometry-kernels.html",
    "image": "media/geometry-kernels/micromecanica-densificacao.png",
    "alt": "Curva de simulação micromecânica da densificação celular de madeira comparando densidade versus módulo de elasticidade",
    "category": "Engenharia computacional",
    "tags": [
      "geometria implícita",
      "PicoGK",
      "micromecânica",
      "anisotropia",
      "SDF",
      "TPMS",
      "Gyroid"
    ]
  },
  {
    "id": "ARP-06",
    "code": "ARP.06",
    "title": "Biotecnologia de Resíduos e Regeneração do Solo",
    "subtitle": "Análise experimental e modelagem 3D de doze rotas: termoconversão, biomineralização larval, fermentação acelerada e canteiros colinares",
    "author": "Advanced Research Projects",
    "date": "2026-11-10",
    "dateFormatted": "10 Nov 2026",
    "time": "17:41 BRT",
    "timestamp": "2026-11-10T17:41:00-03:00",
    "readTime": "10 min",
    "words": 1550,
    "status": "Simulador 3D Interativo // 12 Rotas",
    "highlight": "Biochar, Hermetia illucens, Hügelkultur e No-Dig",
    "url": "articles/artigo-regeneracao-solo-biotecnologia-residuos.html",
    "image": "media/regeneracao-solo/regeneracao-solo-capa.png",
    "alt": "Matriz Cinética de Biotransformação de Resíduos e Regeneração Edáfica da ARP",
    "category": "Ciência dos solos & Biotecnologia",
    "tags": [
      "biocarvão",
      "biochar",
      "hügelkultur",
      "vermicompostagem",
      "BSFL",
      "biodigestão",
      "lasagna gardening",
      "agroecologia",
      "regeneração do solo",
      "no-dig"
    ]
  },
  {
    "id": "ARP-07",
    "code": "ARP.07",
    "title": "Hiperotimização Bioeconômica e Autossuficiência em Micropropriedades",
    "subtitle": "Modelagem espacial 3D, zootecnia aquapônica em recirculação (RAS), fungicultura funcional e economia circular para micropropriedades urbanas",
    "author": "Advanced Research Projects",
    "date": "2026-11-12",
    "dateFormatted": "12 Nov 2026",
    "time": "14:00 BRT",
    "timestamp": "2026-11-12T14:00:00-03:00",
    "readTime": "14 min",
    "words": 1950,
    "status": "Modelagem 3D // Validação Econômica",
    "highlight": "Aquaponia RAS, Hericium e Bokashi On-Farm",
    "url": "articles/artigo-micropropriedade-urbana-autossuficiencia-bioeconomica.html",
    "image": "media/micropropriedade-urbana/micropropriedade-arquitetura-metabolica.png",
    "alt": "Arquitetura Espacial e Metabólica da Micropropriedade 2.0 em Viamão/RS",
    "category": "Bioeconomia & Agroecologia urbana",
    "tags": [
      "agroecologia",
      "aquaponia",
      "bioeconomia",
      "fungicultura",
      "hericium",
      "bokashi",
      "viamao",
      "autossuficiencia",
      "micropropriedade"
    ],
    "companionDownload": {
      "file": "downloads/ARP-07_micropropriedade_bioeconomia_viamao.csv",
      "label": "Matriz Bioeconômica CSV"
    }
  }
];
  let data = [
  {
    "id": "ARP-01",
    "code": "ARP.01",
    "title": "Da Matemática ao Objeto Real",
    "subtitle": "Como construir uma mesa biônica orgânica usando código e engenharia computacional",
    "author": "Advanced Research Projects",
    "date": "2026-10-14",
    "dateFormatted": "14 Out 2026",
    "time": "06:36 BRT",
    "timestamp": "2026-10-14T06:36:00-03:00",
    "readTime": "5 min",
    "words": 779,
    "status": "STL Exportado // C# PicoGK",
    "highlight": "Superelipses, SDF e Gyroid TPMS",
    "url": "articles/artigo-da-matematica-ao-objeto-real.html",
    "image": "media/mesa-bionica/mesa-bionica-pontos.png",
    "alt": "Visualização pontilhada de uma mesa orgânica com tampo oval e pernas ramificadas",
    "category": "Engenharia computacional",
    "tags": [
      "design paramétrico",
      "PicoGK",
      "geometria implícita",
      "fabricação aditiva",
      "mesa biônica"
    ],
    "companionDownload": {
      "file": "downloads/ARP-01_gyroid_tpms_sdf_generator.py",
      "label": "Python SDF Generator"
    }
  },
  {
    "id": "ARP-02",
    "code": "ARP.02",
    "title": "A Forja da Superwood Doméstica",
    "subtitle": "Deslignificação termoquímica e colapso celular para produção em oficina de madeira densificada de até 587 MPa",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:06 BRT",
    "timestamp": "2026-10-30T23:06:00-03:00",
    "readTime": "5 min",
    "words": 836,
    "status": "Ensaio de Resistência // 587 MPa",
    "highlight": "Colapso celular térmico e prensagem a quente",
    "url": "articles/artigo-superwood-celulose-densificada.html",
    "image": "media/superwood/comparativo-tracao-especifica.png",
    "alt": "Gráfico comparativo de resistência à tração específica entre madeira superdensificada caseira, titânio, aço e madeira natural",
    "category": "Ciência dos materiais",
    "tags": [
      "superwood",
      "celulose densificada",
      "biomateriais",
      "deslignificação",
      "química prática",
      "alta resistência"
    ],
    "companionDownload": {
      "file": "downloads/ARP-02_superwood_densification_kinetics.csv",
      "label": "Dataset 587 MPa"
    }
  },
  {
    "id": "ARP-03",
    "code": "ARP.03",
    "title": "Biocompostos de Alta Performance",
    "subtitle": "Análise quantitativa de doze sistemas compósitos acoplando curauá, linho e juta a matrizes bio-epóxi e poliuretano de mamona",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:15 BRT",
    "timestamp": "2026-10-30T23:15:00-03:00",
    "readTime": "6 min",
    "words": 764,
    "status": "Diagrama de Ashby // 12 Matrizes",
    "highlight": "Curauá, linho e juta com matriz vegetal",
    "url": "articles/artigo-biocompostos-fibras-eco-resinas.html",
    "image": "media/biocompostos/ashby-resistencia-modulo.png",
    "alt": "Diagrama de Ashby comparativo de resistência específica versus módulo de elasticidade específico de biocompostos",
    "category": "Compósitos sustentáveis",
    "tags": [
      "biocompostos",
      "fibras vegetais",
      "eco-resinas",
      "curauá",
      "linho",
      "matrizes bio-baseadas",
      "NFRP"
    ]
  },
  {
    "id": "ARP-04",
    "code": "ARP.04",
    "title": "Geopolímeros de Solo: Cerâmica a Frio",
    "subtitle": "Ativação alcalina de metacaulim e terra in-situ para síntese de matrizes minerais estruturais com cura em temperatura ambiente",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:22 BRT",
    "timestamp": "2026-10-30T23:22:00-03:00",
    "readTime": "6 min",
    "words": 898,
    "status": "Cura em Ambiente // Sem Forno",
    "highlight": "Ativação alcalina com solo in-situ e metacaulim",
    "url": "articles/artigo-geopolimeros-solo-ceramica-a-frio.html",
    "image": "media/geopolimeros/custo-vs-resistencia-compressao.png",
    "alt": "Gráfico de dispersão entre custo por metro cúbico e resistência à compressão de materiais de solo versus convencionais",
    "category": "Geopolímeros e solo",
    "tags": [
      "geopolímeros",
      "ativação alcalina",
      "metacaulim",
      "solo in-situ",
      "cerâmica a frio",
      "construção sustentável"
    ],
    "companionDownload": {
      "file": "downloads/ARP-04_soil_geopolymer_alkaline_activation.csv",
      "label": "Matriz Geopolímeros CSV"
    }
  },
  {
    "id": "ARP-05",
    "code": "ARP.05",
    "title": "Micromecânica da Celulose e Geometry Kernels",
    "subtitle": "Modelagem implícita volumétrica, campos de distância assinado (SDF) e otimização topológica para materiais anisotrópicos",
    "author": "Advanced Research Projects",
    "date": "2026-10-30",
    "dateFormatted": "30 Out 2026",
    "time": "23:29 BRT",
    "timestamp": "2026-10-30T23:29:00-03:00",
    "readTime": "6 min",
    "words": 847,
    "status": "Simulação Volumétrica // PicoGK",
    "highlight": "SDF, TPMS Gyroid e anisotropia elástica",
    "url": "articles/artigo-micromecanica-celulose-geometry-kernels.html",
    "image": "media/geometry-kernels/micromecanica-densificacao.png",
    "alt": "Curva de simulação micromecânica da densificação celular de madeira comparando densidade versus módulo de elasticidade",
    "category": "Engenharia computacional",
    "tags": [
      "geometria implícita",
      "PicoGK",
      "micromecânica",
      "anisotropia",
      "SDF",
      "TPMS",
      "Gyroid"
    ],
    "companionDownload": {
      "file": "downloads/ARP-05_micromechanics_picogk_anisotropy.py",
      "label": "Tensor Elasticidade Python"
    }
  },
  {
    "id": "ARP-06",
    "code": "ARP.06",
    "title": "Biotecnologia de Resíduos e Regeneração do Solo",
    "subtitle": "Análise experimental e modelagem 3D de doze rotas: termoconversão, biomineralização larval, fermentação acelerada e canteiros colinares",
    "author": "Advanced Research Projects",
    "date": "2026-11-10",
    "dateFormatted": "10 Nov 2026",
    "time": "17:41 BRT",
    "timestamp": "2026-11-10T17:41:00-03:00",
    "readTime": "10 min",
    "words": 1550,
    "status": "Simulador 3D Interativo // 12 Rotas",
    "highlight": "Biochar, Hermetia illucens, Hügelkultur e No-Dig",
    "url": "articles/artigo-regeneracao-solo-biotecnologia-residuos.html",
    "image": "media/regeneracao-solo/regeneracao-solo-capa.png",
    "alt": "Matriz Cinética de Biotransformação de Resíduos e Regeneração Edáfica da ARP",
    "category": "Ciência dos solos & Biotecnologia",
    "tags": [
      "biocarvão",
      "biochar",
      "hügelkultur",
      "vermicompostagem",
      "BSFL",
      "biodigestão",
      "lasagna gardening",
      "agroecologia",
      "regeneração do solo",
      "no-dig"
    ],
    "companionDownload": {
      "file": "downloads/ARP-06_biochar_hugel_soil_regeneration.csv",
      "label": "Cinética Biochar CSV"
    }
  },
  {
    "id": "ARP-07",
    "code": "ARP.07",
    "title": "Hiperotimização Bioeconômica e Autossuficiência em Micropropriedades",
    "subtitle": "Modelagem espacial 3D, zootecnia aquapônica em recirculação (RAS), fungicultura funcional e economia circular para micropropriedades urbanas",
    "author": "Advanced Research Projects",
    "date": "2026-11-12",
    "dateFormatted": "12 Nov 2026",
    "time": "14:00 BRT",
    "timestamp": "2026-11-12T14:00:00-03:00",
    "readTime": "14 min",
    "words": 1950,
    "status": "Modelagem 3D // Validação Econômica",
    "highlight": "Aquaponia RAS, Hericium e Bokashi On-Farm",
    "url": "articles/artigo-micropropriedade-urbana-autossuficiencia-bioeconomica.html",
    "image": "media/micropropriedade-urbana/micropropriedade-arquitetura-metabolica.png",
    "alt": "Arquitetura Espacial e Metabólica da Micropropriedade 2.0 em Viamão/RS",
    "category": "Bioeconomia & Agroecologia urbana",
    "tags": [
      "agroecologia",
      "aquaponia",
      "bioeconomia",
      "fungicultura",
      "hericium",
      "bokashi",
      "viamao",
      "autossuficiencia",
      "micropropriedade"
    ],
    "companionDownload": {
      "file": "downloads/ARP-07_micropropriedade_bioeconomia_viamao.csv",
      "label": "Matriz Bioeconômica CSV"
    }
  }
];
  let activeCategory = 'all';
  let activeSort = 'date-desc';
  let currentView = 'table';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

  function setView(view) {
    currentView = view;
    if (view === 'table') {
      if (tableWrap) tableWrap.style.display = 'block';
      if (grid) grid.style.display = 'none';
      if (btnTable) btnTable.classList.add('active');
      if (btnGrid) btnGrid.classList.remove('active');
    } else {
      if (tableWrap) tableWrap.style.display = 'none';
      if (grid) grid.style.display = 'grid';
      if (btnTable) btnTable.classList.remove('active');
      if (btnGrid) btnGrid.classList.add('active');
    }
  }

  function updateCategoryPillsCount() {
    catPills.forEach(pill => {
      const cat = pill.getAttribute('data-cat');
      const badge = pill.querySelector('.pill-count');
      if (!badge) return;
      if (cat === 'all') {
        badge.textContent = data.length;
      } else {
        const c = data.filter(a => (a.category || '').toLowerCase() === cat.toLowerCase()).length;
        badge.textContent = c;
      }
    });
  }

  function draw() {
    if (!input) return;
    const q = input.value.trim().toLocaleLowerCase('pt-BR');

    // 1. Filter
    let rows = data.filter(a => {
      const matchesCat = activeCategory === 'all' || (a.category || '').toLowerCase() === activeCategory.toLowerCase();
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = [
        a.title,
        a.subtitle,
        a.author,
        a.category,
        a.code,
        a.highlight,
        a.status,
        a.dateFormatted,
        a.time,
        ...(a.tags || [])
      ].join(' ').toLocaleLowerCase('pt-BR');
      return haystack.includes(q);
    });

    // 2. Sort
    rows.sort((a, b) => {
      if (activeSort === 'date-desc') {
        return (b.timestamp || b.date || '').localeCompare(a.timestamp || a.date || '');
      }
      if (activeSort === 'date-asc') {
        return (a.timestamp || a.date || '').localeCompare(b.timestamp || b.date || '');
      }
      if (activeSort === 'code-asc') {
        return (a.code || '').localeCompare(b.code || '');
      }
      if (activeSort === 'time-desc') {
        return (b.words || 0) - (a.words || 0);
      }
      return 0;
    });

    // 3. Render Table
    if (tableBody) {
      tableBody.innerHTML = rows.map((a, i) => `
        <tr>
          <td><span class="tbl-code">${esc(a.code || `ARP.${String(i+1).padStart(2,'0')}`)}</span></td>
          <td style="text-align:center">
            <a class="tbl-action-btn" href="${esc(a.url)}">Acessar ↗</a>
          </td>
          <td>
            <div class="tbl-date-time">
              <span class="tbl-date">${esc(a.dateFormatted || a.date || '2026')}</span>
              <span class="tbl-time">${esc(a.time || '')}</span>
            </div>
          </td>
          <td><span class="tbl-read">⏱ ${esc(a.readTime || '5 min')}</span></td>
          <td class="tbl-title-cell">
            <a class="tbl-title-link" href="${esc(a.url)}">${esc(a.title)}</a>
            <div class="tbl-sub">${esc(a.subtitle || '')}</div>
          </td>
          <td><span class="tbl-category">${esc(a.category || 'Artigo')}</span></td>
          <td><span class="tbl-spec">${esc(a.highlight || a.status || 'Concluído')}</span></td>
        </tr>
      `).join('');
    }

    // 4. Render Grid
    if (grid) {
      grid.innerHTML = rows.map((a, i) => `
        <a class="entry" href="${esc(a.url)}" style="--delay:${Math.min(i, 8) * 60}ms">
          <div class="entry-card-header">
            <div>
              <span class="entry-card-code">${esc(a.code || `ARP.${String(i+1).padStart(2,'0')}`)}</span>
              <span> • ${esc(a.dateFormatted || a.date || '2026')}</span>
            </div>
            <span class="entry-card-time">⏱ ${esc(a.readTime || '5 min')}</span>
          </div>
          <div class="entry-img">
            <img src="${esc(a.image)}" alt="${esc(a.alt || a.title)}" loading="lazy">
          </div>
          <div class="entry-copy">
            <div class="entry-meta">
              <span>${esc(a.category || 'Artigo')}</span>
              <span>${esc(a.time || '')}</span>
            </div>
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.subtitle || '')}</p>
            <div class="entry-tags-row">
              ${(a.tags || []).slice(0, 3).map(t => `<span class="entry-tag-item">${esc(t)}</span>`).join('')}
              ${a.companionDownload ? `<span class="entry-tag-item" style="background:rgba(0,0,242,0.08);border-color:var(--ink);color:var(--ink);font-weight:600">💾 ${esc(a.companionDownload.label)}</span>` : ''}
            </div>
            <div class="entry-foot">
              <span>${esc(a.author || 'ARP')}</span>
              <span class="entry-arrow">↗</span>
            </div>
          </div>
        </a>
      `).join('');
    }

    if (empty) empty.hidden = rows.length !== 0;
    if (results) {
      results.textContent = q || activeCategory !== 'all' 
        ? `${rows.length} publicação${rows.length === 1 ? '' : 'ões'} encontrada${rows.length === 1 ? '' : 's'}` 
        : `${data.length} publicações ativas`;
    }
  }

  // Event Listeners
  if (input) input.addEventListener('input', draw);

  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      activeSort = e.target.value;
      draw();
    });
  }

  let userManuallySetView = false;
  if (btnTable) {
    btnTable.addEventListener('click', () => {
      userManuallySetView = true;
      setView('table');
    });
  }
  if (btnGrid) {
    btnGrid.addEventListener('click', () => {
      userManuallySetView = true;
      setView('grid');
    });
  }

  window.addEventListener('resize', () => {
    if (!userManuallySetView) {
      const prefersGrid = window.innerWidth < 820;
      if (prefersGrid && currentView !== 'grid') {
        setView('grid');
      } else if (!prefersGrid && currentView !== 'table') {
        setView('table');
      }
    }
  });

  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-cat') || 'all';
      draw();
    });
  });

  // Inicialização síncrona imediata com os 6 artigos (funciona em file:// e http://)
  // Mobile (< 820px) abre nativamente em Grade para ergonomia de leitura; Desktop abre em Painel
  if (count) count.textContent = `${String(data.length).padStart(2, '0')} ARTIGOS`;
  updateCategoryPillsCount();
  const initialPrefersGrid = window.innerWidth < 820;
  setView(initialPrefersGrid ? 'grid' : 'table');
  draw();

  // Em ambientes com servidor HTTP/HTTPS, sincroniza se houver atualização externa
  if (location.protocol !== 'file:') {
    fetch('articles.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(items => {
        if (Array.isArray(items) && items.length) {
          data = items;
          if (count) count.textContent = `${String(data.length).padStart(2, '0')} ARTIGOS`;
          updateCategoryPillsCount();
          draw();
        }
      })
      .catch(() => {});
  }
})();

// 2. NAVEGAÇÃO, RÉGUA E ANIMAÇÃO GRÁFICA DO HERO
(function() {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  let ready = false, sy = 0;
  const P = { facade: 0x7b85f0, deep: 0x0b14b0, core: 0x3540d6, edge: 0xffffff, amb: 0x838df2, key: 0xdce0ff, fill: 0x0912a8 };

  const hd = $('#hd'), hero = $('#hero'), bar = $('#bar'), rl = $('#ruler'), ftr = $('footer');
  if (!hero || !rl) return;

  let tp = 0, cp = 0, vhp = 30, hov = null, actv = 0, lastKey = '';
  let rh = '<div class="rb" id="rb"></div><div class="pl" id="pl"><span id="pq">000%</span></div><div class="hl" id="hl"><span id="hq">000%</span></div>';
  const TW = [], BO = [];

  for (let i = 0; i <= 100; i++) {
    const k = i % 10 === 0 ? 'l' : i % 5 === 0 ? 'm' : 's';
    TW.push({ s: 6, m: 12, l: 22 }[k]);
    BO.push({ s: .5, m: .8, l: 1 }[k]);
    rh += '<i class="' + k + '" style="top:' + i + '%"></i>';
    if (i % 5 === 0) rh += '<b style="top:' + i + '%">' + i + '</b>';
  }
  rl.innerHTML = rh;

  const T = [...rl.querySelectorAll('i')];
  const N = [...rl.querySelectorAll('b')];
  const rb = $('#rb'), pl = $('#pl'), pq = $('#pq'), hl = $('#hl'), hq = $('#hq');
  const SECS = [['Início', '#hero'], ['Projeto', '#vision'], ['Artigos', '#artigos']];

  const CH = SECS.map(([t, s]) => {
    const b = document.createElement('button');
    b.className = 'ch';
    b.textContent = t;
    b.onclick = e => {
      e.stopPropagation();
      const target = $(s);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    };
    rl.appendChild(b);
    return b;
  });

  function place() {
    const m = Math.max(1, root.scrollHeight - innerHeight);
    let a = 0;
    SECS.forEach(([t, s], i) => {
      const el = $(s);
      if (!el) return;
      const top = el.getBoundingClientRect().top + scrollY;
      CH[i].style.top = Math.min(1, top / m) * 100 + '%';
      if (top <= scrollY + innerHeight * .4) a = i;
    });
    CH.forEach((c, i) => c.classList.toggle('on', i === a));
  }

  const p3 = n => String(Math.round(n)).padStart(3, '0') + '%';

  rl.addEventListener('pointermove', e => {
    const r = rl.getBoundingClientRect();
    hov = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
    rl.classList.add('hv');
  });

  rl.addEventListener('pointerleave', () => {
    hov = null;
    rl.classList.remove('hv');
  });

  rl.onclick = e => {
    const r = rl.getBoundingClientRect();
    scrollTo({
      top: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) * (root.scrollHeight - innerHeight),
      behavior: 'smooth'
    });
  };

  function rulerLoop() {
    requestAnimationFrame(rulerLoop);
    cp += (tp - cp) * .14;
    if (Math.abs(tp - cp) < .0004) cp = tp;
    const c = hov === null ? cp * 100 : hov;
    const A = hov === null ? (Date.now() - actv < 700 ? 14 : 7) : 26;
    const key = cp.toFixed(4) + '|' + c.toFixed(2) + '|' + A + '|' + vhp.toFixed(2);
    if (key === lastKey) return;
    lastKey = key;

    rb.style.top = cp * (100 - vhp) + '%';
    rb.style.height = vhp + '%';
    pl.style.top = cp * 100 + '%';
    pq.textContent = p3(cp * 100);

    if (hov !== null) {
      hl.style.top = hov + '%';
      hq.textContent = p3(hov);
    }

    T.forEach((el, i) => {
      const d = i - c, g = Math.exp(-d * d / 18);
      el.style.width = (TW[i] + A * g).toFixed(1) + 'px';
      el.style.opacity = Math.min(1, BO[i] + g * .5).toFixed(2);
    });

    N.forEach((el, k) => {
      const d = k * 5 - c, g = Math.exp(-d * d / 18);
      el.style.transform = 'translate(-' + (A * g * .9).toFixed(1) + 'px,-50%)';
      el.style.opacity = (.7 + .3 * g).toFixed(2);
    });
  }

  addEventListener('resize', place);
  addEventListener('load', place);

  function onScroll() {
    sy = scrollY;
    const hb = hero.getBoundingClientRect().bottom;
    hd.classList.toggle('past', hb < 70);
    const sh = root.scrollHeight, m = sh - innerHeight;
    tp = m > 0 ? sy / m : 0;
    vhp = Math.min(100, innerHeight / sh * 100);
    if (bar) bar.style.transform = 'scaleX(' + tp + ')';
    document.body.classList.toggle('pp', hb < innerHeight * .5 && ftr.getBoundingClientRect().top > innerHeight * .55);
    actv = Date.now();
    place();
  }

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  rulerLoop();

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }), { threshold: .15 });
  $$('.rv').forEach(el => io.observe(el));

  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const n = +e.target.dataset.n, t0 = performance.now();
    (function f(t) {
      const k = Math.min(1, (t - t0) / 1400);
      e.target.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 3)))).padStart(2, '0');
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }), { threshold: .6 });
  $$('[data-n]').forEach(el => co.observe(el));

  const mt = $('.mq-t');
  if (mt) mt.innerHTML += mt.innerHTML;

  $$('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg');
      c.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 8 + 'deg');
    });
    c.addEventListener('pointerleave', () => {
      c.style.setProperty('--rx', '0deg');
      c.style.setProperty('--ry', '0deg');
    });
  });

  // Interação do Hero 3D
  let tx = .32, ty = .34, lx = tx, ly = ty, mx = 0, my = 0, drag = false, px = 0, py = 0, rotY = -.58, rotX = .24;
  const rt = $('#rt'), rc = $('#rc');
  const pad = n => String(Math.round(n * 1000)).padStart(3, '0');

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = (e.clientY - r.top) / r.height;
    mx = tx - .5;
    my = ty - .5;
    if (e.pointerType === 'mouse' && rt && rc) {
      rt.style.transform = 'translate(' + (e.clientX + 18) + 'px,' + (e.clientY - 12) + 'px)';
      rc.textContent = 'CAD // X:' + pad(tx) + ' Y:' + pad(ty);
    }
  });

  if (rt) {
    hero.addEventListener('pointerenter', () => rt.style.opacity = 1);
    hero.addEventListener('pointerleave', () => rt.style.opacity = 0);
  }

  hero.addEventListener('pointerdown', e => {
    if (e.target.closest('button,a')) return;
    drag = true;
    px = e.clientX;
    py = e.clientY;
    hero.classList.add('grab');
  });

  const end = () => {
    drag = false;
    hero.classList.remove('grab');
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);

  addEventListener('pointermove', e => {
    if (!drag) return;
    rotY += (e.clientX - px) * .0055;
    rotX = Math.max(-.35, Math.min(.55, rotX + (e.clientY - py) * .004));
    px = e.clientX;
    py = e.clientY;
  });

  // Motor Gráfico Three.js do Hero
  if (typeof THREE === 'undefined') return;

  let R, S, C, G, mats = {}, lights = {}, scan, pts, vis = true, boot = true, scanOn = true, now = 0, last = 0, gx = 0, bx0 = 4.8, cx0 = -4.2, cz0 = 19.5;
  const clock = new THREE.Clock();

  function applyTheme() {
    const p = P;
    mats.facade.color.setHex(p.facade);
    mats.facade.emissive.setHex(0x0c1499);
    mats.core.color.setHex(p.core);
    mats.core.emissive.setHex(0x081088);
    mats.deep.color.setHex(p.deep);
    [mats.line, mats.sf, mats.sl, mats.pt].forEach(m => m.color.setHex(p.edge));
    lights.amb.color.setHex(p.amb);
    lights.key.color.setHex(p.key);
    lights.fill.color.setHex(p.fill);
  }

  function layout() {
    const b = $('#gl');
    if (!b || !R || !C) return;
    const w = b.clientWidth, h = b.clientHeight;
    if (!w || !h) return;
    R.setSize(w, h);
    C.aspect = w / h;
    C.updateProjectionMatrix();
    const wide = innerWidth >= 900;
    bx0 = wide ? 3.6 : 0;
    cx0 = wide ? -4.2 : 0;
    cz0 = wide ? 19.5 : (w / h < .8 ? 30 : 24);
  }

  function build(name) {
    while (G.children.length) {
      const c = G.children[0];
      c.traverse(o => o.geometry && o.geometry.dispose());
      G.remove(c);
    }
    let k = 0;
    const add = (o, u) => {
      o.userData = Object.assign({ x0: o.position.x, y0: o.position.y, birth: now + (boot ? 1.1 : 0) + (k++) * .08 }, u || {});
      G.add(o);
      return o;
    };
    const bx = (w, h, d, x, y, z, m, u) => {
      const g = new THREE.Group(), geo = new THREE.BoxGeometry(w, h, d);
      g.add(new THREE.Mesh(geo, [m, m, m, mats.deep, m, m]), new THREE.LineSegments(new THREE.EdgesGeometry(geo), mats.line));
      g.position.set(x, y, z);
      return add(g, u);
    };
    const f = mats.facade, c = mats.core;

    if (name === 'tower') {
      bx(5.2, 13.5, 5.2, 1.2, -1.5, -1, c);
      bx(9.4, 1.6, 8.8, .2, 3.6, 1.2, f, { slide: [.5, .6, 0] });
      bx(6.8, 2.2, 6.4, .8, 5.5, .2, f, { slide: [.3, .9, 1.5] });
      for (let i = 0; i < 5; i++) bx(6.4, .38, 6.4, .6, 1.6 - i * 1.35, .8, f, { slide: [.28, .8 + i * .12, i * 1.1] });
      for (let j = -2; j <= 2; j++) bx(.18, 9.5, .18, .6 + j * 1.35, -1.2, 3.8, f);
      bx(5.5, 5.5, 4.8, -3.2, -4.6, 1.5, f, { slide: [.2, .5, 2] });
      rotY = -.58; rotX = .24;
    } else if (name === 'monolith') {
      for (let i = 0; i < 7; i++) bx(4.2 + (i % 3) * 1.6, 2.2, 4.5 + ((i + 1) % 2) * 2.2, Math.sin(i * 1.2) * 1.4, -4.5 + i * 1.75, Math.cos(i * .9) * 1.2, i % 2 ? c : f, { slide: [.7, .5 + i * .07, i] });
      rotY = -.75; rotX = .18;
    } else {
      const o = new THREE.Group(), t = new THREE.Group(), tg = new THREE.TorusGeometry(4.6, 1.1, 16, 48);
      t.rotation.x = Math.PI / 2.6;
      t.add(new THREE.Mesh(tg, c), new THREE.LineSegments(new THREE.EdgesGeometry(tg), mats.line));
      o.add(t);
      add(o, { spin: .35 });
      const rm = new THREE.Mesh(new THREE.TorusGeometry(2.6, .45, 12, 36), mats.deep), o2 = new THREE.Group();
      rm.rotation.y = Math.PI / 4;
      o2.add(rm);
      add(o2, { spin: -.8 });
      bx(1.8, 11, 1.8, 0, 0, 0, f);
      rotY = -.4; rotX = .3;
    }
  }

  function init() {
    const box = $('#gl');
    if (!box) return;
    S = new THREE.Scene();
    C = new THREE.PerspectiveCamera(40, 1, .1, 200);
    R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    box.appendChild(R.domElement);

    mats.facade = new THREE.MeshLambertMaterial({ emissiveIntensity: .25 });
    mats.core = new THREE.MeshLambertMaterial({ emissiveIntensity: .35 });
    mats.deep = new THREE.MeshBasicMaterial();
    mats.line = new THREE.LineBasicMaterial({ transparent: true, opacity: .78 });

    lights.amb = new THREE.AmbientLight(0xffffff, .85);
    lights.key = new THREE.DirectionalLight(0xffffff, 1.15);
    lights.key.position.set(-18, 22, 14);
    lights.fill = new THREE.DirectionalLight(0xffffff, .9);
    lights.fill.position.set(15, -18, -10);
    S.add(lights.amb, lights.key, lights.fill);

    G = new THREE.Group();
    S.add(G);

    const pg = new THREE.PlaneGeometry(17, 17);
    scan = new THREE.Group();
    mats.sf = new THREE.MeshBasicMaterial({ transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false });
    mats.sl = new THREE.LineBasicMaterial({ transparent: true });
    const pm = new THREE.Mesh(pg, mats.sf), pe = new THREE.LineSegments(new THREE.EdgesGeometry(pg), mats.sl);
    pm.rotation.x = pe.rotation.x = -Math.PI / 2;
    scan.add(pm, pe);
    S.add(scan);

    const n = 180, a = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i += 3) {
      a[i] = (Math.random() - .5) * 34;
      a[i + 1] = (Math.random() - .5) * 26;
      a[i + 2] = (Math.random() - .5) * 24;
    }
    const pgm = new THREE.BufferGeometry();
    pgm.setAttribute('position', new THREE.BufferAttribute(a, 3));
    mats.pt = new THREE.PointsMaterial({ size: .09, transparent: true, opacity: .7 });
    pts = new THREE.Points(pgm, mats.pt);
    S.add(pts);

    applyTheme();
    layout();
    build('tower');
    boot = false;
    C.position.set(cx0, -2.5, cz0 + 14);
    addEventListener('resize', layout);
    new IntersectionObserver(e => { vis = e[0].isIntersecting; }).observe(hero);
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!vis) return;
    now = clock.getElapsedTime();
    const dt = Math.min(.05, now - last);
    last = now;

    lx += (tx - lx) * .12;
    ly += (ty - ly) * .12;
    hero.style.setProperty('--cx', (lx * 100).toFixed(1) + '%');
    hero.style.setProperty('--cy', (ly * 100).toFixed(1) + '%');

    if (!drag) rotY += dt * .05;
    G.rotation.y += (rotY + sy * .0014 - G.rotation.y) * .06;
    G.rotation.x += (rotX + my * .1 - G.rotation.x) * .06;
    gx += (bx0 - gx) * .08;
    G.position.set(gx, -1.8 + Math.sin(now * .7) * .14, 0);

    C.position.x += (cx0 + mx * 1.4 - C.position.x) * .05;
    C.position.y += (-2.5 - my * .9 - C.position.y) * .05;
    C.position.z += (cz0 - C.position.z) * .04;

    G.children.forEach(c => {
      const u = c.userData, k = Math.min(1, Math.max(0, (now - u.birth) / .9)), e = 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);
      const o = u.out === undefined ? 0 : Math.min(1, Math.max(0, (now - u.out) / .55));
      c.scale.setScalar(Math.max(.0001, e * (1 - o)));
      c.position.y = u.y0 + (1 - k) * 7 + o * 8;
      if (o) c.rotation.y += dt * 9 * o;
      if (u.slide) c.position.x = u.x0 + Math.sin(now * u.slide[1] + u.slide[2]) * u.slide[0];
      if (u.spin) c.rotation.y += u.spin * dt;
    });

    mats.line.opacity = .62 + .2 * Math.sin(now * 2.2);
    const p = (now * .16) % 1, fd = Math.sin(p * Math.PI);
    scan.visible = scanOn;
    scan.position.set(G.position.x, -9 + p * 18, 0);
    scan.rotation.y = G.rotation.y;
    mats.sf.opacity = .14 * fd;
    mats.sl.opacity = .9 * fd;
    pts.rotation.y = now * .02;
    pts.position.y = Math.sin(now * .3) * .4;

    R.render(S, C);
  }

  try {
    init();
    ready = true;
    tick();
  } catch (e) {
    console.error(e);
  }

  const names = ['tower', 'monolith', 'reactor'];
  let cur = 0, busy = false, timer;

  function go(n) {
    if (!ready || busy || n === cur) return;
    busy = true;
    cur = n;
    $$('[data-p]').forEach(x => x.classList.toggle('on', x.dataset.p === names[n]));
    G.children.forEach((c, i) => c.userData.out = now + i * .03);
    setTimeout(() => {
      build(names[n]);
      const g = $('#gl');
      g.classList.remove('flash');
      void g.offsetWidth;
      g.classList.add('flash');
      busy = false;
    }, 1100);
  }

  function loop() {
    clearInterval(timer);
    timer = setInterval(() => go((cur + 1) % 3), 7500);
  }

  $$('[data-p]').forEach(b => b.onclick = () => {
    go(names.indexOf(b.dataset.p));
    loop();
  });
  loop();

  const meshBtn = $('#mesh');
  if (meshBtn) {
    meshBtn.onclick = e => {
      if (!ready) return;
      mats.line.visible = !mats.line.visible;
      e.currentTarget.textContent = 'CAD MESH: ' + (mats.line.visible ? 'ON' : 'OFF');
    };
  }

  const scanBtn = $('#scan');
  if (scanBtn) {
    scanBtn.onclick = e => {
      scanOn = !scanOn;
      e.currentTarget.textContent = 'SCAN: ' + (scanOn ? 'ON' : 'OFF');
    };
  }
})();
