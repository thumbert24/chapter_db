import { createClient } from '@/lib/supabase-server'
import { MapPin, CheckSquare, Shield, GraduationCap, Users, FileCheck, AlertTriangle, Mail } from 'lucide-react'
import { SectionHeader, Table, Th, Td, Badge } from '@/components/ui'
import styles from './page.module.css'

export default async function ReportsPage() {
  const supabase = createClient()

  const [
    { data: voters },
    { data: youthEligible },
    { data: emailBounces },
  ] = await Promise.all([
    supabase.from('v_voter_eligible').select('*'),
    supabase.from('v_youth_eligible').select('*'),
    supabase.from('v_email_bounces').select('*'),
  ])

  const REPORTS = [
    {
      icon: <MapPin size={20} />,
      name: 'Brothers by Location',
      desc: 'Filter brothers by city, zip code, or metro area for event and outreach targeting.',
      href: '/dashboard/members'
    },
    {
      icon: <CheckSquare size={20} />,
      name: 'Voter Eligibility',
      desc: `${voters?.length ?? 0} brothers currently eligible to vote. Financial, dues current, and grand tax paid.`,
      href: '#voter'
    },
    {
      icon: <Shield size={20} />,
      name: 'Youth Program Eligible',
      desc: `${youthEligible?.length ?? 0} brothers with a cleared, non-expired BGC approved for youth events.`,
      href: '#youth'
    },
    {
      icon: <GraduationCap size={20} />,
      name: 'Alumni by Institution',
      desc: 'Find brothers who attended a specific college or university.',
      href: '/dashboard/members'
    },
    {
      icon: <Users size={20} />,
      name: 'Program Volunteers',
      desc: 'Brothers by national program interest and current volunteer involvement.',
      href: '/dashboard/members'
    },
    {
      icon: <FileCheck size={20} />,
      name: 'Compliance Summary',
      desc: 'Chapter-wide snapshot of all certification, BGC, and financial compliance.',
      href: '/dashboard/compliance'
    },
    {
      icon: <AlertTriangle size={20} />,
      name: 'Non-Compliant Brothers',
      desc: 'All brothers with 2+ outstanding compliance items requiring follow-up.',
      href: '/dashboard/compliance'
    },
    {
      icon: <Mail size={20} />,
      name: 'Email Bounce List',
      desc: `${emailBounces?.length ?? 0} email addresses bouncing. Resolve before next communication blast.`,
      href: '#bounces'
    },
  ]

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.sub}>Quick-access reports and data views for chapter operations</p>
        </div>
      </div>

      <SectionHeader title="Quick Reports" />
      <div className={styles.reportGrid}>
        {REPORTS.map(r => (
          <a key={r.name} href={r.href} className={styles.reportCard}>
            <div className={styles.reportIcon}>{r.icon}</div>
            <div className={styles.reportName}>{r.name}</div>
            <div className={styles.reportDesc}>{r.desc}</div>
          </a>
        ))}
      </div>

      <div className={styles.spacer} />

      <SectionHeader title="Voter Eligible Brothers" />
      <Table>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>City</Th><Th>State</Th><Th>Status</Th></tr></thead>
        <tbody>
          {(voters ?? []).map((r: any) => (
            <tr key={r.id}>
              <Td>{r.full_name}</Td>
              <Td style={{color:'var(--text-muted)',fontSize:'12px'}}>{r.email_primary}</Td>
              <Td>{r.city ?? '—'}</Td>
              <Td>{r.state ?? '—'}</Td>
              <Td><Badge variant="green">Eligible</Badge></Td>
            </tr>
          ))}
          {(voters ?? []).length === 0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--text-dim)',fontSize:'13px'}}>No eligible voters found.</td></tr>}
        </tbody>
      </Table>

      <div className={styles.spacer} />

      <SectionHeader title="Youth Program Eligible" />
      <Table>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>BGC Expires</Th></tr></thead>
        <tbody>
          {(youthEligible ?? []).map((r: any) => (
            <tr key={r.id}>
              <Td>{r.full_name}</Td>
              <Td style={{color:'var(--text-muted)',fontSize:'12px'}}>{r.email_primary}</Td>
              <Td>{r.phone_mobile ?? '—'}</Td>
              <Td>{r.bgc_expires ? new Date(r.bgc_expires).toLocaleDateString() : '—'}</Td>
            </tr>
          ))}
          {(youthEligible ?? []).length === 0 && <tr><td colSpan={4} style={{textAlign:'center',padding:'2rem',color:'var(--text-dim)',fontSize:'13px'}}>No youth-eligible brothers found.</td></tr>}
        </tbody>
      </Table>

      {(emailBounces ?? []).length > 0 && (
        <>
          <div className={styles.spacer} />
          <SectionHeader title="Email Bounces — Needs Attention" />
          <Table>
            <thead><tr><Th>Name</Th><Th>Primary Email</Th><Th>Secondary Email</Th><Th>Phone</Th><Th>Bounce Date</Th></tr></thead>
            <tbody>
              {(emailBounces ?? []).map((r: any) => (
                <tr key={r.id}>
                  <Td>{r.full_name}</Td>
                  <Td><Badge variant="red">{r.email_primary}</Badge></Td>
                  <Td style={{color:'var(--text-muted)',fontSize:'12px'}}>{r.email_secondary ?? '—'}</Td>
                  <Td>{r.phone_mobile ?? '—'}</Td>
                  <Td>{r.email_bounce_date ? new Date(r.email_bounce_date).toLocaleDateString() : '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  )
}
