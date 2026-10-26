/**
 * Every word and every asset reference on the site lives in this file.
 *
 * To replace a placeholder visual, change its Media entry:
 *   { kind: 'image', src: '/media/gravityos.webp', alt: '…', … }
 *   { kind: 'video', src: '/media/brain-map.mp4', poster: '/media/brain-map.webp', alt: '…', … }
 * Put the files in /public/media. Nothing else needs to change.
 *
 * Items marked TODO are sample values that need confirming before launch.
 */
import type { Media, Motif, SiteContent } from './types';

const placeholder = (motif: Motif, label: string, alt: string, aspect: Media['aspect'] = '16/9'): Media => ({
  kind: 'placeholder',
  motif,
  label,
  alt,
  aspect,
});

/** A real picture, shown whole at its own proportions. */
const image = (src: string, alt: string, width: number, height: number): Media => ({
  kind: 'image',
  src,
  alt,
  label: '',
  aspect: 'auto',
  width,
  height,
});

const EMAIL = 'shivanshsingh2307@gmail.com';

export const content: SiteContent = {
  meta: {
    title: 'Shivansh Singh, AI Engineer × Computational Biologist',
    description:
      'Shivansh Singh builds agentic AI systems, RAG pipelines and knowledge graphs, and mines biological data for meaning. B.Tech in Computer Science and Biosciences, IIIT Delhi.',
  },

  person: {
    name: 'Shivansh Singh',
    first: 'SHIVANSH',
    last: 'SINGH',
    monogram: 'SS',
    role: 'AI Engineer × Computational Biologist',
    city: 'New Delhi',
    timeZone: 'Asia/Kolkata',
    education: 'B.Tech in Computer Science and Biosciences (CSB), IIIT Delhi, 2023 to present',
  },

  contact: {
    email: EMAIL,
    github: { label: 'GitHub', href: 'https://github.com/silverbolt08', external: true },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/silverbolt08', external: true },
    resume: { label: 'Resume', href: '/media/Shivansh_Singh_CV.pdf', external: true },
  },

  nav: [
    { id: 'hero', label: 'Intro' },
    { id: 'manifesto', label: 'Manifesto' },
    { id: 'stats', label: 'Numbers' },
    { id: 'skills', label: 'Skills' },
    { id: 'work', label: 'Selected work' },
    { id: 'experience', label: 'Experience' },
    { id: 'minor-works', label: 'Minor works' },
    { id: 'contact', label: 'Contact' },
  ],

  manifesto: {
    heading: 'Manifesto',
    // Shivansh's text. *Asterisks* mark the gold serif italic emphasis words.
    text: 'I design and ship *agentic* AI systems, from multi-agent pipelines to RAG, and build knowledge *graphs* that turn raw *biological* data into something researchers can query. Between disciplines, and in production.',
  },

  stats: {
    heading: 'In numbers',
    items: [
      { value: 3.95, decimals: 2, suffix: 'M', label: 'triples in a biomedical knowledge graph' },
      { value: 11, decimals: 0, suffix: '', label: 'LLM agents in one pipeline' },
      { value: 0.95, decimals: 2, suffix: '', label: 'Hits@10 with RotatE' },
      { value: 50, decimals: 0, suffix: 'K+', label: 'documents searched in under a second' },
    ],
  },

  skills: {
    heading: 'Skills',
    groups: [
      { group: 'Languages', items: ['Python', 'C++', 'Java', 'SQL', 'JavaScript', 'R'] },
      {
        group: 'AI/ML',
        items: [
          'Agentic AI',
          'RAG',
          'LLM Applications',
          'Multi-Agent Systems',
          'Knowledge Graphs',
          'NLP',
          'Deep Learning',
          'Machine Learning',
          'Vector Databases',
        ],
      },
      { group: 'Frameworks', items: ['LangGraph', 'FastAPI', 'React', 'Node.js', 'TailwindCSS'] },
      { group: 'Databases', items: ['Neo4j', 'PostgreSQL', 'MySQL', 'MongoDB'] },
      { group: 'Tools', items: ['Docker', 'VS Code'] },
    ],
    marqueeRows: [
      ['Agentic AI', 'RAG', 'Multi-Agent Systems', 'Knowledge Graphs', 'LLM Applications', 'NLP', 'Deep Learning', 'Vector Databases'],
      ['Python', 'LangGraph', 'FastAPI', 'Neo4j', 'PostgreSQL', 'C++', 'React', 'Docker', 'SQL', 'R'],
    ],
  },

  work: {
    heading: 'Selected work',
    intro: 'Six projects, from multi-agent pipelines in production to gene expression read one cell at a time.',
    // Cards keep their drawn placeholders; `caseStudy.cover` is the real picture shown when a case study is opened.
    projects: [
      {
        id: 'gravityos',
        index: '01',
        title: 'GravityOS',
        year: '2026',
        tags: ['Python', 'LangGraph', 'OpenAI APIs', 'Multi-agent'],
        outcome: 'One company brief in, publication-ready posts for three platforms out, written and judged by 11 LLM agents.',
        facts: [
          '11 LLM agents across 3 pipelines: Instagram, LinkedIn and Twitter/X.',
          'Goes from brand analysis to publication-ready output from one company brief.',
          'A critic loop with an 8.0/10 pass threshold and a cap of 3 revision cycles auto-flags content for human review.',
          'Instagram: 3 concepts, 3 drafts, 1 winning carousel with 6 design briefs.',
          'Twitter/X: up to 10 variants (5 angles × 2) with automated winner selection.',
        ],
        visual: placeholder('agents', 'GravityOS run: agent graph or output carousel, 16:9 still or loop', 'Diagram of eleven agents across three pipelines feeding a critic loop'),
        caseStudy: {
          cover: image(
            '/media/GravityOS_Agent_Graph.png',
            'GravityOS agent graph: a CLI brief initialises the state, the Brand DNA Builder feeds a platform router, and the Instagram, LinkedIn and Twitter/X branches each run strategy, content, critic and revision nodes until they pass or reach the revision cap',
            4622,
            1452,
          ),
          overview:
            'GravityOS is a multi-agent marketing content platform. It takes a single company brief and produces publication-ready content for Instagram, LinkedIn and Twitter/X, with brand analysis, drafting and review handled by 11 LLM agents.',
          approach: [
            'A Brand DNA Builder reads the brief (and an optional website) once; a platform router then sends the work down the Instagram, LinkedIn or Twitter/X branch.',
            'A critic agent scores every draft. Anything under 8.0/10 goes back for revision, up to 3 cycles, after which it is flagged for a human.',
            'Instagram produces 3 concepts and 3 drafts and selects 1 winning carousel with 6 design briefs.',
            'Twitter/X writes up to 10 variants (5 angles × 2) and selects a winner automatically.',
          ],
          stack: ['Python', 'LangGraph', 'OpenAI APIs'],
          outcome: ['11 agents, 3 pipelines, one brief in.', 'Bounded revision cost: never more than 3 critic cycles per piece.'],
          links: [{ label: 'Source on GitHub', href: 'https://github.com/silverbolt08/GravityOS', external: true }],
          gallery: [
            placeholder('agents', 'Pipeline diagram, full width', 'GravityOS pipeline diagram'),
            placeholder('agents', 'Generated Instagram carousel, 4:3', 'Generated carousel', '4/3'),
          ],
        },
      },
      {
        id: 'picasso',
        index: '02',
        title: 'Picasso',
        year: '2026',
        tags: ['Python', 'FastAPI', 'React', 'LLMs'],
        outcome: 'Natural-language KPI intent becomes a fully structured dashboard in under 40 seconds, with only 2 LLM calls.',
        facts: [
          'Natural-language KPI intent in, a fully structured dashboard out, in under 40 seconds.',
          'Only 2 LLM calls per dashboard.',
          'A deterministic Density & Placement Engine maps 3 chart types across 3 sizing tiers into 4 structural layout roles.',
          'Zero manual configuration.',
        ],
        visual: placeholder('layout', 'Picasso: a generated dashboard, 16:9 screenshot', 'Dashboard layout assembled from four structural roles'),
        caseStudy: {
          overview:
            'Picasso is an AI dashboard orchestrator. Describe the KPIs you care about in plain language and it returns a fully structured dashboard in under 40 seconds.',
          approach: [
            'The language model is used exactly twice: once to interpret intent, once to specify the charts.',
            'Everything else is deterministic. The Density & Placement Engine maps 3 chart types across 3 sizing tiers into 4 structural layout roles.',
          ],
          stack: ['Python', 'FastAPI', 'React', 'LLMs'],
          outcome: ['Under 40 seconds from sentence to dashboard.', 'Zero manual configuration.'],
          links: [
            { label: 'Live site', href: 'https://silverbolt08.github.io/Picasso/', external: true },
            { label: 'Source on GitHub', href: 'https://github.com/silverbolt08/Picasso', external: true },
          ],
          gallery: [
            placeholder('layout', 'Generated dashboard, full width', 'Picasso dashboard'),
            placeholder('layout', 'Placement engine roles, 4:3', 'Placement roles', '4/3'),
          ],
        },
      },
      {
        id: 'bill-spike',
        index: '03',
        title: 'Electricity Bill Spike Diagnosis',
        year: '2026', // TODO confirm
        tags: ['DuckDB', 'LangGraph', 'FastAPI', 'Gemini'],
        outcome: 'Explains why an industrial electricity bill spiked, across tariff, volume, mix, weather and waste, with zero hallucinated numbers.',
        facts: [
          'Evaluates 15-minute interval telemetry.',
          'Decomposes bill-cost variance across tariff, volume, mix, weather and waste using Shapley values.',
          'Gemini is confined to edge classification and executive writing.',
          'A regex-validated number registry enforces zero numerical hallucination.',
        ],
        visual: placeholder('telemetry', 'Variance waterfall or diagnosis report, 16:9 screenshot', 'Interval telemetry trace above a cost-variance waterfall'),
        caseStudy: {
          cover: image(
            '/media/Electricity_Bill.png',
            'Waterfall chart, "What moved the bill: +15.0% in total": tariff +8.7 points, production volume −0.1, product mix +3.8, weather +1.2 and controllable waste +1.4, with a table of ranges and a list of actions ranked by payback',
            1908,
            889,
          ),
          overview:
            'A diagnosis engine for industrial electricity bills. It reads 15-minute interval telemetry and explains a cost spike as the sum of its causes.',
          approach: [
            'Bill-cost variance is decomposed across tariff, volume, mix, weather and waste using Shapley values.',
            'Gemini only classifies edge cases and writes the executive summary.',
            'Every number in the written report must exist in a regex-validated number registry, so the model cannot invent figures.',
          ],
          stack: ['DuckDB', 'LangGraph', 'FastAPI', 'Gemini'],
          outcome: ['Five-way variance attribution per bill.', 'Zero numerical hallucination by construction.'],
          links: [{ label: 'Source on GitHub', href: 'https://github.com/silverbolt08/RNG', external: true }],
          gallery: [
            placeholder('telemetry', 'Interval telemetry view, full width', 'Telemetry view'),
            placeholder('telemetry', 'Executive summary, 4:3', 'Executive summary', '4/3'),
          ],
        },
      },
      {
        id: 'brain-map',
        index: '04',
        title: 'Brain Gene-Expression Map',
        year: '2025', // TODO confirm
        tags: ['Python', 'Allen Human Brain Atlas', 'PCA', 'k-means'],
        outcome: "Where the genes behind Alzheimer's and Parkinson's are most active across the human brain, mapped in 3D.",
        facts: [
          "Ten disease genes chosen with DisGeNET: APP, APOE, BACE1, PSEN1 and ACHE for Alzheimer's; LRRK2, PARK7, PINK1, MAPT and SNCA for Parkinson's.",
          'Allen Human Brain Atlas microarray samples reduced with PCA, clustered with k-means (k = 4) and mapped onto brain anatomy.',
          "3D expression maps in MNI coordinates, coloured by cluster or by Alzheimer's score.",
          "Genes ranked as candidate biomarkers by Z-score: APP led for Alzheimer's (+0.20); LRRK2 (+0.541) and PARK7 (+0.511) for Parkinson's.",
        ],
        visual: placeholder('brain', 'Screen recording of the 3D brain map, as video or image sequence', 'Brain outline with glowing regions where affected cells concentrate'),
        caseStudy: {
          cover: image(
            '/media/Brain_3d.png',
            "3D scatter of Allen Human Brain Atlas tissue samples in MNI coordinates, coloured from blue to red by Alzheimer's gene-expression score",
            973,
            880,
          ),
          overview:
            "Brain Gene Expression Mapping: Unlocking Neurological Disease Insights. The project looks at where genes linked to Alzheimer's and Parkinson's disease are expressed across the human brain, using Allen Human Brain Atlas microarray data with gene selection guided by DisGeNET gene-disease associations.",
          approach: [
            'Cleaning: probe-level data aggregated by gene symbol, missing and infinite values imputed with the row mean, and the matrix transposed to samples × genes.',
            'Dimensionality reduction with PCA, removing one extreme PC1 outlier.',
            'k-means (k = 4) on the PCA-reduced data, with clusters mapped to anatomical structures through the sample metadata.',
            "Spatial mapping: 3D plots in MNI coordinates, coloured by cluster or by Alzheimer's score.",
            'Expression analysis: Z-scores per gene across regions, averaged over literature-selected disease regions (hippocampus, temporal lobe, substantia nigra, basal ganglia), then ranked.',
            'Visualised as bar plots, heatmaps, a clustered heatmap and 3D expression maps.',
          ],
          stack: ['Python', 'pandas', 'SciPy', 'seaborn', 'matplotlib', 'Plotly', 'Allen Human Brain Atlas', 'DisGeNET'],
          outcome: [
            "Alzheimer's: APP had the highest average Z-score (+0.20); ACHE was the most down-regulated (−0.90).",
            "Parkinson's: LRRK2 (+0.541) and PARK7 (+0.511) ranked highest.",
            'Next step: combine this bulk spatial data with single-cell RNA-seq to find cell-type-specific biomarkers.',
          ],
          links: [],
          gallery: [placeholder('brain', 'Recording of the original 3D map', 'Brain map recording')],
        },
      },
      {
        id: 'aptamer',
        index: '05',
        title: 'Aptamer Platform',
        year: '2026',
        tags: ['React', 'TypeScript', 'Tailwind', 'PHP', 'MySQL'],
        outcome: 'AptCancerDB and AptViralDB, plus a knowledge-graph agent that answers questions about antiviral RNA aptamers.',
        facts: [
          'Filters 1,680+ records across 10+ criteria client-side, with 0 ms network latency.',
          'Enriches 1,600+ aptamer profiles through a PHP/MySQL REST API.',
          'BLASTN integration and client-side NCBI/PubMed lookups.',
          'The Aptamer Knowledge Graph Agent answers natural-language queries about antiviral RNA aptamers.',
        ],
        visual: placeholder('aptamer', 'AptViralDB search screen, 16:9 screenshot', 'Secondary structure of an RNA aptamer hairpin'),
        caseStudy: {
          cover: image(
            '/media/AptViralDB.jpg',
            'AptViralDB graphical abstract: collect studies from PubMed, Google Scholar and existing databases (1992 to 2025), curate validated antiviral aptamer sequences, analyse them with search, sequence and structure tools and a knowledge graph, and discover aptamer-target relationships',
            375,
            375,
          ),
          overview:
            'Two aptamer databases, AptCancerDB and AptViralDB, and an agent on top of them that answers natural-language questions about antiviral RNA aptamers. AptViralDB is published as a curated resource for antiviral aptamer discovery.',
          approach: [
            '1,680+ records are filtered across 10+ criteria entirely client-side, so filtering has 0 ms network latency.',
            '1,600+ aptamer profiles are enriched through a PHP/MySQL REST API.',
            'BLASTN integration plus client-side NCBI and PubMed lookups.',
            'The Aptamer Knowledge Graph Agent answers queries in plain language.',
          ],
          stack: ['React', 'TypeScript', 'Tailwind', 'PHP', 'MySQL'],
          outcome: ['Two public-facing databases and one research agent.'],
          links: [
            { label: 'AptCancerDB', href: 'https://webs.iiitd.edu.in/raghava/aptcancerdb/', external: true },
            { label: 'AptViralDB', href: 'https://webs.iiitd.edu.in/raghava/aptviraldb/', external: true },
            { label: 'AptViralDB paper', href: 'https://www.sciencedirect.com/science/article/pii/S2162253126002829', external: true },
          ],
          gallery: [
            placeholder('aptamer', 'Database search screen, full width', 'Database search'),
            placeholder('aptamer', 'Agent conversation, 4:3', 'Agent conversation', '4/3'),
          ],
        },
      },
      {
        id: 'scrna-seq',
        index: '06',
        title: 'scRNA-seq Pipeline',
        year: '2025', // TODO confirm
        tags: ['scRNA-seq', 'MAST', 'Regulatory networks'],
        outcome: "Single-cell RNA-seq analysis across knee osteoarthritis, Alzheimer's and kidney datasets.",
        facts: [
          "Single-cell RNA-seq analysis across disease datasets: knee osteoarthritis, Alzheimer's and kidney.",
          'Cell-type differential expression with MAST.',
          'Maps lipid metabolic enzymes.',
          'Builds transcription-factor-to-target regulatory networks.',
        ],
        visual: placeholder('cells', 'UMAP of annotated cell types, 16:9 figure', 'Clusters of single cells coloured by cell type'),
        caseStudy: {
          cover: image(
            '/media/celltype_umap_figure.png',
            'UMAPs of chondrocyte cell types in control and osteoarthritis samples, above a bar chart of cell-type composition in which osteoarthritis cells make up most of every type',
            2972,
            1748,
          ),
          overview: "A single-cell RNA-seq analysis pipeline applied to knee osteoarthritis, Alzheimer's and kidney datasets.",
          approach: [
            'Cell-type differential expression with MAST.',
            'Lipid metabolic enzymes are mapped across cell types.',
            'Transcription-factor-to-target regulatory networks are built per condition.',
          ],
          stack: ['Placeholder: add stack'],
          outcome: ['Three disease datasets through one pipeline.'],
          links: [],
          gallery: [
            placeholder('cells', 'UMAP figure, full width', 'UMAP'),
            placeholder('cells', 'Regulatory network figure, 4:3', 'Regulatory network', '4/3'),
          ],
        },
      },
    ],
  },

  experience: {
    heading: 'Experience',
    entries: [
      {
        id: 'iiitd',
        year: '2023',
        period: '2023 to present',
        org: 'IIIT Delhi',
        place: 'New Delhi',
        role: 'B.Tech in Computer Science and Biosciences',
        summary: 'Computer science and the biosciences, studied as one degree.',
        metrics: [
          { figure: 'CSB', text: 'Computer Science and Biosciences' },
          { figure: '2023', text: 'to present' },
        ],
      },
      {
        id: 'ahuja-lab',
        year: '2025',
        period: 'May to Jul 2025',
        org: 'The Ahuja Lab, IIIT Delhi',
        role: 'Research Intern',
        supervisor: 'Dr. Gaurav Ahuja',
        summary:
          'Built a biomedical knowledge graph linking Ayurvedic medicines, phytochemicals, diseases, molecular targets and therapeutic properties.',
        metrics: [
          { figure: '3.95M', text: 'triples across 10 relation types' },
          { figure: '0.95 vs 0.86', text: 'Hits@10, RotatE vs TransE (PyKEEN/DGL) on a 3.16M-triple training set' },
          { figure: '+11%', text: 'relative improvement, validating RotatE as the production embedding model' },
        ],
      },
      {
        id: 'caudate',
        year: '2026',
        period: 'May to Jul 2026',
        org: 'Caudate AI',
        place: 'Gurgaon',
        role: 'AI Engineer Intern',
        summary: 'Engineered 4 multi-agent AI systems and collaborated on 3 production AI products with LangGraph.',
        metrics: [
          { figure: '15+', text: 'business workflows automated, with throughput up 2.5×' },
          { figure: '50,000+', text: 'documents behind production RAG pipelines (vector search plus structured databases) with sub-second retrieval' },
          { figure: '40%', text: 'faster business-intelligence workflows, supporting 500+ daily queries' },
        ],
      },
    ],
    achievementsHeading: 'Recognition',
    achievements: [
      { title: "Dean's Award for Academic Excellence", detail: 'IIIT Delhi', year: '2025 to 26' },
      { title: 'CANSAT India National Competition', detail: 'Semi-finalist' },
    ],
  },

  minorWorks: {
    heading: 'Minor works',
    items: [
      {
        id: 'fdi',
        title: 'FDI Network Analysis',
        blurb:
          'IMF CDIS data as directed, weighted cross-border investment flows across 170+ economies: centralities, Louvain communities, motif analysis and temporal shock-propagation simulations (e.g. COVID-19) on hub dominance and resilience.',
        tags: ['Network science', 'IMF CDIS', 'Louvain'],
        preview: placeholder('network', 'Network graph of investment flows, 4:3', 'Directed network of economies', '4/3'),
      },
      {
        id: 'angry-birds',
        title: 'Angry Birds Clone',
        blurb: 'Placeholder blurb: describe the build. Meanwhile, the slingshot works.',
        tags: ['Game', 'Physics'],
        preview: placeholder('slingshot', 'Gameplay screenshot, 4:3', 'Slingshot and a stack of blocks', '4/3'),
        easterEgg: 'slingshot',
      },
      {
        id: 'fire-detector',
        title: 'CV-Based Fire Detector',
        blurb: 'Placeholder blurb: a computer-vision fire detector. Add the model, data and results.',
        tags: ['Computer vision'],
        preview: placeholder('flame', 'Detection frame with bounding box, 4:3', 'Flame with a detection box', '4/3'),
      },
    ],
  },

  contactSection: {
    heading: 'Contact',
    headline: ["LET'S BUILD", 'SOMETHING'],
    intro: 'Agents, retrieval, knowledge graphs or a dataset that needs reading. Write to me.',
    footerMarquee: ['Shivansh Singh', 'AI Engineer × Computational Biologist'],
    credit: 'Designed and built in New Delhi.',
  },
};
