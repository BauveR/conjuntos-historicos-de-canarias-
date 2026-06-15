export type EmailData = {
  nombre: string
  titulo: string
  fecha: string
  hora?: string
  duracion?: string
  puntoEncuentro?: string
  organizador?: string
  contacto?: string
  conjuntoNombre?: string
  conjuntoIsla?: string
}

export function buildConfirmacionEmail(data: EmailData): string {
  const {
    nombre, titulo, fecha, hora, duracion,
    puntoEncuentro, organizador, contacto,
    conjuntoNombre, conjuntoIsla,
  } = data

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede8;vertical-align:top;">
        <span style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Open Sans',sans-serif;">${label}</span><br>
        <span style="font-size:14px;color:#1c1917;font-family:'Open Sans',sans-serif;margin-top:3px;display:block;">${value}</span>
      </td>
    </tr>`

  const detailRows = [
    row('Fecha', fecha),
    ...(hora ? [row('Hora', hora)] : []),
    ...(duracion ? [row('Duración', duracion)] : []),
    ...(puntoEncuentro ? [row('Punto de encuentro', puntoEncuentro)] : []),
    ...(conjuntoNombre ? [row('Conjunto histórico', `${conjuntoNombre}${conjuntoIsla ? ` · ${conjuntoIsla}` : ''}`)] : []),
    ...(organizador ? [row('Organizador', organizador + (contacto ? `<br><a href="mailto:${contacto}" style="color:#9ca3af;font-size:11px;">${contacto}</a>` : ''))] : []),
  ].join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Inscripción confirmada</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:'Open Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background:#50664d;border-radius:16px 16px 0 0;padding:32px 40px 28px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.6);font-family:'Open Sans',sans-serif;">Conjuntos Históricos de Canarias</p>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
                <span style="font-size:18px;color:#fff;">✓</span>
                <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);font-family:'Open Sans',sans-serif;">Inscripción confirmada</span>
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:300;color:#fff;line-height:1.3;font-family:Georgia,serif;">${titulo}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px;">
              <p style="margin:0 0 24px;font-size:14px;color:#57534e;line-height:1.6;font-family:'Open Sans',sans-serif;">
                Hola <strong style="color:#1c1917;">${nombre}</strong>, tu plaza ha quedado reservada. Aquí tienes los detalles:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                ${detailRows}
              </table>

              <div style="margin-top:28px;padding:16px 20px;background:#faf9f7;border-radius:12px;border-left:3px solid #b19e7b;">
                <p style="margin:0;font-size:12px;color:#78716c;line-height:1.6;font-family:'Open Sans',sans-serif;">
                  Si no puedes asistir, por favor libera tu plaza desde la app para que otra persona pueda inscribirse.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#faf9f7;border-radius:0 0 16px 16px;padding:20px 40px;border-top:1px solid #f0ede8;">
              <p style="margin:0;font-size:11px;color:#a8a29e;font-family:'Open Sans',sans-serif;">
                conjuntoshistoricosdecanarias.com · Este correo es automático, no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
