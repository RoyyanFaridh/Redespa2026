import { createClient } from '@/lib/supabase/server'
import Table from './table'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: siswa, error } = await supabase
    .from('mudamudi')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return <Table initialData={siswa ?? []} isAdmin={!!user} />
}