import LegalLayout, { Section } from './LegalLayout.jsx';

const WA = 'https://wa.me/541124026647?text=Hola%2C%20tengo%20una%20consulta%20sobre%20la%20Pol%C3%ADtica%20de%20Privacidad%20de%20Wintuu.';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      description="Cómo Wintuu recolecta, usa, protege y transfiere los datos de los negocios y de sus clientes, conforme a la Ley 25.326."
      updated="29 de septiembre de 2026"
    >
      <p>
        Esta política explica, en criollo, qué datos maneja Wintuu, para qué los usa, con quién los comparte y qué
        control tenés vos sobre ellos — seas dueño de un negocio que usa Wintuu para fidelizar a sus clientes ("el
        Negocio"), o seas ese cliente sumando puntos en un negocio que la usa ("el Cliente"). Wintuu ("Wintuu",
        "nosotros") es una plataforma tecnológica operada desde la República Argentina y esta política se rige por la
        Ley de Protección de Datos Personales N.º 25.326, su Decreto Reglamentario 1558/2001, las disposiciones de la
        Agencia de Acceso a la Información Pública (AAIP) y, en lo pertinente, el Reglamento General de Protección de
        Datos de la Unión Europea (RGPD) para los casos en que corresponda su aplicación extraterritorial.
      </p>

      <div className="rounded-2xl border-2 border-[var(--wt-mint)] bg-[var(--wt-mint)]/10 p-5">
        <p className="text-[13px] font-extrabold tracking-[0.1em] text-[var(--wt-mint-dark)]">EN RESUMEN</p>
        <ul className="mt-2 list-disc pl-5 text-[14.5px] leading-relaxed text-[var(--wt-ink)]">
          <li><strong>Wintuu no ve ni guarda datos de tarjetas.</strong> Todo pago se procesa directamente en Mercado Pago; Wintuu solo recibe la confirmación de que el pago se realizó, nunca el número de tarjeta, el CVV ni ningún dato sensible de tu medio de pago.</li>
          <li><strong>Wintuu no administra contraseñas.</strong> El ingreso es siempre con tu cuenta de Google (OAuth): no creamos, no vemos y no guardamos ninguna contraseña tuya.</li>
          <li><strong>Wintuu no controla el contenido que cada Negocio carga.</strong> Los productos, precios, fotos y textos del menú son responsabilidad exclusiva del Negocio que los sube (ver punto 2 y la Sección 10 de las Condiciones del Servicio).</li>
        </ul>
      </div>
      <p>
        Al crear una cuenta, activar un cupón o de cualquier otra forma usar Wintuu, aceptás las prácticas descriptas
        en esta política. Si no estás de acuerdo con algún punto, por favor no uses la plataforma y escribinos para
        resolverlo antes.
      </p>

      <Section id="quien-es-responsable" title="1. Quién es responsable de tus datos">
        <p>
          <strong>Wintuu</strong> es la plataforma tecnológica y actúa, según el caso, en dos roles distintos que la
          normativa de datos personales distingue con precisión:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Responsable del tratamiento</strong> respecto de los datos de las cuentas de administrador (dueños
            de negocios) y de la relación comercial y de facturación entre el Negocio y Wintuu.
          </li>
          <li>
            <strong>Encargado del tratamiento</strong> respecto de los datos de los Clientes de cada Negocio (puntos,
            cupones, visitas registradas): en ese caso, el Negocio es quien decide qué beneficio ofrecer, a quién
            reconocerle un punto y bajo qué reglas, y Wintuu procesa esa información técnicamente en su nombre y por
            su cuenta, siguiendo sus instrucciones (las que da, en la práctica, al usar el panel de administración).
          </li>
        </ul>
        <p className="mt-2">
          Esta distinción importa: si sos Cliente de un Negocio y tenés un reclamo sobre un cupón mal aplicado o un
          punto no reconocido, ese reclamo es primero contra el Negocio, no contra Wintuu. Si tu reclamo es sobre cómo
          se procesan tus datos técnicamente (seguridad, borrado, portabilidad), podés dirigirlo a cualquiera de los
          dos y lo vamos a canalizar correctamente.
        </p>
      </Section>

      <Section id="que-datos-recolectamos" title="2. Qué datos recolectamos">
        <p><strong>Si sos dueño de un Negocio (administrador):</strong></p>
        <ul className="list-disc pl-5">
          <li>
            Nombre, email y foto de tu cuenta de Google, usados para identificarte al ingresar (autenticación OAuth
            2.0). Wintuu no crea ni administra contraseñas propias: no existe una "contraseña de Wintuu" que
            nosotros guardemos, porque el inicio de sesión siempre lo valida Google.
          </li>
          <li>Datos de tu Negocio: nombre comercial, logo, colores, enlace público, dirección, teléfono, redes sociales y horarios que vos cargues.</li>
          <li>
            Los productos, precios, categorías e imágenes de tu menú digital, incluidas las imágenes que subas o
            generes con herramientas de inteligencia artificial dentro del panel. Este contenido es cargado
            íntegramente por vos: Wintuu no lo redacta, no lo verifica ni asume responsabilidad por su exactitud (ver
            punto 1 y la Sección 10 de las Condiciones del Servicio).
          </li>
          <li>
            Datos de facturación (email de pago, plan elegido, estado y fecha de la suscripción, historial de cobros e
            importes) que nos comparte Mercado Pago cuando pagás. <strong>El pago en sí se procesa 100% dentro de
            Mercado Pago:</strong> Wintuu nunca recibe, ve, ni almacena el número de tu tarjeta, su código de
            seguridad (CVV) ni su fecha de vencimiento; esa información no pasa en ningún momento por los servidores
            de Wintuu.
          </li>
          <li>Registros técnicos de uso del panel (fecha y hora de inicio de sesión, acciones administrativas relevantes como altas y bajas de cupones) con fines de seguridad y soporte.</li>
        </ul>
        <p className="mt-2"><strong>Si sos Cliente de un Negocio que usa Wintuu:</strong></p>
        <ul className="list-disc pl-5">
          <li>Nombre, email y foto de tu cuenta de Google, para poder identificarte dentro del perfil de ese Negocio.</li>
          <li>Los puntos que sumás, los cupones que activás o canjeás, y la fecha de cada visita o consumo registrado por el Negocio.</li>
          <li>Si le escribís al Negocio o al soporte de Wintuu, el contenido de esa conversación y los metadatos asociados (fecha, canal).</li>
        </ul>
        <p className="mt-2">
          <strong>Datos técnicos automáticos, para ambos casos:</strong> dirección IP, tipo de navegador y dispositivo,
          y las preferencias que guardamos localmente en tu propio navegador (por ejemplo, si tenés el menú lateral del
          panel colapsado, o tu sesión iniciada) mediante <code>localStorage</code>, para que no tengas que volver a
          configurar esas preferencias en cada visita. No usamos cookies de rastreo publicitario ni vendemos esta
          información técnica a redes de publicidad.
        </p>
        <p className="mt-2">
          No accedemos a tus contactos, tu ubicación en tiempo real, tus fotos personales ni ningún otro dato de tu
          cuenta de Google más allá del nombre, el email y la foto de perfil que Google comparte al iniciar sesión, y
          únicamente con los permisos ("scopes") mínimos necesarios para identificarte.
        </p>
      </Section>

      <Section id="base-legal" title="3. Con qué base legal tratamos tus datos">
        <p>Tratamos tus datos personales sobre alguna de estas bases, según corresponda:</p>
        <ul className="list-disc pl-5">
          <li><strong>Ejecución de un contrato:</strong> para poder prestarte el servicio que contrataste (crear tu app, sumar tus puntos, procesar tu pago).</li>
          <li><strong>Consentimiento:</strong> al iniciar sesión con Google, al aceptar esta política y al activar voluntariamente un cupón como Cliente.</li>
          <li><strong>Interés legítimo:</strong> para prevenir fraude, abuso de la prueba gratuita, y para mantener la seguridad de la plataforma.</li>
          <li><strong>Obligación legal:</strong> para conservar comprobantes de pago y datos fiscales por el plazo que exige la normativa impositiva y contable argentina.</li>
        </ul>
      </Section>

      <Section id="para-que-los-usamos" title="4. Para qué usamos esos datos">
        <ul className="list-disc pl-5">
          <li>Para que puedas entrar con tu cuenta de Google sin tener que crear ni recordar otra contraseña.</li>
          <li>Para llevar el registro de puntos, cupones activos y canjes de cada Cliente dentro de cada Negocio.</li>
          <li>Para procesar el pago de tu plan (mensual, de por vida, o la prueba gratuita de 7 días) y avisarte si un cobro automático no se pudo completar.</li>
          <li>Para responder tickets de soporte y avisos importantes sobre tu cuenta o tu Negocio.</li>
          <li>Para detectar y prevenir abusos, como intentar activar más de una prueba gratuita con la misma persona o cuenta.</li>
          <li>Para cumplir obligaciones legales, contables e impositivas.</li>
        </ul>
        <p className="mt-2">
          <strong>No vendemos ni alquilamos datos a terceros.</strong> No usamos tus datos de Cliente para armarte
          publicidad de otras marcas, ni se los cedemos a otros Negocios que usan Wintuu: los datos de los Clientes de
          un Negocio le pertenecen a ese Negocio y no se comparten entre distintas apps de la plataforma.
        </p>
      </Section>

      <Section id="con-quien-compartimos" title="5. Con quién compartimos información (encargados y subencargados)">
        <p>Para prestar el servicio, compartimos información puntual con estos proveedores, cada uno bajo su propia política de privacidad:</p>
        <ul className="list-disc pl-5">
          <li><strong>Google LLC</strong>, para el inicio de sesión (OAuth). Google tiene su propia política de privacidad para el uso de tu cuenta y actúa como responsable independiente respecto de esos datos.</li>
          <li><strong>Mercado Pago (MercadoLibre S.R.L.)</strong>, para procesar cobros, suscripciones y reintentos de pago. Mercado Pago es quien recibe y guarda los datos de tu tarjeta o medio de pago, no Wintuu.</li>
          <li><strong>Supabase Inc.</strong>, nuestro proveedor de base de datos, autenticación e infraestructura, que aloja la información bajo sus propias medidas de seguridad y puede procesar datos en servidores fuera de la Argentina (ver punto 6).</li>
        </ul>
        <p className="mt-2">
          No compartimos tus datos con otros terceros, salvo que: (a) una ley, un juzgado o una autoridad competente
          nos lo requiera; (b) sea necesario para proteger los derechos, la propiedad o la seguridad de Wintuu, del
          Negocio, de sus Clientes o del público; o (c) exista una fusión, adquisición o venta de activos de Wintuu, en
          cuyo caso te vamos a notificar antes de que tus datos pasen a estar sujetos a una política de privacidad
          distinta.
        </p>
      </Section>

      <Section id="transferencia-internacional" title="6. Transferencia internacional de datos">
        <p>
          Algunos de nuestros proveedores (Google, Mercado Pago y Supabase) pueden procesar o almacenar datos en
          servidores ubicados fuera de la República Argentina, incluyendo Estados Unidos. Al usar Wintuu, aceptás esta
          transferencia internacional, que realizamos procurando que el proveedor ofrezca garantías adecuadas de
          protección (cláusulas contractuales estándar, certificaciones de privacidad u otros mecanismos reconocidos),
          en línea con el artículo 12 de la Ley 25.326 y las disposiciones vigentes de la Agencia de Acceso a la
          Información Pública sobre transferencia internacional de datos personales.
        </p>
      </Section>

      <Section id="cuanto-tiempo-guardamos" title="7. Cuánto tiempo guardamos los datos">
        <p>
          Guardamos los datos mientras tu cuenta o la de tu Negocio estén activas y sean necesarias para el fin para
          el cual fueron recolectadas. Si un Negocio se da de baja o se elimina desde el panel de administración de
          Wintuu, sus Clientes, cupones, pedidos y configuración se borran de forma permanente junto con la app, y esa
          acción no se puede deshacer: te recomendamos exportar cualquier dato que quieras conservar antes de eliminar
          tu app (ver punto 9). Los registros de pagos y datos fiscales se conservan por el plazo que exige la
          normativa impositiva y contable vigente en Argentina (en general, hasta 10 años conforme el Código Civil y
          Comercial para la documentación respaldatoria de obligaciones), aunque la app ya no exista.
        </p>
      </Section>

      <Section id="tus-derechos" title="8. Tus derechos sobre tus datos (Ley 25.326)">
        <p>
          Como titular de tus datos personales, tenés derecho de acceso, rectificación, actualización y supresión de
          tus datos en forma gratuita, con un intervalo no menor a seis meses entre cada solicitud (salvo que
          acredites un interés legítimo para hacerlo antes), conforme el artículo 14 de la Ley 25.326. También podés
          solicitar que se te informe si tus datos figuran en nuestras bases y con qué finalidad.
        </p>
        <p>
          Si sos Cliente de un Negocio, muchos de estos pedidos los puede resolver directamente el Negocio desde su
          panel; si preferís, también podés escribirnos a Wintuu y lo canalizamos con el Negocio correspondiente. Vamos
          a responder tu solicitud dentro de los plazos que exige la normativa aplicable.
        </p>
        <p>
          <strong>La Agencia de Acceso a la Información Pública</strong>, en su carácter de Órgano de Control de la Ley
          25.326, tiene la atribución de atender denuncias y reclamos de quienes resulten afectados en sus derechos por
          incumplimiento de las normas vigentes en materia de protección de datos personales
          (<a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">www.argentina.gob.ar/aaip</a>).
        </p>
      </Section>

      <Section id="portabilidad" title="9. Exportación de tus datos">
        <p>
          Antes de eliminar tu Negocio o tu cuenta, podés solicitarnos un export de tu información (listado de
          Clientes, historial de cupones y canjes, catálogo de menú) en un formato legible. Atendemos estos pedidos en
          la medida técnicamente razonable y dentro de un plazo prudencial desde la solicitud.
        </p>
      </Section>

      <Section id="seguridad" title="10. Medidas de seguridad">
        <p>
          Guardamos las contraseñas de forma cifrada (hash), usamos conexiones cifradas (HTTPS/TLS) en toda la
          plataforma, autenticación de dos factores (2FA) disponible para cuentas de administrador, y limitamos el
          acceso a la información según el rol de cada cuenta (Cliente, administrador de un Negocio o
          superadministrador de Wintuu), conforme las medidas de seguridad exigidas por la normativa de la AAIP para
          el tratamiento de datos personales. Ninguna plataforma puede garantizar seguridad absoluta frente a todo
          ataque posible, pero trabajamos activamente para reducir riesgos, aplicamos actualizaciones de seguridad de
          forma continua y respondemos con prontitud ante cualquier incidente.
        </p>
        <p>
          En caso de detectar una brecha de seguridad que implique un riesgo real para tus datos personales, nos
          comprometemos a notificarte y, cuando corresponda, a notificar a la Agencia de Acceso a la Información
          Pública, dentro de un plazo razonable desde que tomamos conocimiento del incidente.
        </p>
      </Section>

      <Section id="menores" title="11. Menores de edad">
        <p>
          Wintuu no está dirigida a, ni recolecta a sabiendas datos de, menores de 13 años sin el consentimiento de sus
          padres o responsables legales. Si un Negocio detecta que un Cliente registrado es menor de esa edad sin la
          debida autorización, puede solicitar la baja de esa cuenta escribiéndonos, y la vamos a eliminar sin demora.
        </p>
      </Section>

      <Section id="cambios" title="12. Cambios a esta política">
        <p>
          Podemos actualizar esta política cuando cambiemos alguna funcionalidad relevante de Wintuu o cuando lo exija
          un cambio normativo. Si el cambio es sustancial, lo vamos a anunciar de forma visible en la plataforma y, de
          ser necesario, solicitar tu consentimiento renovado, antes de que entre en vigencia.
        </p>
      </Section>

      <Section id="contacto" title="13. Contacto y responsable">
        <p>
          Wintuu es operada desde la República Argentina. ¿Dudas sobre tus datos o esta política?{' '}
          <a href={WA} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">
            Escribinos por WhatsApp
          </a>{' '}
          y te respondemos nosotros, no un bot.
        </p>
      </Section>
    </LegalLayout>
  );
}
