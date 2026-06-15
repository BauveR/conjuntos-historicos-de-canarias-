import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import * as admin from 'firebase-admin'
import { buildConfirmacionEmail, type EmailData } from './emailTemplate'

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}')
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { idToken, email, ...emailData } = req.body as { idToken: string; email: string } & EmailData

  if (!idToken || !email) return res.status(400).json({ error: 'Missing fields' })

  try {
    await admin.auth().verifyIdToken(idToken)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

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
