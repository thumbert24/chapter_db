import { createClient } from '@/lib/supabase-server'
import { Badge, StatsRow, StatCard, SectionHeader, Table, Th, Td, Button } from '@/components/ui'
import type { ComplianceSnapshot } from '@/types'
import styles from './page.module.css'

function certBadge(v: string | null | undefined) {
  if (!v || v === 'not_filed') return <Badge variant="dim">Not Filed</Badge>
  if (v === 'current')  return <Badge variant="green">Current</Badge>
  if (v === 'pending')  return <Badge variant="amber">Pending</Badge>
  if (v === 'expired')  return <Badge variant="red">Expired</Badge>
  if (v === 'waived')   return <Badge variant="blue">Waived</Badge>
  return <Badge variant="dim">{v}</Badge>
}

function bgcBadge(v: string | null | undefined) {
  if (!v)              return <Badge variant="dim">Not Filed</Badge>
  if (v === 'clear')   return <Badge variant="green">Clear</Badge>
  if (v === 'pending') return <Badge variant="amber">Pending</Badge>
  if (v === 'in_progress') return <Badge variant="amber">In Progress</Badge>
  if (v === 'expired') return <Badge variant="red">Expired</Badge>
  if (v === 'flagged') return <Badge variant="red">Flagged</Badge>
  return <Badge variant="dim">{v}</Badge>
}

export default async function CompliancePage() {
  const supabase = createClient()
  const { data: rows } = await supabase.from('v_compliance_snapshot').select('*').returns<ComplianceSnapshot[]>()
  const data = rows ?? []
  const total = data.length

  const fullyCompliant = data.filter(r =>
    r.imdp_status === 'current' &&
    r.risk_mgmt_status === 'current' &&
    r.ritual_status === 'current' &&
    r.bgc_result === 'clear' &&
    r.bgc_expires && new Date(r.bgc_expires) > new Date()
  ).length

  const partial = data.filter(r => {
    const issues = [
      r.imdp_status !== 'current',
      r.risk_mgmt_status !== 'current',
      r.ritual_status !== 'current',
      r.bgc_result !== 'clear',
    ].filter(Boolean).length
    return issues === 1 || issues === 2
  }).length

  const nonCompliant = data.filter(r => {
    const issues = [
      r.imdp_status !== 'current',
      r.risk_mgmt_status !== 'current',
      r.ritual_status !== 'current',
      r.bgc_result !== 'clear',
    ].filter(Boolean).length
    return issues >= 3
  }).length

  const youthEligible = data.filter(r =>
    r.youth_eligible &&
    r.bgc_result === 'clear' &&
    r.bgc_expires && new Date(r.bgc_expires) > new Date()
  ).length

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Compliance</h1>
          <p className={styles.sub}>Certifications, background checks, and standing</p>
        </div>
        <Button variant="secondary">Export Report</Button>
      </div>

      <StatsRow>
        <StatCard label="Fully Compliant"  value={fullyCompliant} sub="All certs + BGC current" variant="good" />
        <StatCard label="Partial"          value={partial}        sub="1–2 items missing"       variant="warn" />
        <StatCard label="Non-Compliant"    value={nonCompliant}   sub="3+ items overdue"        variant="danger" />
        <StatCard label="Youth Eligible"   value={youthEligible}  sub="BGC cleared + current"   variant={youthEligible > 0 ? 'good' : 'warn'} />
      </StatsRow>

      <SectionHeader title="Certification Status by Member" />
      <Table>
        <thead>
          <tr>
            <Th>Brother</Th>
            <Th>IMDP</Th>
            <Th>Risk Mgmt</Th>
            <Th>Ritual</Th>
            <Th>BGC Result</Th>
            <Th>BGC Expires</Th>
            <Th>Youth Eligible</Th>
            <Th>Financial</Th>
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <Td>{r.full_name}</Td>
              <Td>{certBadge(r.imdp_status)}</Td>
              <Td>{certBadge(r.risk_mgmt_status)}</Td>
              <Td>{certBadge(r.ritual_status)}</Td>
              <Td>{bgcBadge(r.bgc_result)}</Td>
              <Td>
                {r.bgc_expires
                  ? <span style={{ color: new Date(r.bgc_expires) < new Date() ? 'var(--red)' : 'var(--text)' }}>
                      {new Date(r.bgc_expires).toLocaleDateString()}
                    </span>
                  : <span style={{ color: 'var(--text-dim)' }}>—</span>}
              </Td>
              <Td>
                <Badge variant={r.youth_eligible && r.bgc_expires && new Date(r.bgc_expires) > new Date() ? 'green' : 'red'}>
                  {r.youth_eligible && r.bgc_expires && new Date(r.bgc_expires) > new Date() ? 'Yes' : 'No'}
                </Badge>
              </Td>
              <Td>
                <Badge variant={r.financial_standing ? 'green' : 'red'}>
                  {r.financial_standing ? 'Financial' : 'Non-Financial'}
                </Badge>
              </Td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '13px' }}>No compliance data found.</td></tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}
