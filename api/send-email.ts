import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { buildConfirmacionEmail, type EmailData } from './emailTemplate.js'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function verifyFirebaseToken(idToken: string): Promise<{ email: string; name: string } | null> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  )
  if (!res.ok) return null
  const data = await res.json() as { users?: Array<{ email: string; displayName?: string }> }
  const user = data.users?.[0]
  if (!user?.email) return null
  return { email: user.email, name: user.displayName ?? 'participante' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' })

  const { idToken, ...rawEmailData } = req.body as { idToken: string } & EmailData

  if (!idToken) return res.status(400).json({ error: 'Missing fields' })

  // Email y nombre vienen del token, nunca del body
  const tokenUser = await verifyFirebaseToken(idToken)
  if (!tokenUser) return res.status(401).json({ error: 'Invalid token' })

  // Sanitizar todos los campos del body antes de interpolar en HTML
  const emailData: EmailData = {
    nombre: tokenUser.name,
    titulo: escapeHtml(rawEmailData.titulo ?? ''),
    fecha: escapeHtml(rawEmailData.fecha ?? ''),
    hora: rawEmailData.hora ? escapeHtml(rawEmailData.hora) : undefined,
    duracion: rawEmailData.duracion ? escapeHtml(rawEmailData.duracion) : undefined,
    puntoEncuentro: rawEmailData.puntoEncuentro ? escapeHtml(rawEmailData.puntoEncuentro) : undefined,
    organizador: rawEmailData.organizador ? escapeHtml(rawEmailData.organizador) : undefined,
    contacto: rawEmailData.contacto ? escapeHtml(rawEmailData.contacto) : undefined,
    conjuntoNombre: rawEmailData.conjuntoNombre ? escapeHtml(rawEmailData.conjuntoNombre) : undefined,
    conjuntoIsla: rawEmailData.conjuntoIsla ? escapeHtml(rawEmailData.conjuntoIsla) : undefined,
  }

  const resend = new Resend(resendKey)

  const { data, error } = await resend.emails.send({
    from: 'Conjuntos Históricos de Canarias <noreply@conjuntoshistoricosdecanarias.com>',
    to: tokenUser.email,
    subject: `Inscripción confirmada · ${emailData.titulo}`,
    html: buildConfirmacionEmail(emailData),
  })

  if (error) {
    console.error('Resend error:', JSON.stringify(error))
    return res.status(500).json({ error })
  }

  return res.status(200).json({ ok: true, id: data?.id })
}
