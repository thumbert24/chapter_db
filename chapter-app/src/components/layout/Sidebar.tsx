'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, DollarSign,
  Crown, Calendar, BarChart2, FileText, ChevronRight
} from 'lucide-react'
import styles from './Sidebar.module.css'

const NAV = [
  { href: '/dashboard',           label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/dashboard/members',   label: 'Members',     icon: Users },
  { href: '/dashboard/compliance',label: 'Compliance',  icon: ShieldCheck },
  { href: '/dashboard/financial', label: 'Financial',   icon: DollarSign },
  { href: '/dashboard/leadership',label: 'Leadership',  icon: Crown },
  { href: '/dashboard/events',    label: 'Events',      icon: Calendar },
  { href: '/dashboard/reports',   label: 'Reports',     icon: BarChart2 },
  { href: '/dashboard/documents', label: 'Documents',   icon: FileText },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.crest}>ΩΨΦ</div>
        <div>
          <div className={styles.brandName}>Chapter</div>
          <div className={styles.brandSub}>Command</div>
        </div>
      </div>

      <div className={styles.rule} />

      <nav className={styles.nav}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? path === href : path.startsWith(href)
          return (
            <Link key={href} href={href} className={`${styles.link} ${active ? styles.active : ''}`}>
              <Icon size={15} />
              <span>{label}</span>
              {active && <ChevronRight size={12} className={styles.chevron} />}
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerText}>FY 2024–25</div>
      </div>
    </aside>
  )
}
