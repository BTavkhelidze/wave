import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'ka';
  const titleColumn = locale === 'ka' ? 'title_ka' : 'title_en';

  const descColumn = locale === 'ka' ? 'description_ka' : 'description_en';

  const { data: services, error } = await supabase
    .from('services')
    .select(`id, ${titleColumn}, icon, iconColor, colors, ${descColumn}`)
    .not(titleColumn, 'is', null)
    .order('id', { ascending: true });

  if (error) return NextResponse.json(error, { status: 400 });
  return NextResponse.json(services, { status: 200 });
}
