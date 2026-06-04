'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Plus, Calendar } from 'lucide-react'
import type { Event } from '@/types'
import { Badge, StatsRow, StatCard, SectionHeader, Table, Th, Td, Button, Modal, Field, Input, Select, Textarea, Loading, EmptyState } from '@/components/ui'
import styles from './page.module.css'

const EVENT_TYPES: Event['event_type'][] = ['chapter_meeting','community_service','social','fundraiser','scholarship','fraternal','national','other']
const BLANK: Partial<Event> = {
  event_name: '', event_type: 'chapter_meeting', event_date: '',
  location: '', description: '', requires_approval: false,
  requires_insurance: false, requires_bgc: false, approval_status: 'draft'
}

function typeBadge(t: string) {
  const map: Record<string, 'gold'|'blue'|'green'|'dim'> = {
    chapter_meeting: 'dim', community_service: 'blue', social: 'gold',
    fundraiser: 'blue', scholarship: 'green', fraternal: 'gold', national: 'gold', other: 'dim'
  }
  return <Badge variant={map[t] ?? 'dim'}>{t.replace('_', ' ')}</Badge>
}

function approvalBadge(s: string) {
  if (s === 'approved') return <Badge variant="green">Approved</Badge>
  if (s === 'pending')  return <Badge variant="amber">Pending</Badge>
  if (s === 'denied')   return <Badge variant="red">Denied</Badge>
  if (s === 'draft')    return <Badge variant="dim">Draft</Badge>
  return <Badge variant="dim">{s}</Badge>
}

export default function EventsPage() {
  const supabase = createClient()
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]       = useState<Partial<Event>>(BLANK)
  const [saving, setSaving]   = useState(false)
  const [selected, setSelected] = useState<Event | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').order('event_date')
    setEvents(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const upcoming = events.filter(e => e.event_date >= today)
  const past     = events.filter(e => e.event_date < today)
  const pending  = events.filter(e => e.approval_status === 'pending' || e.approval_status === 'draft')

  async function save() {
    if (!form.event_name || !form.event_date) return
    setSaving(true)
    if (selected) {
      await supabase.from('events').update(form).eq('id', selected.id)
    } else {
      await supabase.from('events').insert(form)
    }
    setSaving(false)
    setShowModal(false)
    setForm(BLANK)
    setSelected(null)
    load()
  }

  function openEdit(e: Event) { setSelected(e); setForm(e); setShowModal(true) }
  function openNew()          { setSelected(null); setForm(BLANK); setShowModal(true) }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Events</h1>
          <p className={styles.sub}>Event planning, approvals, and attendance tracking</p>
        </div>
        <Button variant="primary" onClick={openNew}><Plus size={13} /> New Event</Button>
      </div>

      <StatsRow>
        <StatCard label="Events This Year"    value={events.length}   sub="Total on record" />
        <StatCard label="Upcoming"            value={upcoming.length} sub="Scheduled events" variant="good" />
        <StatCard label="Pending Approval"    value={pending.length}  sub="Need action"      variant={pending.length > 0 ? 'warn' : 'good'} />
        <StatCard label="Youth Events"        value={events.filter(e => e.requires_bgc).length} sub="BGC required" variant="amber" as any />
      </StatsRow>

      <SectionHeader title="Upcoming Events" action="New Event" onAction={openNew} />
      {loading ? <Loading /> : upcoming.length === 0 ? <EmptyState message="No upcoming events." /> : (
        <div className={styles.tableWrap}>
          <Table>
            <thead>
              <tr><Th>Date</Th><Th>Event</Th><Th>Type</Th><Th>Location</Th><Th>Approval</Th><Th>Insurance</Th><Th>BGC Req.</Th><Th></Th></tr>
            </thead>
            <tbody>
              {upcoming.map(e => (
                <tr key={e.id}>
                  <Td>{new Date(e.event_date).toLocaleDateString()}</Td>
                  <Td>{e.event_name}</Td>
                  <Td>{typeBadge(e.event_type)}</Td>
                  <Td>{e.location ?? <span style={{color:'var(--text-dim)'}}>TBD</span>}</Td>
                  <Td>{approvalBadge(e.approval_status)}</Td>
                  <Td><Badge variant={e.insurance_filed ? 'green' : e.requires_insurance ? 'red' : 'dim'}>{e.insurance_filed ? 'Filed' : e.requires_insurance ? 'Required' : 'N/A'}</Badge></Td>
                  <Td><Badge variant={e.requires_bgc ? 'amber' : 'dim'}>{e.requires_bgc ? 'Yes' : 'No'}</Badge></Td>
                  <Td><button style={{background:'none',border:'none',color:'var(--gold)',cursor:'pointer',fontSize:'12px'}} onClick={() => openEdit(e)}>Edit</button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {past.length > 0 && (
        <>
          <div className={styles.spacer} />
          <SectionHeader title="Past Events" />
          <Table>
            <thead>
              <tr><Th>Date</Th><Th>Event</Th><Th>Type</Th><Th>Location</Th><Th>Status</Th></tr>
            </thead>
            <tbody>
              {past.slice(0, 10).map(e => (
                <tr key={e.id}>
                  <Td>{new Date(e.event_date).toLocaleDateString()}</Td>
                  <Td>{e.event_name}</Td>
                  <Td>{typeBadge(e.event_type)}</Td>
                  <Td>{e.location ?? '—'}</Td>
                  <Td>{approvalBadge(e.approval_status)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {showModal && (
        <Modal title={selected ? 'Edit Event' : 'New Event'} onClose={() => { setShowModal(false); setSelected(null) }}>
          <div className={styles.formGrid}>
            <Field label="Event Name">
              <Input value={form.event_name ?? ''} onChange={e => setForm(f => ({...f, event_name: e.target.value}))} style={{gridColumn: '1 / -1'}} />
            </Field>
            <Field label="Event Type">
              <Select value={form.event_type ?? 'other'} onChange={e => setForm(f => ({...f, event_type: e.target.value as any}))}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </Select>
            </Field>
            <Field label="Event Date">
              <Input type="date" value={form.event_date ?? ''} onChange={e => setForm(f => ({...f, event_date: e.target.value}))} />
            </Field>
            <Field label="End Date">
              <Input type="date" value={form.end_date ?? ''} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} />
            </Field>
            <Field label="Location">
              <Input value={form.location ?? ''} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
            </Field>
            <Field label="Approval Status">
              <Select value={form.approval_status ?? 'draft'} onChange={e => setForm(f => ({...f, approval_status: e.target.value as any}))}>
                {['draft','pending','approved','denied','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Description">
              <Textarea value={form.description ?? ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </Field>
          </div>
          <div style={{display:'flex', gap:'1.5rem', margin:'12px 0'}}>
            {([['requires_approval','Requires Approval'],['requires_insurance','Requires Insurance'],['requires_bgc','BGC Required'],['insurance_filed','Insurance Filed']] as [keyof Event, string][]).map(([key, label]) => (
              <label key={key} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--text-muted)',cursor:'pointer',fontFamily:'var(--font-display)',letterSpacing:'0.06em'}}>
                <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.checked}))} />
                {label}
              </label>
            ))}
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => { setShowModal(false); setSelected(null) }}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : selected ? 'Save Changes' : 'Create Event'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
