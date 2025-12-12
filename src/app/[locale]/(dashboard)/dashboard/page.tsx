import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Try to get business data
  let business = null;
  try {
    const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id).single();
    business = data;
  } catch {
    // Table might not exist yet, continue with null
  }

  return <DashboardContent user={user} business={business} />;
}
