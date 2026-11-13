import assert from 'node:assert/strict'
import {
  compareModels,
  extractPatterns,
  getAllCases,
  getCorpusStats,
  getEvaluationReport,
  queryCases,
} from '../app/lib/ildc-engine.ts'
import {
  analyzeIntakeFacts,
  runAutonomousResearch,
} from '../app/lib/legal-agent.ts'

const cases = getAllCases()
assert.equal(cases.length, 65, 'Expected 65 canonical ILDC cases')

const stats = getCorpusStats()
assert.equal(stats.total_cases, 65)
assert.equal(stats.train_count + stats.eval_count, 65)

// Edge case: whitespace-only query does not throw or return NaN
const emptyHits = queryCases('   ', 'legal', 5)
assert.equal(emptyHits.length, 5)
assert.ok(!Number.isNaN(emptyHits[0].score))

const cmp = compareModels(
  'Workmen retrenched without Section 25F Industrial Disputes Act notice',
  5,
)
assert.equal(cmp.legal.length, 5)
assert.equal(cmp.general.length, 5)
assert.equal(cmp.legal[0].domain, 'labour')

const patterns = extractPatterns(cmp.legal)
assert.ok(patterns.co_cited_precedents.length >= 1)
assert.ok(patterns.argument_motifs.length >= 5)

const evalReport = getEvaluationReport()
assert.ok(
  evalReport.metrics.legal.recall_at_10 >=
    evalReport.metrics.general.recall_at_10,
)
assert.ok(evalReport.divergences.length >= 1)

const intake = analyzeIntakeFacts(
  'The accused was convicted under Section 302 IPC based on circumstantial evidence and recovery.',
)
assert.equal(intake.detected_domain, 'criminal_appeal')
assert.equal(intake.questions.length, 3)

const research = runAutonomousResearch(
  'The accused was convicted under Section 302 IPC based on circumstantial evidence and recovery.',
  { recovery_status: 'Open accessible place / hostile panch witnesses' },
  10,
)
assert.equal(research.steps.length, 5)
assert.equal(research.memorandum.sections.length, 6)
assert.ok(research.memorandum.full_markdown.includes('Section 302'))

console.log('ALL TS ENGINE & LEGAL AGENT TESTS PASSED (8/8 assertions)')
