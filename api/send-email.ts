import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { buildConfirmacionEmail, type EmailData } from './emailTemplate.js'

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

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' })

  const { idToken, email, ...emailData } = req.body as { idToken: string; email: string } & EmailData

  if (!idToken || !email) return res.status(400).json({ error: 'Missing fields' })

  const resend = new Resend(resendKey)

  const valid = await verifyFirebaseToken(idToken)
  if (!valid) return res.status(401).json({ error: 'Invalid token' })

  const { data, error } = await resend.emails.send({
    from: 'Conjuntos Históricos de Canarias <noreply@conjuntoshistoricosdecanarias.com>',
    to: email,
    subject: `Inscripción confirmada · ${emailData.titulo}`,
    html: buildConfirmacionEmail(emailData),
  })

  if (error) {
    console.error('Resend error:', JSON.stringify(error))
    return res.status(500).json({ error })
  }

  return res.status(200).json({ ok: true, id: data?.id })
}
