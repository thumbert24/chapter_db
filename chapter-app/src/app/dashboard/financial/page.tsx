import { createClient } from '@/lib/supabase-server'
import { Badge, StatsRow, StatCard, SectionHeader, Table, Th, Td, Button } from '@/components/ui'
import styles from './page.module.css'

export default async function FinancialPage() {
  const supabase = createClient()

  const currentYear = '2024-25'

  const [
    { data: duesRows },
    { data: taxRows },
    { data: voters },
  ] = await Promise.all([
    supabase.from('dues_payments')
      .select('*, members(first_name, last_name, email_primary)')
      .eq('fiscal_year', currentYear)
      .order('created_at', { ascending: false }),
    supabase.from('grand_tax')
      .select('*, members(first_name, last_name)')
      .eq('fiscal_year', currentYear),
    supabase.from('v_voter_eligible').select('*'),
  ])

  const dues = duesRows ?? []
  const tax  = taxRows  ?? []

  const totalDuesOwed    = dues.reduce((s, r) => s + Number(r.amount_owed), 0)
  const totalDuesPaid    = dues.reduce((s, r) => s + Number(r.amount_paid), 0)
  const totalDuesOutstanding = dues.filter(r => r.payment_status !== 'paid').reduce((s, r) => s + (Number(r.amount_owed) - Number(r.amount_paid)), 0)
  const collectionRate   = totalDuesOwed > 0 ? Math.round((totalDuesPaid / totalDuesOwed) * 100) : 0
  const totalTaxOutstanding = tax.filter(r => r.payment_status !== 'paid').reduce((s, r) => s + (Number(r.amount_owed) - Number(r.amount_paid)), 0)

  function payBadge(s: string) {
    if (s === 'paid')        return <Badge variant="green">Paid</Badge>
    if (s === 'partial')     return <Badge variant="amber">Partial</Badge>
    if (s === 'outstanding') return <Badge variant="red">Outstanding</Badge>
    if (s === 'waived')      return <Badge variant="blue">Waived</Badge>
    if (s === 'deferred')    return <Badge variant="dim">Deferred</Badge>
    return <Badge variant="dim">{s}</Badge>
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Financial</h1>
          <p className={styles.sub}>Dues, Grand Tax, and voter eligibility — FY {currentYear}</p>
        </div>
        <Button variant="secondary">Export Ledger</Button>
      </div>

      <StatsRow>
        <StatCard label="Financial Brothers" value={voters?.length ?? 0}          sub="Voting eligible"         variant="good" />
        <StatCard label="Dues Outstanding"   value={`$${totalDuesOutstanding.toLocaleString()}`} sub={`${dues.filter(r=>r.payment_status!=='paid').length} brothers`} variant="warn" />
        <StatCard label="Grand Tax Owed"     value={`$${totalTaxOutstanding.toLocaleString()}`}  sub={`${tax.filter(r=>r.payment_status!=='paid').length} unpaid`}    variant="warn" />
        <StatCard label="Collection Rate"    value={`${collectionRate}%`}          sub="Current fiscal year"    variant={collectionRate >= 85 ? 'good' : 'warn'} />
      </StatsRow>

      <SectionHeader title={`Dues — FY ${currentYear}`} />
      <div className={styles.tableWrap}>
        <Table>
          <thead>
            <tr>
              <Th>Brother</Th>
              <Th>Term</Th>
              <Th>Owed</Th>
              <Th>Paid</Th>
              <Th>Balance</Th>
              <Th>Status</Th>
              <Th>Paid Date</Th>
              <Th>Method</Th>
            </tr>
          </thead>
          <tbody>
            {dues.map(r => {
              const balance = Number(r.amount_owed) - Number(r.amount_paid)
              const member = r.members as any
              return (
                <tr key={r.id}>
                  <Td>{member ? `${member.first_name} ${member.last_name}` : '—'}</Td>
                  <Td>{r.term ?? '—'}</Td>
                  <Td>${Number(r.amount_owed).toFixed(2)}</Td>
                  <Td>${Number(r.amount_paid).toFixed(2)}</Td>
                  <Td style={{ color: balance > 0 ? 'var(--red)' : 'var(--green)' }}>${balance.toFixed(2)}</Td>
                  <Td>{payBadge(r.payment_status)}</Td>
                  <Td>{r.paid_date ? new Date(r.paid_date).toLocaleDateString() : <span style={{color:'var(--text-dim)'}}>—</span>}</Td>
                  <Td>{r.payment_method ?? <span style={{color:'var(--text-dim)'}}>—</span>}</Td>
                </tr>
              )
            })}
            {dues.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'2rem',color:'var(--text-dim)',fontSize:'13px'}}>No dues records for {currentYear}.</td></tr>}
          </tbody>
        </Table>
      </div>

      <div className={styles.spacer} />

      <SectionHeader title={`Grand Tax — FY ${currentYear}`} />
      <Table>
        <thead>
          <tr>
            <Th>Brother</Th>
            <Th>Owed</Th>
            <Th>Paid</Th>
            <Th>Status</Th>
            <Th>Paid Date</Th>
            <Th>Confirmation #</Th>
          </tr>
        </thead>
        <tbody>
          {tax.map(r => {
            const member = r.members as any
            return (
              <tr key={r.id}>
                <Td>{member ? `${member.first_name} ${member.last_name}` : '—'}</Td>
                <Td>${Number(r.amount_owed).toFixed(2)}</Td>
                <Td>${Number(r.amount_paid).toFixed(2)}</Td>
                <Td>{payBadge(r.payment_status)}</Td>
                <Td>{r.paid_date ? new Date(r.paid_date).toLocaleDateString() : <span style={{color:'var(--text-dim)'}}>—</span>}</Td>
                <Td>{r.confirmation_number ?? <span style={{color:'var(--text-dim)'}}>—</span>}</Td>
              </tr>
            )
          })}
          {tax.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'var(--text-dim)',fontSize:'13px'}}>No grand tax records for {currentYear}.</td></tr>}
        </tbody>
      </Table>
    </div>
  )
}
