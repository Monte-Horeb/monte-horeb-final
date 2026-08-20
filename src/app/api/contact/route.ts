import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  language: z.enum(['en', 'es']),
  message: z.string().min(10).max(2000),
  // Spam trap. Optional so a legitimate client that omits it still passes,
  // but any non-empty value is rejected below.
  honeypot: z.string().optional(),
})

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const { name, email, phone, language, message, honeypot } = parsed.data

    // Bot filled the hidden field - accept silently so it does not retry.
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json({ ok: true })
    }

    // 1. Persist the submission. This is the part that must not fail.
    const supabase = createAdminClient()
    const { error: insertError } = await supabase.from('contact_submissions').insert({
      name,
      email,
      phone: phone || null,
      language,
      message,
    })

    if (insertError) {
      console.error('Contact form: failed to save submission:', insertError)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    // 2. Notify by email. Best-effort: the message is already saved, so a
    //    mail outage must not surface as a failure to the visitor.
    //    (Resend's constructor throws when the key is missing, which
    //    previously took down the whole route at import time.)
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      try {
        const resend = new Resend(apiKey)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@sdcmontehoreb.com',
          to: process.env.CHURCH_CONTACT_EMAIL || 'sdcmontehoreb@gmail.com',
          reply_to: email,
          subject: `Contact Form - ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <table>
              <tr><td><strong>Name:</strong></td><td>${escapeHtml(name)}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${escapeHtml(email)}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>${escapeHtml(phone || '-')}</td></tr>
              <tr><td><strong>Language:</strong></td><td>${language === 'es' ? 'Spanish' : 'English'}</td></tr>
            </table>
            <h3>Message:</h3>
            <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
            <hr/>
            <p style="color:#888;font-size:12px;">Sent from sdcmontehoreb.com contact form</p>
          `,
        })
      } catch (mailError) {
        console.error('Contact form: saved, but email notification failed:', mailError)
      }
    } else {
      console.warn('Contact form: RESEND_API_KEY not set - submission saved, no email sent.')
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
