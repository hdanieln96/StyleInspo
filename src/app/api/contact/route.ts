import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const sql = neon(process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL || '')
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get admin email from settings
    const [settings] = await sql`
      SELECT admin_email FROM site_settings WHERE id = 'default'
    `

    const adminEmail = settings?.admin_email

    if (!adminEmail) {
      console.error('Admin email not configured')
      return NextResponse.json(
        { error: 'Contact form not configured. Please email us directly.' },
        { status: 500 }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      console.log('Contact form submission (email not sent):', {
        to: adminEmail,
        from: email,
        name,
        subject,
        message,
        timestamp: new Date().toISOString()
      })
      return NextResponse.json(
        { error: 'Email service not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    // Send email via Resend
    try {
      await resend.emails.send({
        from: 'StyleInspo Contact Form <onboarding@resend.dev>',
        to: adminEmail,
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;">
                <strong style="color: #555;">Name:</strong> ${name}
              </p>
              <p style="margin: 10px 0;">
                <strong style="color: #555;">Email:</strong> ${email}
              </p>
              <p style="margin: 10px 0;">
                <strong style="color: #555;">Subject:</strong> ${subject}
              </p>
            </div>
            <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #333;">
              <strong style="color: #555;">Message:</strong>
              <p style="margin: 10px 0; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px;">
              <p>This email was sent from the StyleInspo contact form.</p>
              <p>Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        `
      })

      console.log('Email sent successfully to:', adminEmail)
    } catch (emailError) {
      console.error('Error sending email via Resend:', emailError)

      // Log the submission even if email fails
      console.log('Contact form submission (email failed):', {
        to: adminEmail,
        from: email,
        name,
        subject,
        message,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        { error: 'Failed to send email. Please try again or contact us directly.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}