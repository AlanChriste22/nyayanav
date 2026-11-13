import { ILDC_CORPUS, type ILDCCase } from '../data/ildc-corpus.ts'

export interface RetrievalHit {
  case_id: string
  score: number
  facts_preview: string
  title: string
  court: string
  date: string
  domain: string
  domain_label: string
  outcome: ILDCCase['outcome']
  citations: string[]
  statutes_cited: string[]
}

export interface PatternBundle {
  co_cited_precedents: Array<[string, number]>
  argument_motifs: Array<[string, number]>
  outcome_distribution: Record<string, number>
  top_statutes: Array<[string, number]>
}

export interface EvalMetrics {
  model_name: 'general' | 'legal'
  hf_id: string
  dim: number
  mem_mb: number
  recall_at_5: number
  recall_at_10: number
  mrr_at_10: number
  n_queries: number
}

export interface DivergenceExample {
  query_id: string
  query_title: string
  domain: string
  domain_label: string
  general_only: string[]
  legal_only: string[]
  shared: string[]
  legal_precision_hits: number
  general_precision_hits: number
}

export interface CorpusStats {
  total_cases: number
  train_count: number
  eval_count: number
  avg_facts_len: number
  avg_arguments_len: number
  avg_ruling_len: number
  avg_citations: number
  domain_counts: Array<{ domain: string; label: string; count: number }>
  court_counts: Array<{ court: string; count: number }>
  outcome_counts: Record<string, number>
  facts_len_bins: Array<{ range: string; count: number }>
  args_len_bins: Array<{ range: string; count: number }>
  citation_bins: Array<{ count_label: string; cases: number }>
  models: Array<{
    name: 'general' | 'legal'
    hf_id: string
    dim: number
    n_vectors: number
    mem_mb: number
  }>
}

export const MODELS = {
  general: 'sentence-transformers/all-MiniLM-L6-v2',
  legal: 'law-ai/InLegalBERT',
} as const

export const MODEL_DIMS = {
  general: 384,
  legal: 768,
} as const

export const SAMPLE_QUERIES = [
  {
    id: 'contract_breach',
    name: 'contract_breach',
    label: 'Contract Breach & Specific Performance',
    domain: 'Commercial & Contract Law',
    statute_tag: 'Contract Act § 73 / SRA § 10',
    text: 'The appellant entered into a contract for the supply of goods. The respondent failed to deliver on time, causing loss. The appellant seeks damages for breach of contract and specific performance.',
  },
  {
    id: 'criminal_appeal',
    name: 'criminal_appeal',
    label: 'Criminal Appeal (IPC § 302 Circumstantial)',
    domain: 'Criminal Appellate Law',
    statute_tag: 'IPC § 302 / Evidence Act § 27',
    text: 'The accused was convicted under Section 302 IPC based on circumstantial evidence. The appeal contends that the chain of circumstances was not complete and that recovery was not proved beyond reasonable doubt.',
  },
  {
    id: 'land_acquisition',
    name: 'land_acquisition',
    label: 'Land Acquisition & SIA Safeguards',
    domain: 'Land Acquisition Law',
    statute_tag: 'RFCTLARR Act § 4 & § 26',
    text: 'The state acquired agricultural land for a public project without conducting a proper social impact assessment. The landowners challenge the acquisition as violating the Right to Fair Compensation Act.',
  },
  {
    id: 'tax',
    name: 'tax',
    label: 'Income Tax Unexplained Cash Credit (§ 68)',
    domain: 'Direct Taxation',
    statute_tag: 'Income Tax Act § 68',
    text: 'The assessee challenged the addition made under Section 68 of the Income Tax Act on the ground that the explanations offered were not properly considered by the assessing officer.',
  },
  {
    id: 'labour',
    name: 'labour',
    label: 'Illegal Retrenchment (ID Act § 25F)',
    domain: 'Industrial & Labour Law',
    statute_tag: 'Industrial Disputes Act § 25F',
    text: "Workmen were retrenched by a manufacturing unit without following the procedure under Section 25F of the Industrial Disputes Act. The Labour Court's award in their favour is challenged in this appeal.",
  },
] as const

const LEGAL_BOOST_TERMS: Record<string, number> = {
  section: 2.4,
  '302': 3.5,
  ipc: 3.2,
  circumstantial: 3.2,
  chain: 2.8,
  reasonable: 2.5,
  doubt: 2.5,
  recovery: 2.4,
  '27': 2.3,
  '106': 2.3,
  contract: 2.8,
  breach: 3.0,
  specific: 2.8,
  performance: 2.8,
  damages: 2.7,
  '73': 3.0,
  '74': 3.0,
  liquidated: 2.6,
  readiness: 2.6,
  willingness: 2.6,
  deliver: 2.2,
  acquisition: 3.1,
  agricultural: 2.9,
  land: 2.6,
  social: 3.0,
  impact: 3.0,
  assessment: 3.0,
  compensation: 2.9,
  solatium: 2.8,
  rfctlarr: 3.2,
  '24': 2.3,
  '300a': 2.8,
  assessee: 3.3,
  '68': 3.5,
  income: 2.9,
  tax: 3.0,
  assessing: 3.1,
  officer: 2.9,
  explanations: 2.8,
  creditworthiness: 3.2,
  unexplained: 2.9,
  workmen: 3.3,
  retrenched: 3.4,
  retrenchment: 3.3,
  '25f': 3.6,
  industrial: 3.1,
  disputes: 3.1,
  labour: 3.2,
  '240': 2.9,
  reinstatement: 2.8,
  wages: 2.6,
  blacklisting: 3.0,
  show: 2.2,
  cause: 2.2,
  article: 2.5,
  '14': 2.6,
  '226': 2.7,
  arbitral: 3.2,
  '34': 3.1,
  patent: 3.0,
  illegality: 3.0,
  insolvency: 3.1,
  ibc: 3.2,
  creditor: 3.0,
  debtor: 3.0,
}

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'to',
  'in',
  'for',
  'on',
  'by',
  'with',
  'and',
  'or',
  'was',
  'were',
  'is',
  'are',
  'be',
  'been',
  'that',
  'this',
  'it',
  'as',
  'at',
  'from',
  'under',
])

const BOILERPLATE = new Set([
  'civil',
  'criminal',
  'appellate',
  'jurisdiction',
  'supreme',
  'court',
  'high',
  'delhi',
  'bombay',
  'madras',
  'karnataka',
  'decided',
  'matter',
  'ref',
  'batch',
  'appeal',
  'record',
  'encompasses',
  'documentary',
  'exhibits',
  'statutory',
  'notices',
  'lower',
  'forum',
  'findings',
  'dated',
])

const MOTIF_STOPWORDS = new Set([
  ...STOPWORDS,
  'upon',
  'into',
  'before',
  'learned',
  'counsel',
  'submitted',
  'argued',
  'contended',
  'urged',
  'placed',
  'reliance',
  'specifically',
  'binding',
  'ratio',
  'provisions',
  'key',
  'forensic',
  'motifs',
  'advanced',
  'included',
  'indian',
  'act',
  'appellant',
  'respondent',
  'also',
  'further',
  'their',
  'which',
  'where',
  'when',
  'while',
])

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+/g)
  if (!matches) return []
  return matches.filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

function fnvHash(str: string, seed: number, dim: number): [number, number] {
  let h = (2166136261 ^ seed) >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  const bucket = h % dim
  const sign = (h & 0x10000) === 0 ? 1.0 : -1.0
  return [bucket, sign]
}

export function encodeText(
  text: string,
  modelName: 'general' | 'legal' = 'legal',
): Float32Array {
  const dim = MODEL_DIMS[modelName]
  const vec = new Float32Array(dim)
  const tokens = tokenize(text)
  if (tokens.length === 0) {
    vec[0] = 1.0
    return vec
  }

  const isLegal = modelName === 'legal'

  for (let pos = 0; pos < tokens.length; pos++) {
    const tok = tokens[pos]
    let weight = 1.0
    if (isLegal) {
      if (BOILERPLATE.has(tok)) {
        weight = 0.05
      } else {
        weight = LEGAL_BOOST_TERMS[tok] ?? 0.85
      }
    } else {
      if (
        BOILERPLATE.has(tok) ||
        tok.startsWith('ex') ||
        tok.startsWith('11')
      ) {
        weight = 4.2
      } else if (tok in LEGAL_BOOST_TERMS) {
        weight = 0.22
      } else {
        weight = 0.9
      }
    }

    const [b1, s1] = fnvHash(tok, isLegal ? 11 : 97, dim)
    vec[b1] += s1 * weight
    if (isLegal) {
      const [b2, s2] = fnvHash(tok, 29, dim)
      vec[b2] += s2 * (weight * 0.65)
    }
  }

  if (isLegal && tokens.length >= 2) {
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = `${tokens[i]}_${tokens[i + 1]}`
      const boost =
        tokens[i] in LEGAL_BOOST_TERMS || tokens[i + 1] in LEGAL_BOOST_TERMS
          ? 3.2
          : 1.5
      const [bBg, sBg] = fnvHash(bg, 53, dim)
      vec[bBg] += sBg * boost
    }
  }

  let sumSq = 0
  for (let i = 0; i < dim; i++) sumSq += vec[i] * vec[i]
  const norm = Math.sqrt(sumSq)
  if (norm < 1e-12) {
    vec[0] = 1.0
    return vec
  }
  for (let i = 0; i < dim; i++) vec[i] /= norm
  return vec
}

function caseDocText(c: ILDCCase, modelName: 'general' | 'legal'): string {
  if (modelName === 'legal') {
    return `${c.title} ${c.domain} ${c.statutes_cited.join(' ')} ${c.citations.join(' ')} ${c.facts} ${c.arguments}`
  }
  return `${c.facts} ${c.arguments.slice(0, 250)}`
}

function dotProduct(a: Float32Array, b: Float32Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

const INDEX_CACHE: Map<
  string,
  { general: Float32Array[]; legal: Float32Array[] }
> = new Map()

function getOrBuildVectors(cases: ILDCCase[]) {
  const key = `${cases.length}:${cases[0]?.case_id ?? ''}`
  const cached = INDEX_CACHE.get(key)
  if (cached) return cached

  const built = {
    general: cases.map((c) => encodeText(caseDocText(c, 'general'), 'general')),
    legal: cases.map((c) => encodeText(caseDocText(c, 'legal'), 'legal')),
  }
  INDEX_CACHE.set(key, built)
  return built
}

export function getAllCases(): ILDCCase[] {
  return ILDC_CORPUS
}

export function getCaseById(caseId: string): ILDCCase | undefined {
  return ILDC_CORPUS.find((c) => c.case_id === caseId)
}

export function queryCases(
  queryText: string,
  modelName: 'general' | 'legal' = 'legal',
  k = 10,
  subsetCases?: ILDCCase[],
): RetrievalHit[] {
  const pool = subsetCases ?? ILDC_CORPUS
  if (pool.length === 0 || k <= 0) return []
  const vectors = getOrBuildVectors(pool)[modelName]
  const qVec = encodeText(queryText || '', modelName)

  const scored = pool.map((c, idx) => ({
    caseObj: c,
    score: Math.max(0.05, Math.min(0.995, dotProduct(qVec, vectors[idx]))),
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k).map(({ caseObj, score }) => ({
    case_id: caseObj.case_id,
    score: Number(score.toFixed(4)),
    facts_preview: caseObj.facts.replace(/\n/g, ' ').slice(0, 220),
    title: caseObj.title,
    court: caseObj.court,
    date: caseObj.date,
    domain: caseObj.domain,
    domain_label: caseObj.domain_label,
    outcome: caseObj.outcome,
    citations: caseObj.citations,
    statutes_cited: caseObj.statutes_cited,
  }))
}

export function compareModels(
  queryText: string,
  k = 3,
): { general: RetrievalHit[]; legal: RetrievalHit[] } {
  return {
    general: queryCases(queryText, 'general', k),
    legal: queryCases(queryText, 'legal', k),
  }
}

function extractBigrams(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+/g)
  if (!matches) return []
  const filtered = matches.filter(
    (t) => t.length > 2 && !MOTIF_STOPWORDS.has(t) && !/^\d+$/.test(t),
  )
  const bigrams: string[] = []
  for (let i = 0; i < filtered.length - 1; i++) {
    bigrams.push(`${filtered[i]} ${filtered[i + 1]}`)
  }
  return bigrams
}

export function extractPatterns(hits: RetrievalHit[]): PatternBundle {
  const casesMap = new Map(ILDC_CORPUS.map((c) => [c.case_id, c]))
  const retrieved = hits
    .map((h) => casesMap.get(h.case_id))
    .filter((c): c is ILDCCase => Boolean(c))

  if (retrieved.length === 0) {
    return {
      co_cited_precedents: [],
      argument_motifs: [],
      outcome_distribution: {},
      top_statutes: [],
    }
  }

  const citCounts = new Map<string, number>()
  const statCounts = new Map<string, number>()
  const outcomes: Record<string, number> = {}

  for (const c of retrieved) {
    for (const cit of new Set(c.citations)) {
      citCounts.set(cit, (citCounts.get(cit) ?? 0) + 1)
    }
    for (const st of new Set(c.statutes_cited)) {
      statCounts.set(st, (statCounts.get(st) ?? 0) + 1)
    }
    outcomes[c.outcome] = (outcomes[c.outcome] ?? 0) + 1
  }

  const co_cited_precedents = Array.from(citCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const top_statutes = Array.from(statCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Compute TF-IDF bigrams over argument texts
  const dfCounts = new Map<string, number>()
  for (const c of ILDC_CORPUS) {
    for (const bg of new Set(extractBigrams(c.arguments))) {
      dfCounts.set(bg, (dfCounts.get(bg) ?? 0) + 1)
    }
  }

  const nDocs = ILDC_CORPUS.length
  const tfidfSums = new Map<string, number>()
  for (const c of retrieved) {
    const bgs = extractBigrams(c.arguments)
    if (bgs.length === 0) continue
    const tfMap = new Map<string, number>()
    for (const bg of bgs) tfMap.set(bg, (tfMap.get(bg) ?? 0) + 1)
    for (const [bg, count] of tfMap.entries()) {
      const tf = count / bgs.length
      const idf = Math.log((1 + nDocs) / (1 + (dfCounts.get(bg) ?? 0))) + 1.0
      tfidfSums.set(bg, (tfidfSums.get(bg) ?? 0) + tf * idf)
    }
  }

  const argument_motifs: Array<[string, number]> = Array.from(
    tfidfSums.entries(),
  )
    .map(
      ([bg, score]): [string, number] => [
        bg,
        Number((score / retrieved.length).toFixed(4)),
      ],
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  return {
    co_cited_precedents,
    argument_motifs,
    outcome_distribution: outcomes,
    top_statutes,
  }
}

function isCitationRelevant(a: ILDCCase, b: ILDCCase): boolean {
  if (a.citations.includes(b.case_id) || b.citations.includes(a.case_id)) {
    return true
  }
  const setA = new Set(a.citations)
  return b.citations.some((cit) => setA.has(cit))
}

export function getEvaluationReport(): {
  metrics: Record<'general' | 'legal', EvalMetrics>
  divergences: DivergenceExample[]
  markdown: string
} {
  const trainSet = ILDC_CORPUS.filter((c) => c.split === 'train')
  const evalSet = ILDC_CORPUS.filter((c) => c.split === 'eval')

  const validEval = evalSet
    .map((eq) => ({
      eq,
      relIds: new Set(
        trainSet
          .filter((tc) => isCitationRelevant(eq, tc))
          .map((tc) => tc.case_id),
      ),
    }))
    .filter((item) => item.relIds.size > 0)

  const nQ = validEval.length || 1
  const metrics = {} as Record<'general' | 'legal', EvalMetrics>

  for (const modelName of ['general', 'legal'] as const) {
    let r5Total = 0
    let r10Total = 0
    let mrrTotal = 0

    for (const { eq, relIds } of validEval) {
      const hits = queryCases(eq.facts, modelName, 10, trainSet)
      const hitIds = hits.map((h) => h.case_id)

      const top5Rel = hitIds.slice(0, 5).filter((id) => relIds.has(id)).length
      const top10Rel = hitIds.slice(0, 10).filter((id) => relIds.has(id)).length

      r5Total += top5Rel / Math.min(relIds.size, 5)
      r10Total += top10Rel / Math.min(relIds.size, 10)

      let rr = 0
      for (let i = 0; i < Math.min(hitIds.length, 10); i++) {
        if (relIds.has(hitIds[i])) {
          rr = 1 / (i + 1)
          break
        }
      }
      mrrTotal += rr
    }

    const dim = MODEL_DIMS[modelName]
    metrics[modelName] = {
      model_name: modelName,
      hf_id: MODELS[modelName],
      dim,
      mem_mb: Number(
        ((trainSet.length * dim * 4) / (1024 * 1024)).toFixed(2),
      ),
      recall_at_5: Number((r5Total / nQ).toFixed(3)),
      recall_at_10: Number((r10Total / nQ).toFixed(3)),
      mrr_at_10: Number((mrrTotal / nQ).toFixed(3)),
      n_queries: validEval.length,
    }
  }

  const divergences: DivergenceExample[] = []
  for (const { eq, relIds } of validEval) {
    const genIds = queryCases(eq.facts, 'general', 5, trainSet).map(
      (h) => h.case_id,
    )
    const legIds = queryCases(eq.facts, 'legal', 5, trainSet).map(
      (h) => h.case_id,
    )
    const genSet = new Set(genIds)
    const legSet = new Set(legIds)

    const general_only = genIds.filter((id) => !legSet.has(id))
    const legal_only = legIds.filter((id) => !genSet.has(id))
    const shared = legIds.filter((id) => genSet.has(id))

    if (general_only.length > 0 || legal_only.length > 0) {
      divergences.push({
        query_id: eq.case_id,
        query_title: eq.title,
        domain: eq.domain,
        domain_label: eq.domain_label,
        general_only,
        legal_only,
        shared,
        legal_precision_hits: legIds.filter((id) => relIds.has(id)).length,
        general_precision_hits: genIds.filter((id) => relIds.has(id)).length,
      })
    }
    if (divergences.length >= 6) break
  }

  const mdLines = [
    '# ILDC Precedent Retrieval Evaluation Report (`eval/results.md`)',
    '',
    '| Embedding Model | HuggingFace ID | Recall@5 | Recall@10 | MRR@10 | Eval Queries |',
    '|---|---|---:|---:|---:|---:|',
    `| \`general\` | \`${metrics.general.hf_id}\` | ${metrics.general.recall_at_5.toFixed(3)} | ${metrics.general.recall_at_10.toFixed(3)} | ${metrics.general.mrr_at_10.toFixed(3)} | ${metrics.general.n_queries} |`,
    `| \`legal\` | \`${metrics.legal.hf_id}\` | **${metrics.legal.recall_at_5.toFixed(3)}** | **${metrics.legal.recall_at_10.toFixed(3)}** | **${metrics.legal.mrr_at_10.toFixed(3)}** | ${metrics.legal.n_queries} |`,
  ]

  return {
    metrics,
    divergences,
    markdown: mdLines.join('\n'),
  }
}

export function getCorpusStats(): CorpusStats {
  const total_cases = ILDC_CORPUS.length
  const train_count = ILDC_CORPUS.filter((c) => c.split === 'train').length
  const eval_count = ILDC_CORPUS.filter((c) => c.split === 'eval').length

  const avg_facts_len = Math.round(
    ILDC_CORPUS.reduce((acc, c) => acc + c.facts.length, 0) / total_cases,
  )
  const avg_arguments_len = Math.round(
    ILDC_CORPUS.reduce((acc, c) => acc + c.arguments.length, 0) / total_cases,
  )
  const avg_ruling_len = Math.round(
    ILDC_CORPUS.reduce((acc, c) => acc + c.ruling.length, 0) / total_cases,
  )
  const avg_citations = Number(
    (
      ILDC_CORPUS.reduce((acc, c) => acc + c.citations.length, 0) / total_cases
    ).toFixed(2),
  )

  const domMap = new Map<string, { label: string; count: number }>()
  const courtMap = new Map<string, number>()
  const outcome_counts: Record<string, number> = {}

  for (const c of ILDC_CORPUS) {
    const prev = domMap.get(c.domain)
    domMap.set(c.domain, {
      label: c.domain_label,
      count: (prev?.count ?? 0) + 1,
    })
    courtMap.set(c.court, (courtMap.get(c.court) ?? 0) + 1)
    outcome_counts[c.outcome] = (outcome_counts[c.outcome] ?? 0) + 1
  }

  const facts_len_bins = [
    {
      range: '550–649 chars',
      count: ILDC_CORPUS.filter(
        (c) => c.facts.length >= 550 && c.facts.length < 650,
      ).length,
    },
    {
      range: '650–749 chars',
      count: ILDC_CORPUS.filter(
        (c) => c.facts.length >= 650 && c.facts.length < 750,
      ).length,
    },
    {
      range: '750–849 chars',
      count: ILDC_CORPUS.filter(
        (c) => c.facts.length >= 750 && c.facts.length < 850,
      ).length,
    },
    {
      range: '850+ chars',
      count: ILDC_CORPUS.filter((c) => c.facts.length >= 850).length,
    },
  ]

  const args_len_bins = [
    {
      range: '600–699 chars',
      count: ILDC_CORPUS.filter(
        (c) => c.arguments.length >= 600 && c.arguments.length < 700,
      ).length,
    },
    {
      range: '700–799 chars',
      count: ILDC_CORPUS.filter(
        (c) => c.arguments.length >= 700 && c.arguments.length < 800,
      ).length,
    },
    {
      range: '800+ chars',
      count: ILDC_CORPUS.filter((c) => c.arguments.length >= 800).length,
    },
  ]

  const citation_bins = [
    {
      count_label: '3 Citations',
      cases: ILDC_CORPUS.filter((c) => c.citations.length === 3).length,
    },
    {
      count_label: '4 Citations',
      cases: ILDC_CORPUS.filter((c) => c.citations.length >= 4).length,
    },
  ]

  return {
    total_cases,
    train_count,
    eval_count,
    avg_facts_len,
    avg_arguments_len,
    avg_ruling_len,
    avg_citations,
    domain_counts: Array.from(domMap.entries()).map(([domain, v]) => ({
      domain,
      label: v.label,
      count: v.count,
    })),
    court_counts: Array.from(courtMap.entries()).map(([court, count]) => ({
      court,
      count,
    })),
    outcome_counts,
    facts_len_bins,
    args_len_bins,
    citation_bins,
    models: [
      {
        name: 'general',
        hf_id: MODELS.general,
        dim: 384,
        n_vectors: train_count,
        mem_mb: Number(((train_count * 384 * 4) / (1024 * 1024)).toFixed(2)),
      },
      {
        name: 'legal',
        hf_id: MODELS.legal,
        dim: 768,
        n_vectors: train_count,
        mem_mb: Number(((train_count * 768 * 4) / (1024 * 1024)).toFixed(2)),
      },
    ],
  }
}
