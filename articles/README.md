# Guia de Engenharia Editorial: Como Criar Novos Artigos (ARP)

Este guia documenta o padrão canônico do ecossistema editorial da **Advanced Research Projects (ARP)**. Siga rigorosamente este protocolo para garantir fidelidade técnica, conformidade com os princípios `/impeccable`, suporte total a visualização offline (`file:///`) e integração determinística com o painel de telemetria e a barra lateral de leitura.

---

## 1. Princípios de Design & Identidade Visual

| Parâmetro | Valor / Token | Aplicação |
| :--- | :--- | :--- |
| **Azul Elétrico** | `#0000f2` (`var(--blue)`) | Cor primária, marcas, headers, foco ativo, botões principais. |
| **Amarelo Elétrico** | `#f2f200` (`var(--yellow)`) | Realce analítico, progresso de leitura, bordas de lightbox, badges ativos. |
| **Cinza Papel Técnico** | `#d6d4cc` (`var(--paper)`) | Fundo base das páginas de artigos (reduz fadiga visual). |
| **Linhas Técnicas** | `rgba(0, 0, 242, 0.24)` (`var(--line)`) | Delimitação milimétrica de tabelas, cards e grades. |
| **Tipografia Primária** | `Inter, sans-serif` | Corpo do texto, subtítulos e ledes (65–75 caracteres por linha). |
| **Tipografia Técnica** | `'IBM Plex Mono', monospace` | Metadados, equações, tabelas, telemetria, código e badges. |

### Regras Mandatórias de Engenharia
1. **Fidelidade de Dados 100%:** É expressamente proibido cortar eixos, truncar rótulos numéricos ou forçar proporções quadradas (`aspect-ratio: 1/1`) ou zoom destrutivo (`scale`) em diagramas e gráficos. Todas as imagens devem usar `object-fit: contain` com fundo `#ffffff`.
2. **Ambiente Isolado e Sem Menções Locais:** Nunca mencione caminhos locais do computador pessoal (`C:\Users\...`, nomes de pastas internas como `pesquisa_.../scripts/` ou referências genéricas a notebooks do Google Colab). Descreva sempre a infraestrutura procedural nativa da ARP (ex: *"pipeline computacional da ARP (.NET 8 e PicoGK)"*).
3. **Autossuficiência Offline (`file:///`):** O sistema deve funcionar perfeitamente quando aberto diretamente pelo sistema de arquivos. O logotipo branco nos cabeçalhos deve ser mantido em formato Base64 embutido para evitar bloqueios de CORS.
4. **Matemática Semântica:** Não deixe fórmulas cruas em LaTeX (`$$...$$` ou `$t$`). Utilize o componente padronizado `.math-block` e `.math-inline`.

---

## 2. Estrutura de Diretórios e Nomenclatura

Ao redigir um novo artigo (ex: Artigo 07 sobre biominerais):

```
Advanced Research Projects/
├── src/
│   ├── articles/
│   │   ├── artigo-biominerais-estruturais.html   <-- O NOVO ARTIGO
│   │   └── ...
│   ├── media/
│   │   └── biominerais/                         <-- DIRETÓRIO DE MÍDIA DO ARTIGO
│   │       ├── biomineralizacao-capa.png
│   │       └── curva-tensao-deformacao.png
│   ├── css/
│   │   ├── article.css
│   │   └── article-sidebar.css
│   ├── js/
│   │   ├── landing.js                           <-- REGISTRO SÍNCRONO
│   │   └── article-sidebar.js
│   ├── articles.json                            <-- REGISTRO JSON
│   └── index.html                               <-- TABELA DO PAINEL PRINCIPAL
```

* **Nome do arquivo HTML:** `artigo-<slug-em-kebab-case>.html`
* **Código sequencial:** `ARP.07`, `ARP.08`, etc.
* **Imagens:** PNGs ou WebP em alta densidade (2000px a 4500px de largura recomendada), salvas na pasta `src/media/<slug>/`.

---

## 3. Template HTML Canônico Completo

Copie o modelo abaixo ao criar o arquivo `src/articles/artigo-<slug>.html`:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#d6d4cc">
<meta name="description" content="RESUMO TÉCNICO CONCISO (140-160 caracteres) PARA INDEXAÇÃO.">
<title>TÍTULO DO ARTIGO — Advanced Research Projects</title>
<link rel="icon" type="image/png" href="../assets/branding/arp-favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/article.css">
<link rel="stylesheet" href="../css/article-sidebar.css">
</head>
<body>

<header>
  <nav class="nav">
    <a class="brand mono" href="../index.html">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABLAAAADHCAYAAAAJSaqlAAAWfmNhQlgAABZ+..." alt="ARP" class="brand-logo" width="78" height="13">
      <i class="brand-sep"></i>
      <span class="bt">Advanced Research Projects</span>
    </a>
    <a class="back" href="../index.html#artigos">← Painel de Artigos</a>
  </nav>
</header>

<main class="wrap">
  <!-- SEÇÃO HERO -->
  <section class="hero">
    <div class="eyebrow">Artigo 07 <span>//</span> Disciplina de Pesquisa</div>
    <h1>Título Principal do Estudo em Engenharia</h1>
    <p class="subtitle">Subtítulo explicativo com especificação do problema físico ou computacional abordado.</p>
    <div class="byline">Investigação técnica por <strong>Advanced Research Projects</strong></div>
    
    <div class="article-telemetry mono">
      <span class="telemetry-pill"><strong class="telemetry-badge">ARP.07</strong></span>
      <span class="telemetry-pill"><strong>Publicado:</strong> 11 Nov 2026 às 14:00 BRT</span>
      <span class="telemetry-pill"><strong>Leitura:</strong> 6 min (850 palavras)</span>
      <span class="telemetry-pill"><strong>Status:</strong> <span class="telemetry-status">Ensaio Validado // Simulação 3D</span></span>
    </div>
    
    <div class="meta">
      <span>TAG 01</span>
      <span>TAG 02</span>
      <span>TAG 03</span>
    </div>
    
    <!-- FIGURA DE CAPA DO ARTIGO -->
    <figure class="heroimg">
      <img src="../media/slug/imagem-capa.png" alt="Descrição técnica e acessível da imagem">
      <figcaption>Legenda analítica do gráfico ou modelo tridimensional apresentado.</figcaption>
    </figure>
  </section>

  <!-- CORPO EDITORIAL E SIDEBAR -->
  <div class="layout">
    <article class="article">
      <!-- PARÁGRAFO LEDE -->
      <p class="lede">O parágrafo lede define com rigor o objetivo central da pesquisa, sintetizando o estado da arte e o diferencial analítico alcançado pelo laboratório.</p>

      <!-- SEÇÃO 01 (Obrigatoriamente com ID para o sumário automático) -->
      <h2 id="fundamentos">Fundamentos teóricos e modelo conceitual</h2>
      <p>Desenvolvimento teórico com equações e referências formais à física ou matemática subjacente.</p>

      <!-- CARD DE PILARES (3 COLUNAS TÉCNICAS) -->
      <div class="pillars">
        <div class="pillar">
          <span class="kicker">Parâmetro 01</span>
          <strong>Módulo Específico</strong>
          Descrição quantitativa do primeiro elemento analisado.
        </div>
        <div class="pillar">
          <span class="kicker">Parâmetro 02</span>
          <strong>Síntese Reativa</strong>
          Cinética química ou comportamento volumétrico.
        </div>
        <div class="pillar">
          <span class="kicker">Parâmetro 03</span>
          <strong>Fator de Eficiência</strong>
          Rendimento estrutural em grandes deformações.
        </div>
      </div>

      <!-- BLOCO MATEMÁTICO FORMAL -->
      <div class="math-block">
        <div class="math-kicker">[EQ.01 // EQUAÇÃO CONSTITUTIVA PRINCIPAL]</div>
        <div class="math-equation">
          <var>&sigma;</var> = <var>E</var> &times; <var>&epsilon;</var> + <span class="math-fn">exp</span>(-<var>k</var><var>t</var>)
        </div>
        <div class="math-legend">
          <span class="math-pill"><var>&sigma;</var> = tensão mecânica efetiva (MPa)</span>
          <span class="math-pill"><var>E</var> = módulo de Young transversal (GPa)</span>
          <span class="math-pill"><var>t</var> = tempo de relaxação de tensões</span>
        </div>
      </div>

      <!-- SEÇÃO 02: TABELA DE RESULTADOS -->
      <h2 id="resultados">Resultados comparativos de laboratório</h2>
      <p>Apresentação dos dados mensurados confrontando amostras controle e experimentais:</p>

      <table class="data-table">
        <thead>
          <tr>
            <th>Sistema / Formulação</th>
            <th>Densidade (g/cm³)</th>
            <th>Resistência (MPa)</th>
            <th>Módulo Elástico (GPa)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Amostra Padrão A1</td>
            <td>0,45</td>
            <td>142,5</td>
            <td>18,2</td>
          </tr>
          <tr>
            <td>Formulação Otimizada B2</td>
            <td>0,88</td>
            <td>512,0</td>
            <td>64,5</td>
          </tr>
        </tbody>
      </table>

      <!-- FIGURA SECUNDÁRIA COM LIGHTBOX AUTOMÁTICA -->
      <figure class="figure">
        <img src="../media/slug/grafico-analitico.png" alt="Curva analítica de ensaio sob carga estática">
        <figcaption>Resposta constitutiva em tração pura. Observa-se regime elástico linear até 1,8% de deformação.</figcaption>
      </figure>

      <!-- DESTAQUE / CALLOUT -->
      <div class="callout">
        <span class="kicker">Conclusão Experimental</span>
        <p>A integração entre a arquitetura molecular do biopolímero e o controle micromecânico permite duplicar a resistência mantendo baixa pegada de carbono.</p>
      </div>

      <!-- SEÇÃO 03: BIBLIOGRAFIA -->
      <h2 id="referencias">Metodologia e referências bibliográficas</h2>
      <ul>
        <li>Ashby, M. F. <em>Materials Selection in Mechanical Design</em>. Butterworth-Heinemann (5th ed., 2016).</li>
        <li>Documentação técnica dos pipelines de síntese procedural da ARP (2026).</li>
      </ul>

      <!-- NAVEGAÇÃO SEQUENCIAL ENTRE ARTIGOS -->
      <nav class="article-nav-strip" aria-label="Navegação entre publicações da ARP">
        <a class="article-nav-card prev" href="artigo-anterior.html">
          <span class="nav-kicker">&larr; Artigo Anterior // ARP.06</span>
          <span class="nav-title">Biotecnologia de Resíduos e Regeneração do Solo</span>
        </a>
        <div class="article-nav-hub">
          <a href="../index.html#artigos">&#9783; Painel de Artigos</a>
        </div>
        <a class="article-nav-card next" href="artigo-seguinte.html">
          <span class="nav-kicker">Próximo Artigo // ARP.08 &rarr;</span>
          <span class="nav-title">Título do Artigo Sequencial</span>
        </a>
      </nav>
    </article>

    <!-- SIDEBAR DINÂMICA (preenchida automaticamente via JS) -->
    <aside data-arp-sidebar data-code="ARP / 07"></aside>
  </div>

  <!-- RODAPÉ DA PÁGINA -->
  <footer>
    <span>ARP // Artigo 07</span>
    <span>Advanced Research Projects · 2026</span>
  </footer>
</main>

<script src="../js/article-sidebar.js" defer></script>
</body>
</html>
```

---

## 4. Componentes Editoriais Disponíveis

### A. Títulos e IDs (`h2`)
Todo `<h2>` deve conter um atributo `id` único em letras minúsculas sem espaços (ex: `<h2 id="cinetica">Cinética Térmica</h2>`). O script [`article-sidebar.js`](file:///c:/Users/amadeus/Documents/Advanced%20Research%20Projects/src/js/article-sidebar.js) lê todos os `h2[id]` em tempo de execução e constrói dinamicamente o **Índice do Artigo** na sidebar, com rolagem suave ao clique e rastreamento de seção em tempo real.

### B. Blocos Matemáticos (`.math-block`)
Utilize para fórmulas centrais com múltiplas variáveis:
```html
<div class="math-block">
  <div class="math-kicker">[EQ.02 // MODELO DE GIBSON-ASHBY]</div>
  <div class="math-equation">
    <var>E</var> = <var>E<sub>s</sub></var> &times; (<var>C<sub>1</sub></var> <var>&phi;<sup>2</sup></var> + <var>C<sub>2</sub></var> <var>&phi;</var>)
  </div>
  <div class="math-legend">
    <span class="math-pill"><var>&phi;</var> = fração relativa de sólidos</span>
    <span class="math-pill"><var>E<sub>s</sub></var> &approx; 65 GPa</span>
  </div>
</div>
```

### C. Termos Inline (`.math-inline`, `.chem-formula`, `.chem-chain`)
* Para variáveis simples: `<span class="math-inline">t</span>`, `<span class="math-inline">d &lt; 0</span>`.
* Para substâncias químicas: `<span class="chem-formula">SiO<sub>2</sub></span>`, `<span class="chem-formula">[AlO<sub>4</sub>]<sup>5−</sup></span>`.
* Para cadeias de polímeros: `<code class="chem-chain">[−Si−O−Al−O−]</code>`.

### D. Imagens com Lightbox Automático (`.heroimg`, `.figure`)
Basta utilizar as tags semânticas `<figure class="heroimg">` ou `<figure class="figure">`. O arquivo [`article-sidebar.js`](file:///c:/Users/amadeus/Documents/Advanced%20Research%20Projects/src/js/article-sidebar.js) detecta automaticamente as imagens, adiciona o cursor `zoom-in` e cria a janela modal em alta resolução ao clique com tecla `[ESC]` para retorno imediato.

---

## 5. Roteiro de Publicação no Painel Principal (6 Passos)

Após salvar seu novo arquivo HTML em `src/articles/`:

### Passo 1: Atualizar `src/articles.json`
Adicione o novo objeto no início ou fim do array:
```json
{
  "id": "ARP-07",
  "code": "ARP.07",
  "title": "Título Completo do Artigo",
  "subtitle": "Subtítulo detalhado do estudo",
  "author": "Advanced Research Projects",
  "date": "2026-11-11",
  "dateFormatted": "11 Nov 2026",
  "time": "14:00 BRT",
  "timestamp": "2026-11-11T14:00:00-03:00",
  "readTime": "6 min",
  "words": 850,
  "status": "Ensaio Concluído // Síntese Validada",
  "highlight": "Destaque técnico em duas palavras",
  "url": "articles/artigo-novo-exemplo.html",
  "image": "media/slug/imagem-capa.png",
  "alt": "Descrição da capa",
  "category": "Ciência dos materiais",
  "tags": ["biomateriais", "síntese", "densificação"]
}
```

### Passo 2: Atualizar `src/js/landing.js`
Abra [`src/js/landing.js`](file:///c:/Users/amadeus/Documents/Advanced%20Research%20Projects/src/js/landing.js) e adicione o mesmo objeto dentro da constante `ARTICLES_REGISTRY`. Isso garante que o painel exiba o artigo imediatamente mesmo quando aberto por `file:///` sem servidor local HTTP.

### Passo 3: Adicionar a Linha na Tabela de `src/index.html`
No elemento `<tbody id="article-table-body">` de [`src/index.html`](file:///c:/Users/amadeus/Documents/Advanced%20Research%20Projects/src/index.html), adicione a linha pré-renderizada correspondente:
```html
<tr>
  <td><span class="tbl-code">ARP.07</span></td>
  <td style="text-align:center"><a class="tbl-action-btn" href="articles/artigo-novo-exemplo.html">Acessar ↗</a></td>
  <td><div class="tbl-date-time"><span class="tbl-date">11 Nov 2026</span><span class="tbl-time">14:00 BRT</span></div></td>
  <td><span class="tbl-read">⏱ 6 min</span></td>
  <td class="tbl-title-cell">
    <a class="tbl-title-link" href="articles/artigo-novo-exemplo.html">Título do Artigo</a>
    <div class="tbl-sub">Subtítulo detalhado do estudo</div>
  </td>
  <td><span class="tbl-category">Ciência dos materiais</span></td>
  <td><span class="tbl-spec">Destaque técnico da pesquisa</span></td>
</tr>
```

### Passo 4: Atualizar os Contadores do Painel de Telemetria
Em [`src/index.html`](file:///c:/Users/amadeus/Documents/Advanced%20Research%20Projects/src/index.html):
* Atualize `<span id="article-count">07 ARTIGOS</span>`.
* Atualize o card estatístico `<span class="stat-value">07 Publicações</span>`.
* Atualize o contador `<button class="cat-pill" data-cat="...">Nome <span class="pill-count">X</span></button>`.

### Passo 5: Atualizar a Corrente de Navegação (`.article-nav-strip`)
* No artigo anterior (ex: ARP.06), aponte o card `next` para o seu novo artigo (ARP.07).
* No seu novo artigo (ARP.07), aponte o card `prev` para ARP.06 e o card `next` para o próximo (ou feche o ciclo com ARP.01).

### Passo 6: Anexar Datasets ou Scripts Complementares (Opcional)
Se o estudo contiver simulação computacional ou ensaios empíricos:
1. Salve o script `.py` ou dataset `.csv` em `src/downloads/ARP-07_<nome_do_arquivo>`.
2. Adicione a linha correspondente na tabela da seção `#downloads` em [`src/index.html`](file:///c:/Users/amadeus/Documents/Advanced%20Research%20Projects/src/index.html).
3. Adicione o path na lista `CORE_ASSETS` em [`src/sw.js`](file:///c:/Users/amadeus/Documents/Advanced%20Research%20Projects/src/sw.js) para suporte offline via Service Worker.

---

## 6. Checklist de Validação Final

Antes de enviar ou dar o artigo como pronto:
- [ ] O artigo abre em `file:///` sem nenhum erro de console.
- [ ] A barra superior `#read-progress` acompanha a rolagem suavemente em amarelo (`#f2f200`).
- [ ] O ponteiro da régua na sidebar lateral acompanha o percentual de leitura de `000%` a `100%`.
- [ ] Todos os títulos `h2` aparecem com bullets no sumário da sidebar.
- [ ] Todas as imagens possuem padding branco, borda `var(--line)` e legendas `DADOS //`.
- [ ] Clicar em um gráfico abre a lightbox em alta resolução e a tecla `[ESC]` a fecha.
- [ ] Não há fórmulas cruas com `$$` ou `$`.
- [ ] Não há caminhos de computador local (`C:\`, `colab`, `scripts/`).
- [ ] O botão do topo volta corretamente ao painel (`../index.html#artigos`).
- [ ] A navegação sequencial no rodapé leva ao artigo correto.

