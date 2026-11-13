import { type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import {
  compareModels,
  extractPatterns,
  getCorpusStats,
  getEvaluationReport,
  queryCases,
} from '~/lib/ildc-engine'
import { analyzeIntakeFacts, runAutonomousResearch } from '~/lib/legal-agent'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') || 'stats'

  if (mode === 'eval') {
    return Response.json(getEvaluationReport())
  }
  if (mode === 'retrieve') {
    const q = url.searchParams.get('q') || ''
    const k = Number(url.searchParams.get('k') || '5')
    const comparison = compareModels(q, k)
    const patterns = extractPatterns(comparison.legal)
    return Response.json({ comparison, patterns })
  }

  return Response.json({
    status: 'ok',
    engine: 'ILDC Dual-Runtime Hybrid (law-ai/InLegalBERT + MiniLM-L6-v2)',
    stats: getCorpusStats(),
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json().catch(() => ({}))
  const actionType = body.action || 'research'
  const facts = String(body.facts || '')
  const refinements = (body.refinements || {}) as Record<string, string>
  const k = Number(body.k || 10)

  if (actionType === 'intake') {
    return Response.json({
      intake: analyzeIntakeFacts(facts),
    })
  }

  if (actionType === 'retrieve') {
    const modelName = body.model === 'general' ? 'general' : 'legal'
    const hits = queryCases(facts, modelName, k)
    const patterns = extractPatterns(hits)
    return Response.json({ hits, patterns })
  }

  const result = runAutonomousResearch(facts, refinements, k)
  return Response.json(result)
}
