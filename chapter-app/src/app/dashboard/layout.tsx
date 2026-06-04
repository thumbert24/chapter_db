import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Sidebar from '@/components/layout/Sidebar'
import Header  from '@/components/layout/Header'
import styles  from './layout.module.css'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header user={user} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
