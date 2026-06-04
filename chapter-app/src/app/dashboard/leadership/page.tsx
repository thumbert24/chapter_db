import { createClient } from '@/lib/supabase-server'
import { Badge, StatsRow, StatCard, SectionHeader, Table, Th, Td } from '@/components/ui'
import type { LeadershipRosterRow } from '@/types'
import styles from './page.module.css'

export default async function LeadershipPage() {
  const supabase = createClient()
  const { data: roster } = await supabase
    .from('v_leadership_roster')
    .select('*')
    .returns<LeadershipRosterRow[]>()

  const rows     = roster ?? []
  const execRows = rows.filter(r => r.is_exec_board)
  const commRows = rows.filter(r => !r.is_exec_board)

  function roleBadge(type: string) {
    if (type === 'exec_board')      return <Badge variant="gold">Exec Board</Badge>
    if (type === 'committee_chair') return <Badge variant="blue">Chair</Badge>
    return <Badge variant="dim">{type}</Badge>
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Leadership</h1>
          <p className={styles.sub}>Executive Board and committee assignments — FY 2024–25</p>
        </div>
      </div>

      <StatsRow>
        <StatCard label="Exec Board Seats"   value={execRows.length} sub="Currently filled" variant="good" />
        <StatCard label="Committee Chairs"   value={commRows.length} sub="Active committees" />
        <StatCard label="Total Roles Filled" value={rows.length}     sub="Current term" />
        <StatCard label="Vacancies"          value={Math.max(0, 12 - execRows.length)} sub="Board positions open" variant={execRows.length < 12 ? 'warn' : 'good'} />
      </StatsRow>

      <SectionHeader title="Executive Board" />
      <div className={styles.tableWrap}>
        <Table>
          <thead>
            <tr>
              <Th>Position</Th>
              <Th>Brother</Th>
              <Th>Email</Th>
              <Th>Term</Th>
              <Th>Since</Th>
            </tr>
          </thead>
          <tbody>
            {execRows.map((r, i) => (
              <tr key={i}>
                <Td><Badge variant="gold">{r.role_name}</Badge></Td>
                <Td>{r.brother_name}</Td>
                <Td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{r.email_primary}</Td>
                <Td>{r.term_year ?? '—'}</Td>
                <Td>{r.start_date ? new Date(r.start_date).toLocaleDateString() : '—'}</Td>
              </tr>
            ))}
            {execRows.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--text-dim)',fontSize:'13px'}}>No exec board assignments found.</td></tr>}
          </tbody>
        </Table>
      </div>

      <div className={styles.spacer} />
      <SectionHeader title="Committee Chairs" />
      <Table>
        <thead>
          <tr>
            <Th>Committee</Th>
            <Th>Chair</Th>
            <Th>Email</Th>
            <Th>Term</Th>
          </tr>
        </thead>
        <tbody>
          {commRows.map((r, i) => (
            <tr key={i}>
              <Td>{r.committee_name ?? r.role_name}</Td>
              <Td>{r.brother_name}</Td>
              <Td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{r.email_primary}</Td>
              <Td>{r.term_year ?? '—'}</Td>
            </tr>
          ))}
          {commRows.length === 0 && <tr><td colSpan={4} style={{textAlign:'center',padding:'2rem',color:'var(--text-dim)',fontSize:'13px'}}>No committee assignments found.</td></tr>}
        </tbody>
      </Table>
    </div>
  )
}
