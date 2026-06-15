import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { buildConfirmacionEmail, type EmailData } from './emailTemplate.js'

const resend = new Resend(process.env.RESEND_API_KEY)

async function verifyFirebaseToken(idToken: string): Promise<boolean> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  )
  return res.ok
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken, email, ...emailData } = req.body as { idToken: string; email: string } & EmailData

  if (!idToken || !email) return res.status(400).json({ error: 'Missing fields' })

  const valid = await verifyFirebaseToken(idToken)
  if (!valid) return res.status(401).json({ error: 'Invalid token' })

  try {
    await resend.emails.send({
      from: 'Conjuntos Históricos de Canarias <noreply@conjuntospatrimonialesdecanarias.com>',
      to: email,
      subject: `Inscripción confirmada · ${emailData.titulo}`,
      html: buildConfirmacionEmail(emailData),
    })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return res.status(500).json({ error: 'Email send failed' })
  }
}
