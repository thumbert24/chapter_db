import { clsx } from 'clsx'
import styles from './ui.module.css'

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'red' | 'amber' | 'gold' | 'blue' | 'dim'

export function Badge({ children, variant = 'dim' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return <span className={clsx(styles.badge, styles[`badge_${variant}`])}>{children}</span>
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
type StatVariant = 'default' | 'good' | 'warn' | 'danger'

export function StatCard({
  label, value, sub, variant = 'default'
}: { label: string; value: string | number; sub?: string; variant?: StatVariant }) {
  return (
    <div className={clsx(styles.statCard, styles[`stat_${variant}`])}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx(styles.card, className)}>{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className={styles.cardTitle}>{children}</div>
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className={styles.sectionHdr}>
      <span className={styles.sectionTitle}>{title}</span>
      {action && <button className={styles.sectionAction} onClick={onAction}>{action}</button>}
    </div>
  )
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
export function StatsRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.statsRow}>{children}</div>
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>{children}</table>
    </div>
  )
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className={styles.th}>{children}</th>
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className={styles.td}>{children}</td>
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
type BarVariant = 'gold' | 'green' | 'amber' | 'red'

export function ProgressBar({ label, pct, variant = 'gold' }: { label: string; pct: number; variant?: BarVariant }) {
  return (
    <div className={styles.compItem}>
      <div className={styles.compLabel}>
        <span>{label}</span>
        <span className={styles.compPct}>{Math.round(pct)}%</span>
      </div>
      <div className={styles.barBg}>
        <div className={clsx(styles.barFill, styles[`bar_${variant}`])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ message = 'No records found.' }: { message?: string }) {
  return <div className={styles.empty}>{message}</div>
}

// ─── Loading ──────────────────────────────────────────────────────────────────
export function Loading() {
  return <div className={styles.loading}>Loading…</div>
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(styles.input, props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return <select {...props} className={clsx(styles.select, props.className)} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(styles.textarea, props.className)} />
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  children, variant = 'secondary', className, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button {...rest} className={clsx(styles.btn, styles[`btn_${variant}`], className)}>
      {children}
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

// ─── Field Group ──────────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}
