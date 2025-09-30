import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL || '')

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

    // For now, we'll log the contact form submission
    // In production, you would integrate with an email service like:
    // - Resend (resend.com)
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP

    console.log('Contact form submission:', {
      to: adminEmail,
      from: email,
      name,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    // TODO: Integrate with email service
    // Example with Resend:
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'StyleInspo Contact Form <onboarding@resend.dev>',
    //   to: adminEmail,
    //   reply_to: email,
    //   subject: `Contact Form: ${subject}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //   `
    // })

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