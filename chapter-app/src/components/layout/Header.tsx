'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { LogOut, Bell } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import styles from './Header.module.css'

export default function Header({ user }: { user: User }) {
  const supabase = createClient()
  const router   = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()
  const role = (user.user_metadata?.chapter_role ?? 'member') as string

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.breadcrumb}>Chapter Command</div>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={16} />
        </button>
        <div className={styles.userChip}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
            <span className={styles.userRole}>{role}</span>
          </div>
        </div>
        <button className={styles.iconBtn} onClick={signOut} aria-label="Sign out" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
