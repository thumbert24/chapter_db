'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Search, Plus, ChevronRight } from 'lucide-react'
import type { Member } from '@/types'
import { Badge, Button, Input, Modal, Field, Select, Loading, EmptyState, SectionHeader } from '@/components/ui'
import styles from './page.module.css'

const STATUSES: Member['membership_status'][] = ['active','inactive','suspended','deceased','honorary','life']
const TYPES: Member['membership_type'][]       = ['graduate','undergraduate_affiliate','honorary','life']
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

function statusBadge(s: Member['membership_status']) {
  const map: Record<string, 'green'|'amber'|'red'|'dim'> = {
    active: 'green', inactive: 'dim', suspended: 'red', honorary: 'gold' as any, deceased: 'dim', life: 'blue' as any
  }
  return <Badge variant={map[s] ?? 'dim'}>{s}</Badge>
}

function initials(m: Member) {
  return ((m.first_name?.[0] ?? '') + (m.last_name?.[0] ?? '')).toUpperCase()
}

const BLANK: Partial<Member> = {
  first_name: '', last_name: '', email_primary: '', phone_mobile: '',
  city: '', state: '', membership_status: 'active', membership_type: 'graduate'
}

export default function MembersPage() {
  const supabase = createClient()
  const [members, setMembers]   = useState<Member[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<'all'|'financial'|'bounced'|'inactive'>('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState<Partial<Member>>(BLANK)
  const [saving, setSaving]     = useState(false)
  const [selected, setSelected] = useState<Member | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('members').select('*').order('last_name')
    if (filter === 'financial') q = q.eq('financial_standing', true)
    if (filter === 'bounced')   q = q.eq('email_bounced', true)
    if (filter === 'inactive')  q = q.eq('membership_status', 'inactive')
    const { data } = await q
    setMembers(data ?? [])
    setLoading(false)
  }, [filter, supabase])

  useEffect(() => { load() }, [load])

  const filtered = members.filter(m => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(s) ||
      m.email_primary.toLowerCase().includes(s) ||
      (m.city ?? '').toLowerCase().includes(s) ||
      (m.employer ?? '').toLowerCase().includes(s)
    )
  })

  async function save() {
    if (!form.first_name || !form.last_name || !form.email_primary) return
    setSaving(true)
    if (selected) {
      await supabase.from('members').update(form).eq('id', selected.id)
    } else {
      await supabase.from('members').insert(form)
    }
    setSaving(false)
    setShowModal(false)
    setForm(BLANK)
    setSelected(null)
    load()
  }

  function openEdit(m: Member) {
    setSelected(m)
    setForm(m)
    setShowModal(true)
  }

  function openNew() {
    setSelected(null)
    setForm(BLANK)
    setShowModal(true)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Members</h1>
          <p className={styles.sub}>{filtered.length} of {members.length} shown</p>
        </div>
        <Button variant="primary" onClick={openNew}><Plus size={13} /> Add Member</Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <Input
            placeholder="Search name, city, employer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          {(['all','financial','bounced','inactive'] as const).map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState message="No members match your search." /> : (
        <div className={styles.grid}>
          {filtered.map(m => (
            <div key={m.id} className={styles.memberCard} onClick={() => openEdit(m)}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>{initials(m)}</div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>{m.first_name} {m.last_name}</div>
                  <div className={styles.memberEmail}>{m.email_primary}</div>
                </div>
                <ChevronRight size={14} className={styles.arrow} />
              </div>
              <div className={styles.cardMeta}>
                {m.city && m.state && <span className={styles.metaItem}>{m.city}, {m.state}</span>}
                {m.employer && <span className={styles.metaItem}>{m.employer}</span>}
              </div>
              <div className={styles.cardTags}>
                {statusBadge(m.membership_status)}
                <Badge variant={m.financial_standing ? 'green' : 'red'}>{m.financial_standing ? 'Financial' : 'Non-Financial'}</Badge>
                {m.email_bounced && <Badge variant="amber">Email Bounce</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={selected ? 'Edit Member' : 'Add Member'} onClose={() => { setShowModal(false); setSelected(null) }}>
          <div className={styles.formGrid}>
            <Field label="First Name">
              <Input value={form.first_name ?? ''} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} />
            </Field>
            <Field label="Last Name">
              <Input value={form.last_name ?? ''} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} />
            </Field>
            <Field label="Primary Email">
              <Input type="email" value={form.email_primary ?? ''} onChange={e => setForm(f => ({...f, email_primary: e.target.value}))} />
            </Field>
            <Field label="Mobile Phone">
              <Input value={form.phone_mobile ?? ''} onChange={e => setForm(f => ({...f, phone_mobile: e.target.value}))} />
            </Field>
            <Field label="City">
              <Input value={form.city ?? ''} onChange={e => setForm(f => ({...f, city: e.target.value}))} />
            </Field>
            <Field label="State">
              <Select value={form.state ?? ''} onChange={e => setForm(f => ({...f, state: e.target.value}))}>
                <option value="">Select state</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Employer">
              <Input value={form.employer ?? ''} onChange={e => setForm(f => ({...f, employer: e.target.value}))} />
            </Field>
            <Field label="Occupation">
              <Input value={form.occupation ?? ''} onChange={e => setForm(f => ({...f, occupation: e.target.value}))} />
            </Field>
            <Field label="Member Number">
              <Input value={form.member_number ?? ''} onChange={e => setForm(f => ({...f, member_number: e.target.value}))} />
            </Field>
            <Field label="Chapter Initiated">
              <Input value={form.chapter_initiated ?? ''} onChange={e => setForm(f => ({...f, chapter_initiated: e.target.value}))} />
            </Field>
            <Field label="Initiated Date">
              <Input type="date" value={form.initiated_date ?? ''} onChange={e => setForm(f => ({...f, initiated_date: e.target.value}))} />
            </Field>
            <Field label="Membership Status">
              <Select value={form.membership_status ?? 'active'} onChange={e => setForm(f => ({...f, membership_status: e.target.value as any}))}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Membership Type">
              <Select value={form.membership_type ?? 'graduate'} onChange={e => setForm(f => ({...f, membership_type: e.target.value as any}))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => { setShowModal(false); setSelected(null) }}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : selected ? 'Save Changes' : 'Add Member'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
