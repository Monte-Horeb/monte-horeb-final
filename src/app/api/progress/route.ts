import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')
  const sessionId = searchParams.get('sessionId')
  const lang = searchParams.get('lang') || 'en'

  if (!videoId || !sessionId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('video_progress')
    .select('completed, watched_seconds')
    .eq('video_id', videoId)
    .eq('session_id', sessionId)
    .eq('lang', lang)
    .single()

  return NextResponse.json(data || { completed: false, watched_seconds: 0 })
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, videoId, courseId, lang, completed, watchedSeconds } = await request.json()

    if (!sessionId || !videoId || !courseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('video_progress')
      .upsert({
        session_id: sessionId,
        video_id: videoId,
        course_id: courseId,
        lang: lang || 'en',
        completed: completed || false,
        watched_seconds: watchedSeconds || 0,
        last_watched_at: new Date().toISOString(),
      }, {
        onConflict: 'session_id,video_id,lang',
      })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Progress error:', err)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}
