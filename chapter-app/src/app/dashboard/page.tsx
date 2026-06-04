import { createClient } from '@/lib/supabase-server'
import { StatCard, StatsRow, Card, CardTitle, SectionHeader, ProgressBar, Table, Th, Td, Badge } from '@/components/ui'
import styles from './page.module.css'

function statusBadge(v: string | null | undefined) {
  if (!v) return <Badge variant="dim">Not Filed</Badge>
  if (v === 'current') return <Badge variant="green">Current</Badge>
  if (v === 'pending') return <Badge variant="amber">Pending</Badge>
  if (v === 'expired') return <Badge variant="red">Expired</Badge>
  return <Badge variant="dim">{v}</Badge>
}

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { count: totalMembers },
    { count: financialMembers },
    { data: compliance },
    { data: bounces },
    { data: upcomingEvents },
    { data: attentionItems },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'active'),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('financial_standing', true).eq('membership_status', 'active'),
    supabase.from('v_compliance_snapshot').select('*'),
    supabase.from('members').select('id,first_name,last_name,email_primary,email_bounce_date').eq('email_bounced', true),
    supabase.from('events').select('*').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date').limit(4),
    supabase.from('v_compliance_snapshot').select('*').or('imdp_status.eq.not_filed,bgc_result.eq.expired,email_bounced.eq.true').limit(8),
  ])

  const total = totalMembers ?? 0
  const financial = financialMembers ?? 0
  const duesRate = total > 0 ? Math.round((financial / total) * 100) : 0
  const rows = compliance ?? []
  const bgcCurrent = rows.filter(r => r.bgc_result === 'clear' && r.bgc_expires && new Date(r.bgc_expires) > new Date()).length
  const imdpPct     = total > 0 ? Math.round(rows.filter(r => r.imdp_status === 'current').length / total * 100) : 0
  const riskPct     = total > 0 ? Math.round(rows.filter(r => r.risk_mgmt_status === 'current').length / total * 100) : 0
  const ritualPct   = total > 0 ? Math.round(rows.filter(r => r.ritual_status === 'current').length / total * 100) : 0
  const bgcPct      = total > 0 ? Math.round(bgcCurrent / total * 100) : 0
  const taxPct      = total > 0 ? Math.round(rows.filter(r => r.financial_standing).length / total * 100) : 0

  return (
    <div>
      <div className={styles.pageTitle}>
        <h1>Dashboard</h1>
        <p>Chapter overview for FY 2024–25</p>
      </div>

      <StatsRow>
        <StatCard label="Total Members"   value={total}      sub={`${financial} financial`} variant="good" />
        <StatCard label="Dues Collected"  value={`${duesRate}%`} sub={`${total - financial} outstanding`} variant={duesRate >= 85 ? 'good' : 'warn'} />
        <StatCard label="BGC Current"     value={bgcCurrent} sub={`${total - bgcCurrent} expired / pending`} variant={bgcCurrent >= total * 0.8 ? 'good' : 'warn'} />
        <StatCard label="Email Bounces"   value={bounces?.length ?? 0} sub="Need update" variant={(bounces?.length ?? 0) > 0 ? 'danger' : 'good'} />
      </StatsRow>

      <div className={styles.twoCol}>
        <Card>
          <CardTitle>Compliance Overview</CardTitle>
          <ProgressBar label="IMDP Certified"     pct={imdpPct}   variant={imdpPct >= 80 ? 'green' : 'amber'} />
          <ProgressBar label="Risk Management"     pct={riskPct}   variant={riskPct >= 80 ? 'green' : 'amber'} />
          <ProgressBar label="Ritual Training"     pct={ritualPct} variant={ritualPct >= 80 ? 'green' : 'amber'} />
          <ProgressBar label="Background Check"    pct={bgcPct}    variant={bgcPct >= 80 ? 'green' : 'amber'} />
          <ProgressBar label="Grand Tax Current"   pct={taxPct}    variant={taxPct >= 80 ? 'gold' : 'amber'} />
        </Card>

        <Card>
          <CardTitle>Upcoming Events</CardTitle>
          {(upcomingEvents ?? []).length === 0 && <p className={styles.noEvents}>No upcoming events scheduled.</p>}
          {(upcomingEvents ?? []).map(ev => {
            const d = new Date(ev.event_date)
            return (
              <div key={ev.id} className={styles.eventItem}>
                <div className={styles.dateBox}>
                  <span className={styles.month}>{d.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                  <span className={styles.day}>{d.getDate()}</span>
                </div>
                <div>
                  <div className={styles.eventName}>{ev.event_name}</div>
                  <div className={styles.eventMeta}>{ev.location ?? 'Location TBD'} · <Badge variant={ev.approval_status === 'approved' ? 'green' : 'amber'}>{ev.approval_status}</Badge></div>
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      <SectionHeader title="Attention Required" />
      <Table>
        <thead>
          <tr>
            <Th>Brother</Th>
            <Th>Issue</Th>
            <Th>IMDP</Th>
            <Th>Risk Mgmt</Th>
            <Th>BGC</Th>
            <Th>Financial</Th>
          </tr>
        </thead>
        <tbody>
          {(attentionItems ?? []).map(r => (
            <tr key={r.id}>
              <Td>{r.full_name}</Td>
              <Td>
                {r.email_bounced && <Badge variant="red">Email Bounce</Badge>}
                {r.imdp_status === 'not_filed' && <Badge variant="amber">IMDP Missing</Badge>}
                {r.bgc_result === 'expired' && <Badge variant="red">BGC Expired</Badge>}
              </Td>
              <Td>{statusBadge(r.imdp_status)}</Td>
              <Td>{statusBadge(r.risk_mgmt_status)}</Td>
              <Td><Badge variant={r.bgc_result === 'clear' ? 'green' : r.bgc_result === 'expired' ? 'red' : 'amber'}>{r.bgc_result ?? 'Not Filed'}</Badge></Td>
              <Td><Badge variant={r.financial_standing ? 'green' : 'red'}>{r.financial_standing ? 'Financial' : 'Non-Financial'}</Badge></Td>
            </tr>
          ))}
          {(attentionItems ?? []).length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '13px' }}>All brothers are in good standing.</td></tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}
