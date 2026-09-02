import { Link } from 'react-router-dom'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }
const titleStyle = { fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-stone-800" style={labelStyle}>{title}</h2>
      <div className="text-sm text-stone-500 leading-relaxed flex flex-col gap-2" style={labelStyle}>
        {children}
      </div>
    </div>
  )
}

export function AvisoLegalPage() {
  return (
    <main className="min-h-screen bg-white pt-16" style={labelStyle}>
      <div className="max-w-2xl mx-auto px-6 py-14 flex flex-col gap-10">

        <div className="flex flex-col gap-3">
          <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400">Legal</p>
          <h1 className="text-4xl uppercase tracking-tight text-stone-800" style={titleStyle}>
            Aviso Legal
          </h1>
          <p className="text-xs text-stone-400">Última actualización: junio 2026</p>
        </div>

        <div className="w-full h-px bg-stone-100" />

        <Section title="Objeto y aceptación">
          <p>
            El presente aviso legal regula el uso del sitio web <strong>Conjuntos Históricos de Canarias</strong>{' '}
            (en adelante, "el sitio Web"), cuyo objetivo primordial es dar a conocer las rutas y conjuntos históricos
            de Canarias y permitir a los usuarios registrarse e inscribirse en las actividades organizadas.
          </p>
          <p>
            La navegación por el sitio Web atribuye la condición de usuario del mismo e implica la aceptación plena
            y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal, que pueden sufrir
            modificaciones.
          </p>
          <p>
            El usuario se obliga a hacer un uso correcto del sitio Web de conformidad con las leyes, la buena fe, el
            orden público, los usos del tráfico y el presente Aviso Legal. El Usuario responderá frente a{' '}
            <strong>LHORSA GESTIÓN DE EVENTOS S.C.</strong> y frente a terceros de los daños y perjuicios que
            pudieran causarse como consecuencia del incumplimiento de dicha obligación.
          </p>
        </Section>

        <Section title="Titularidad de la web e identificación del Prestador de Servicios de la Sociedad de la Información">
          <p>
            Con la finalidad de dar cumplimiento al principio de información general exigido por el artículo 10 de
            la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico,
            informamos a nuestros usuarios de que el presente sitio web pertenece a{' '}
            <strong>LHORSA GESTIÓN DE EVENTOS S.C.</strong>, con CIF J76741685.
          </p>
          <p>Dirección: C/ Ángeles Martín Fuentes, 4, 38410, Los Realejos (Santa Cruz de Tenerife).</p>
          <p>
            Correo-e:{' '}
            <a href="mailto:rutas@lhorsa.com" className="underline underline-offset-2 hover:text-stone-700 transition-colors">
              rutas@lhorsa.com
            </a>
          </p>
          <p>Teléfono: 693 03 66 88</p>
          <p>Web alojada por: Vercel Inc.</p>
        </Section>

        <Section title="1. Condiciones generales de acceso y utilización">
          <p>
            El sitio Web y sus servicios son de acceso libre y gratuito, si bien la utilización de determinadas
            áreas o servicios —como el registro de cuenta o la inscripción en actividades— está condicionada a
            cumplimentar formularios de recogida de datos. Solo los mayores de 18 años podrán facilitar datos a
            través de nuestra web, y los menores de 16 años no pueden facilitarlos sin el consentimiento de los
            padres o tutores.
          </p>
          <p>
            El Usuario garantiza la autenticidad y actualidad de todos aquellos datos que comunique a{' '}
            <strong>LHORSA GESTIÓN DE EVENTOS S.C.</strong> y será el único responsable de las manifestaciones
            falsas o inexactas que realice.
          </p>
          <p>El sitio Web tiene los siguientes tipos de usuarios:</p>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>
              <strong>Usuarios registrados</strong> — proporcionan nombre y correo electrónico al crear una cuenta
              mediante email o Google, y su historial de inscripciones a actividades.
            </li>
            <li>
              <strong>Usuarios que aún no han contactado con LHORSA GESTIÓN DE EVENTOS S.C.</strong> pero de los que
              se recogen datos técnicos necesarios para el funcionamiento del sitio (ver Política de Privacidad y
              Cookies).
            </li>
          </ul>
        </Section>

        <Section title="2. Reglas y prohibiciones de uso para usuarios de nuestros servicios">
          <p>El Usuario se compromete expresamente a hacer un uso adecuado de los contenidos y servicios ofrecidos y a no emplearlos para:</p>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>Difundir contenidos delictivos, violentos, pornográficos, racistas, xenófobos, ofensivos, de apología del terrorismo o, en general, contrarios a la ley o al orden público.</li>
            <li>Introducir en la red virus informáticos o realizar actuaciones susceptibles de alterar, estropear, interrumpir o generar errores o daños en los documentos electrónicos, datos o sistemas físicos y lógicos de LHORSA GESTIÓN DE EVENTOS S.C. o de terceras personas; así como obstaculizar el acceso de otros Usuarios al sitio Web y a sus servicios.</li>
            <li>Intentar acceder a áreas restringidas de los sistemas informáticos de LHORSA GESTIÓN DE EVENTOS S.C. o de terceros y, en su caso, extraer información.</li>
            <li>Vulnerar los derechos de propiedad intelectual o industrial, así como violar la confidencialidad de la información de LHORSA GESTIÓN DE EVENTOS S.C. o de terceros.</li>
            <li>Suplantar la identidad de otro Usuario, de las administraciones públicas o de un tercero.</li>
            <li>Reproducir, copiar, distribuir, poner a disposición o de cualquier otra forma comunicar públicamente, transformar o modificar los contenidos, a menos que se cuente con la autorización del titular de los correspondientes derechos o ello resulte legalmente permitido.</li>
            <li>Recabar datos con finalidad publicitaria y remitir publicidad de cualquier clase y comunicaciones con fines de venta u otras de naturaleza comercial sin que medie su previa solicitud o consentimiento.</li>
          </ul>
        </Section>

        <Section title="3. Procedimiento en caso de realización de actividades de carácter ilícito">
          <p>
            En el caso de que cualquier usuario o un tercero considere que existen hechos o circunstancias que
            revelen el carácter ilícito de la utilización de cualquier contenido y/o de la realización de cualquier
            actividad en las páginas web incluidas o accesibles a través del sitio Web, deberá enviar una
            notificación a <strong>LHORSA GESTIÓN DE EVENTOS S.C.</strong> identificándose debidamente,
            especificando las supuestas infracciones y declarando expresamente y bajo su responsabilidad que la
            información proporcionada en la notificación es exacta.
          </p>
        </Section>

        <Section title="4. Política de privacidad y cookies">
          <p>
            El usuario puede consultar cómo <strong>LHORSA GESTIÓN DE EVENTOS S.C.</strong> utiliza sus datos, las
            cookies empleadas y las medidas de seguridad implantadas en la{' '}
            <Link to="/privacidad" className="underline underline-offset-2 hover:text-stone-700 transition-colors">
              Política de Privacidad y Cookies
            </Link>.
          </p>
        </Section>

        <Section title="5. Notificaciones">
          <p>
            Todas las notificaciones y comunicaciones entre los usuarios y{' '}
            <strong>LHORSA GESTIÓN DE EVENTOS S.C.</strong> se considerarán eficaces, a todos los efectos, cuando se
            realicen a través de correo postal, correo electrónico o comunicación telefónica. Los usuarios deberán
            dirigirse a LHORSA GESTIÓN DE EVENTOS S.C. mediante:
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>Correo postal a: C/ Ángeles Martín Fuentes, 4, 38410, Los Realejos (Santa Cruz de Tenerife).</li>
            <li>
              Correo electrónico a:{' '}
              <a href="mailto:rutas@lhorsa.com" className="underline underline-offset-2 hover:text-stone-700 transition-colors">
                rutas@lhorsa.com
              </a>
            </li>
          </ul>
        </Section>

        <Section title="6. Propiedad industrial e intelectual">
          <p>
            Todos los contenidos del sitio Web, como textos, fotografías, gráficos, imágenes, iconos, tecnología,
            software, así como su diseño gráfico y códigos fuente, constituyen una obra cuya propiedad pertenece a{' '}
            <strong>LHORSA GESTIÓN DE EVENTOS S.C.</strong>, sin que puedan entenderse cedidos al Usuario ninguno de
            los derechos de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto
            uso de la Web.
          </p>
          <p>
            Los usuarios que accedan a este sitio Web pueden visualizar los contenidos y efectuar, en su caso,
            copias privadas autorizadas siempre que los elementos reproducidos no sean cedidos posteriormente a
            terceros, ni se instalen en servidores conectados a redes, ni sean objeto de ningún tipo de explotación
            y única y exclusivamente mientras se encuentre en vigor el servicio.
          </p>
          <p>
            Asimismo, todas las marcas, nombres comerciales o signos distintivos de cualquier clase que aparecen en
            el sitio Web son propiedad de LHORSA GESTIÓN DE EVENTOS S.C., sin que pueda entenderse que el uso o
            acceso al mismo atribuya al Usuario derecho alguno sobre los mismos.
          </p>
          <p>
            Quedan prohibidas la distribución, modificación, cesión o comunicación pública de los contenidos y
            cualquier otro acto que no haya sido expresamente autorizado por LHORSA GESTIÓN DE EVENTOS S.C. En caso
            de incumplimiento, LHORSA GESTIÓN DE EVENTOS S.C. procederá a adoptar las medidas legales oportunas.
          </p>
        </Section>

        <Section title="7. Exención de responsabilidad y modificación del presente aviso legal">
          <p>
            La información que se difunde en esta web se hace única y exclusivamente a título informativo,
            reservándose LHORSA GESTIÓN DE EVENTOS S.C. el derecho a eliminar o suspender su difusión, total o
            parcialmente, y a modificar la estructura y contenido de este sitio Web sin aviso previo, pudiendo
            incluso limitar o no permitir el acceso a dicha información. LHORSA GESTIÓN DE EVENTOS S.C. intenta
            mantener la calidad y actualización de esta información y evitar y minimizar posibles errores, pero no
            responderá de los daños o perjuicios causados por decisiones tomadas en base a la información
            difundida; ni de inexactitudes, omisiones o errores contenidos en la misma; ni de los problemas que se
            originen por el uso de este sitio Web u otro de conexión externa; ni de los daños y/o perjuicios en el
            software o hardware del usuario que se deriven del acceso a este sitio Web.
          </p>
          <p>
            Los Usuarios aceptan expresamente que LHORSA GESTIÓN DE EVENTOS S.C. no será responsable del acceso no
            autorizado o alteración de sus transmisiones o datos, de cualquier material o datos enviados o
            recibidos o no enviados o recibidos, ni de ninguna transacción realizada a través de la web.
          </p>
          <p>
            LHORSA GESTIÓN DE EVENTOS S.C. se reserva el derecho a modificar el presente aviso legal unilateralmente
            y sin preaviso en los términos y condiciones que estime conveniente, con la única obligación de
            informar al usuario de las modificaciones efectuadas a través de este sitio Web.
          </p>
        </Section>

        <Section title="8. Nulidad parcial">
          <p>
            Si alguna de las presentes cláusulas fuese declarada nula y sin efecto por resolución firme dictada por
            autoridad competente, los restantes términos y condiciones permanecerán en vigor, sin que queden
            afectados por dicha declaración de nulidad.
          </p>
        </Section>

        <Section title="9. Ley aplicable y tribunales competentes">
          <p>El presente sitio web queda sometido a lo establecido por la legislación española y la normativa europea que resulte de aplicación.</p>
          <p>
            Cualquier controversia que surja o guarde relación con el uso de la página web será sometida a la
            jurisdicción no exclusiva de los juzgados y tribunales españoles de la provincia de S/C de Tenerife.
          </p>
          <p>
            Si se trata de un consumidor final, nada en la presente cláusula afectará a los derechos que como tal
            le reconoce la legislación vigente, pudiendo elegir presentar una reclamación para hacer valer sus
            derechos en relación con las presentes condiciones ante el juez o tribunales que correspondan a su
            domicilio.
          </p>
        </Section>

        <div className="w-full h-px bg-stone-100" />

        <p className="text-xs text-stone-400" style={labelStyle}>
          Copyright © LHORSA GESTIÓN DE EVENTOS S.C.
        </p>

      </div>
    </main>
  )
}
