'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Plus, Download, FileText } from 'lucide-react'
import type { Document, DocCategory } from '@/types'
import { Badge, SectionHeader, Table, Th, Td, Button, Modal, Field, Input, Select, Textarea, Loading, EmptyState } from '@/components/ui'
import styles from './page.module.css'

const CATEGORIES: DocCategory[] = [
  'constitution_bylaws','financial_policy','minutes','calendar',
  'strategic_plan','historical','compliance','operational','other'
]

const BLANK: Partial<Document> = {
  title: '', doc_category: 'other', version: '',
  description: '', is_current: true
}

function catBadge(c: string) {
  const map: Record<string, 'gold'|'blue'|'green'|'dim'> = {
    constitution_bylaws: 'gold', financial_policy: 'blue', strategic_plan: 'gold',
    compliance: 'blue', historical: 'dim', minutes: 'dim', calendar: 'dim',
    operational: 'green', other: 'dim'
  }
  return <Badge variant={map[c] ?? 'dim'}>{c.replace(/_/g, ' ')}</Badge>
}

export default function DocumentsPage() {
  const supabase = createClient()
  const [docs, setDocs]         = useState<Document[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState<Partial<Document>>(BLANK)
  const [saving, setSaving]     = useState(false)
  const [catFilter, setCatFilter] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
    setDocs(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const filtered = catFilter === 'all' ? docs : docs.filter(d => d.doc_category === catFilter)

  async function save() {
    if (!form.title) return
    setSaving(true)
    await supabase.from('documents').insert(form)
    setSaving(false)
    setShowModal(false)
    setForm(BLANK)
    load()
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Documents</h1>
          <p className={styles.sub}>Chapter document repository — {docs.length} files on record</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus size={13} /> Upload Document</Button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['all', ...CATEGORIES] as string[]).map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            style={{
              padding: '5px 10px',
              background: catFilter === c ? 'var(--gold-subtle)' : 'var(--surface2)',
              border: `1px solid ${catFilter === c ? 'var(--gold-border-bright)' : 'var(--gold-border)'}`,
              borderRadius: 'var(--radius)',
              color: catFilter === c ? 'var(--gold)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {c === 'all' ? 'All' : c.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState message="No documents found." /> : (
        <Table>
          <thead>
            <tr><Th>Title</Th><Th>Category</Th><Th>Version</Th><Th>Effective</Th><Th>Expires</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <Td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <FileText size={13} style={{ color: 'var(--gold-dim)', flexShrink: 0 }} />
                    {d.title}
                  </span>
                </Td>
                <Td>{catBadge(d.doc_category)}</Td>
                <Td>{d.version ?? <span style={{color:'var(--text-dim)'}}>—</span>}</Td>
                <Td>{d.effective_date ? new Date(d.effective_date).toLocaleDateString() : <span style={{color:'var(--text-dim)'}}>—</span>}</Td>
                <Td>
                  {d.expiration_date
                    ? <span style={{ color: new Date(d.expiration_date) < new Date() ? 'var(--red)' : 'var(--text)' }}>
                        {new Date(d.expiration_date).toLocaleDateString()}
                      </span>
                    : <span style={{color:'var(--text-dim)'}}>—</span>}
                </Td>
                <Td>
                  <Badge variant={d.is_current ? 'green' : 'dim'}>{d.is_current ? 'Current' : 'Archived'}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && (
        <Modal title="Add Document Record" onClose={() => { setShowModal(false); setForm(BLANK) }}>
          <div className={styles.formGrid}>
            <Field label="Title">
              <Input value={form.title ?? ''} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </Field>
            <Field label="Category">
              <Select value={form.doc_category ?? 'other'} onChange={e => setForm(f => ({...f, doc_category: e.target.value as any}))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </Select>
            </Field>
            <Field label="Version">
              <Input value={form.version ?? ''} onChange={e => setForm(f => ({...f, version: e.target.value}))} placeholder="e.g. v2.1" />
            </Field>
            <Field label="File Name">
              <Input value={form.file_name ?? ''} onChange={e => setForm(f => ({...f, file_name: e.target.value}))} placeholder="document.pdf" />
            </Field>
            <Field label="Effective Date">
              <Input type="date" value={form.effective_date ?? ''} onChange={e => setForm(f => ({...f, effective_date: e.target.value}))} />
            </Field>
            <Field label="Expiration Date">
              <Input type="date" value={form.expiration_date ?? ''} onChange={e => setForm(f => ({...f, expiration_date: e.target.value}))} />
            </Field>
            <Field label="Description">
              <Textarea value={form.description ?? ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </Field>
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => { setShowModal(false); setForm(BLANK) }}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add Document'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
