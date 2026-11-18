# Advanced Research Projects

<div align="center">

![ARP Logo](arp-logo-azul-transparente.png)

**Plataforma de Pesquisa Aplicada em Engenharia Computacional, Materiais Avançados & Bioeconomia**  
*Progressive Web App — Desktop & Mobile*

[![Site Oficial](https://img.shields.io/badge/🌐%20Plataforma-mk3bomfim.github.io/ARP-0000f2?style=for-the-badge)](https://mk3bomfim.github.io/ARP)
[![Artigos](https://img.shields.io/badge/📄%20Artigos-7%20Publicados-0000f2?style=for-the-badge)](#-catálogo-de-artigos)
[![Stack](https://img.shields.io/badge/Stack-HTML%20·%20CSS%20·%20JS%20·%20Three.js-0000f2?style=for-the-badge)](#-stack-técnica)

[🇧🇷 Português](#-português) • [🇺🇸 English](#-english)

</div>

---

## 🇧🇷 Português

### Visão Geral
O **ARP — Advanced Research Projects** é uma plataforma editorial e científica que publica artigos técnicos aprofundados nas áreas de **geometria computacional**, **ciência dos materiais**, **biocompostos sustentáveis**, **geopolímeros**, **micromecânica** e **bioeconomia regenerativa**. Cada artigo inclui visualizações interativas em 3D, dados quantitativos, gráficos comparativos e datasets companion para download.

A plataforma opera como **PWA** (Progressive Web App), com fractal 3D interativo na landing page via **Three.js**, sidebar de navegação por artigos, e design monocromático azul `#0000f2` sobre papel `#d6d4cc` com tipografia IBM Plex Mono + Inter.

### Funcionalidades
- **Artigos Técnicos Completos**: Publicações com texto integral, gráficos de alta qualidade e referências cruzadas.
- **Visualizações 3D Interativas**: Viewer de modelos via Three.js com OrbitControls embarcado nos artigos.
- **Fractal 3D na Landing**: Animação procedural de fractal em tempo real renderizada no hero principal.
- **Datasets Companion**: Cada artigo publica CSVs, scripts Python e notebooks para reprodução dos experimentos.
- **Service Worker Offline**: Cache inteligente via `sw.js` para leitura offline completa.
- **Design ARP**: Paleta monocromática azul (#0000f2 / #d6d4cc), sem emojis na UI, tipografia técnica IBM Plex Mono.

---

### 📄 Catálogo de Artigos

| Código | Título | Área | Leitura | Download |
|:-------|:-------|:-----|:-------:|:--------:|
| **ARP.01** | Da Matemática ao Objeto Real — Mesa biônica com SDF e Gyroid TPMS | Engenharia Computacional | 5 min | [Python SDF Generator](downloads/ARP-01_gyroid_tpms_sdf_generator.py) |
| **ARP.02** | A Forja da Superwood Doméstica — Densificação celular até 587 MPa | Ciência dos Materiais | 5 min | [Dataset 587 MPa](downloads/ARP-02_superwood_densification_kinetics.csv) |
| **ARP.03** | Biocompostos de Alta Performance — Curauá, linho e juta com bio-epóxi | Compósitos Sustentáveis | 6 min | — |
| **ARP.04** | Geopolímeros de Solo: Cerâmica a Frio — Ativação alcalina sem forno | Geopolímeros & Solo | 6 min | [Matriz Geopolímeros CSV](downloads/ARP-04_soil_geopolymer_alkaline_activation.csv) |
| **ARP.05** | Micromecânica da Celulose e Geometry Kernels — SDF, TPMS e anisotropia | Engenharia Computacional | 6 min | [Tensor Elasticidade Python](downloads/ARP-05_micromechanics_picogk_anisotropy.py) |
| **ARP.06** | Biotecnologia de Resíduos e Regeneração do Solo — 12 rotas com simulador 3D | Ciência dos Solos | 10 min | [Cinética Biochar CSV](downloads/ARP-06_biochar_hugel_soil_regeneration.csv) |
| **ARP.07** | Hiperotimização Bioeconômica — Aquaponia RAS, fungicultura e economia circular | Bioeconomia & Agroecologia | 14 min | [Matriz Bioeconômica CSV](downloads/ARP-07_micropropriedade_bioeconomia_viamao.csv) |

---

### 🔧 Stack Técnica

```
Frontend         HTML5 · CSS3 · Vanilla JavaScript
Tipografia       IBM Plex Mono · Inter (Google Fonts)
3D Engine        Three.js + OrbitControls
Paleta           #0000f2 (ink) · #d6d4cc (paper) · #06087a (lens)
Offline          Service Worker (sw.js)
Hosting          GitHub Pages
```

### Estrutura do Projeto
```
ARP/
├── index.html                   # Landing page com fractal 3D interativo
├── articles.json                # Registro de todos os artigos (metadados)
├── manifest.json                # Manifesto PWA
├── sw.js                        # Service Worker para cache offline
├── css/
│   ├── landing.css              # Estilos da landing (tema ARP)
│   ├── article.css              # Estilos dos artigos
│   └── article-sidebar.css      # Sidebar de navegação entre artigos
├── js/
│   ├── landing.js               # Lógica da landing + fractal 3D
│   ├── fractal-3d.js            # Geração procedural de fractal Three.js
│   ├── viewer-3d.js             # Viewer 3D genérico para artigos
│   ├── article-sidebar.js       # Sidebar dinâmica
│   ├── microproperty-3d.js      # Visualizador 3D de micropropriedade
│   └── vendor/
│       ├── three.min.js         # Three.js (runtime)
│       └── OrbitControls.js     # Controles orbitais
├── articles/                    # Artigos HTML completos (ARP.01 → ARP.07)
├── downloads/                   # Datasets CSV e scripts Python companion
├── media/                       # Gráficos e visualizações por artigo
│   ├── mesa-bionica/
│   ├── superwood/
│   ├── biocompostos/
│   ├── geopolimeros/
│   ├── geometry-kernels/
│   ├── regeneracao-solo/
│   └── micropropriedade-urbana/
└── assets/branding/             # Logos e ícones ARP
```

---

## 🇺🇸 English

### Overview
**ARP — Advanced Research Projects** is a scientific editorial platform publishing deep technical articles on **computational geometry**, **materials science**, **sustainable biocomposites**, **geopolymers**, **micromechanics**, and **regenerative bioeconomy**. Each article includes interactive 3D visualizations, quantitative data, comparative charts, and companion datasets for download.

The platform runs as a **PWA** (Progressive Web App) with an interactive 3D fractal on the landing page via **Three.js**, article navigation sidebar, and a monochrome blue `#0000f2` design over paper `#d6d4cc` with IBM Plex Mono + Inter typography.

### Key Features
- **Full Technical Articles**: Complete publications with high-quality charts and cross-references.
- **Interactive 3D Visualizations**: Three.js model viewer with embedded OrbitControls in articles.
- **3D Fractal Landing**: Real-time procedural fractal animation rendered in the hero section.
- **Companion Datasets**: Each article publishes CSVs, Python scripts, and notebooks for experiment reproduction.
- **Offline Service Worker**: Smart caching via `sw.js` for full offline reading.
- **ARP Design System**: Monochrome blue palette (#0000f2 / #d6d4cc), no emojis in UI, IBM Plex Mono technical typography.

### Article Catalog

| Code | Title | Field | Read | Download |
|:-----|:------|:------|:----:|:--------:|
| **ARP.01** | From Math to Real Object — Bionic table with SDF and Gyroid TPMS | Computational Engineering | 5 min | [Python SDF Generator](downloads/ARP-01_gyroid_tpms_sdf_generator.py) |
| **ARP.02** | Forging Domestic Superwood — Cellular densification up to 587 MPa | Materials Science | 5 min | [Dataset 587 MPa](downloads/ARP-02_superwood_densification_kinetics.csv) |
| **ARP.03** | High-Performance Biocomposites — Curauá, flax and jute with bio-epoxy | Sustainable Composites | 6 min | — |
| **ARP.04** | Soil Geopolymers: Cold Ceramics — Alkaline activation, no kiln | Geopolymers & Soil | 6 min | [Geopolymer Matrix CSV](downloads/ARP-04_soil_geopolymer_alkaline_activation.csv) |
| **ARP.05** | Cellulose Micromechanics and Geometry Kernels — SDF, TPMS and anisotropy | Computational Engineering | 6 min | [Elasticity Tensor Python](downloads/ARP-05_micromechanics_picogk_anisotropy.py) |
| **ARP.06** | Waste Biotechnology and Soil Regeneration — 12 routes with 3D simulator | Soil Science | 10 min | [Biochar Kinetics CSV](downloads/ARP-06_biochar_hugel_soil_regeneration.csv) |
| **ARP.07** | Bioeconomic Hyperoptimization — RAS Aquaponics, fungi culture and circular economy | Bioeconomy & Agroecology | 14 min | [Bioeconomic Matrix CSV](downloads/ARP-07_micropropriedade_bioeconomia_viamao.csv) |

---

<div align="center">
<sub>ARP &bull; ADVANCED RESEARCH PROJECTS &bull; Pesquisa Aplicada em Geometria Computacional, Materiais Avançados & Bioeconomia</sub>
</div>
