import LegalLayout, { Section } from './LegalLayout.jsx';

const WA = 'https://wa.me/541124026647?text=Hola%2C%20tengo%20una%20consulta%20sobre%20los%20T%C3%A9rminos%20de%20Wintuu.';

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Condiciones del Servicio"
      description="Las reglas de uso de Wintuu: planes, pagos, prueba gratuita, cancelación, propiedad intelectual, garantías y responsabilidad."
      updated="29 de septiembre de 2026"
    >
      <p>
        Estas condiciones ("Condiciones") rigen el uso de Wintuu, la plataforma de fidelización y menú digital
        operada desde la República Argentina ("Wintuu", "nosotros"). Al crear una app en Wintuu, al aceptar
        expresamente estas Condiciones en el proceso de alta, o al usar el perfil de un negocio que utiliza Wintuu,
        aceptás quedar obligado por ellas. Están escritas en un lenguaje directo a propósito: preferimos que las
        entiendas antes de firmar, a dejarte un documento denso que nadie lee.
      </p>

      <div className="rounded-2xl border-2 border-[var(--wt-mint)] bg-[var(--wt-mint)]/10 p-5">
        <p className="text-[13px] font-extrabold tracking-[0.1em] text-[var(--wt-mint-dark)]">EN RESUMEN</p>
        <ul className="mt-2 list-disc pl-5 text-[14.5px] leading-relaxed text-[var(--wt-ink)]">
          <li><strong>Los pagos los procesa Mercado Pago, no Wintuu.</strong> Wintuu no maneja ni almacena datos de tarjetas ni información sensible de medios de pago.</li>
          <li><strong>El acceso es con tu cuenta de Google.</strong> Wintuu no crea ni administra contraseñas propias.</li>
          <li>
            <strong>El Negocio administrador es el único responsable del contenido de su app</strong> (productos,
            precios, fotos, promociones) y de la relación con sus propios Clientes. Al aceptar estas Condiciones,
            aceptás expresamente este punto (ver Secciones 10 y 15).
          </li>
        </ul>
      </div>

      <Section id="definiciones" title="1. Definiciones">
        <ul className="list-disc pl-5">
          <li><strong>"Wintuu":</strong> la plataforma, el software, la marca y los servicios descriptos en estas Condiciones.</li>
          <li><strong>"Negocio":</strong> la persona física o jurídica que contrata un plan de Wintuu para administrar su propia app.</li>
          <li><strong>"Cliente":</strong> la persona que participa de los beneficios de un Negocio dentro de Wintuu (suma puntos, activa o canjea cupones).</li>
          <li><strong>"Contenido":</strong> los textos, imágenes, logos, precios y demás información que el Negocio carga en su perfil o menú.</li>
        </ul>
      </Section>

      <Section id="que-es-wintuu" title="2. Qué es Wintuu (y qué no es)">
        <p>
          Wintuu es una herramienta para que un Negocio reconozca las visitas de sus Clientes con cupones y puntos, y
          les muestre su menú digital. Wintuu provee la tecnología; el Negocio decide qué beneficios ofrecer, a quién
          reconocerle un punto y en qué condiciones. Wintuu no participa de la relación de consumo entre el Negocio y
          su Cliente final (por ejemplo, la calidad de un producto, un cupón mal aplicado en el local, o un reclamo por
          un servicio), y no garantiza resultados de ventas, de retención de Clientes ni de ningún otro indicador de
          negocio: esos resultados dependen de cómo cada Negocio use la herramienta.
        </p>
      </Section>

      <Section id="naturaleza-de-la-relacion" title="3. Naturaleza de la relación contractual">
        <p>
          Cuando un Negocio contrata Wintuu para usarlo dentro de su actividad comercial o profesional (esto es, para
          operar su propio programa de fidelización hacia sus propios Clientes), esa contratación se enmarca
          principalmente en las normas generales de derecho comercial del Código Civil y Comercial de la Nación, dado
          que el bien o servicio se adquiere con destino a integrarse en procesos de producción, transformación,
          comercialización o prestación a terceros de otros bienes o servicios (conforme la exclusión del artículo 1º
          de la Ley 24.240). Esto no implica renunciar a ningún derecho irrenunciable que la ley le reconozca al
          Negocio según su situación concreta, y en ningún caso reduce las protecciones que estas Condiciones y la
          Política de Privacidad le reconocen a los Clientes finales, quienes sí actúan como consumidores frente al
          Negocio (no frente a Wintuu, con quien no tienen relación contractual directa de consumo).
        </p>
      </Section>

      <Section id="cuentas" title="4. Cuentas, edad mínima y acceso">
        <p>
          Se ingresa con una cuenta de Google. Declarás tener al menos 18 años, o la mayoría de edad que corresponda
          en tu jurisdicción, y capacidad legal para contratar, o contar con la autorización de tu representante legal
          en caso contrario. Sos responsable de mantener el acceso a tu cuenta seguro y de toda actividad que ocurra
          bajo tu cuenta. Un Negocio administra su app a través de su cuenta de administrador; un Cliente participa de
          los beneficios de un Negocio a través de su propia cuenta. Wintuu puede pedir un segundo factor de
          autenticación (2FA) para proteger cuentas administradoras, y recomendamos activarlo.
        </p>
      </Section>

      <Section id="planes-y-precios" title="5. Planes y precios">
        <p>Wintuu ofrece dos formas de pago para el plan del Negocio:</p>
        <ul className="list-disc pl-5">
          <li><strong>Mensual:</strong> un cobro recurrente mensual, procesado por Mercado Pago, que se renueva automáticamente hasta que lo canceles.</li>
          <li><strong>De por vida:</strong> un pago único, sin cuotas mensuales posteriores, por el acceso continuo al servicio mientras Wintuu exista y en los términos aquí descriptos.</li>
        </ul>
        <p className="mt-2">
          Los precios vigentes se muestran en la página de planes y en el checkout antes de pagar, expresados en pesos
          argentinos (ARS) e incluyendo los impuestos que correspondan según la normativa vigente al momento del pago.
          Podemos actualizar los precios hacia adelante para nuevas contrataciones o renovaciones futuras; si tu plan
          mensual ya está activo, te vamos a avisar con una anticipación mínima de 30 días antes de que un aumento de
          precio te afecte, y vas a poder cancelar sin cargo si no estás de acuerdo.
        </p>
      </Section>

      <Section id="prueba-gratuita" title="6. Prueba gratuita de 7 días">
        <p>
          Cuando el plan Mensual se contrata con la opción de prueba gratuita, Mercado Pago autoriza tu tarjeta en el
          momento pero no te cobra nada durante los primeros 7 días corridos. Si no cancelás antes de que termine ese
          período, al octavo día se genera automáticamente el primer cobro mensual, sin que sea necesaria ninguna
          confirmación adicional de tu parte: es la misma lógica de cualquier suscripción con prueba gratuita, y la
          aceptás expresamente al activarla. Cada cuenta y cada medio de pago pueden usar la prueba gratuita una sola
          vez; Wintuu puede negar o revocar una prueba gratuita adicional que detecte como duplicada o fraudulenta.
        </p>
      </Section>

      <Section id="derecho-de-revocacion" title="7. Derecho de revocación (botón de arrepentimiento)">
        <p>
          Si en tu caso concreto resultara aplicable el régimen de protección al consumidor para contrataciones a
          distancia (artículos 1110 a 1116 del Código Civil y Comercial de la Nación y artículo 34 de la Ley 24.240),
          contás con un plazo de 10 días corridos desde la contratación para revocar tu aceptación sin costo ni
          responsabilidad alguna. Ese derecho no aplica, o se considera renunciado, cuando el servicio ya fue prestado
          por completo con tu consentimiento expreso previo a que venza el plazo de revocación (por ejemplo, si
          activaste la prueba gratuita y usaste efectivamente el panel o creaste tu app antes de esos 10 días), en
          línea con las excepciones previstas en el artículo 1116 del Código Civil y Comercial. Fuera de esos
          supuestos, para ejercer este derecho escribinos dentro del plazo indicado.
        </p>
      </Section>

      <Section id="cancelacion" title="8. Cancelación y suspensión">
        <p>
          Podés cancelar la renovación automática del plan Mensual cuando quieras, desde Configuración → Plan y
          facturación. Al cancelar, no se te vuelve a cobrar, y tu app sigue funcionando normalmente hasta el final del
          período ya autorizado (el ciclo mensual en curso, o los 7 días de prueba si todavía estabas en esa etapa):
          no se corta el servicio de un día para el otro ni se prorratea a favor de Wintuu el tiempo no usado.
        </p>
        <p>
          Si un cobro automático del plan Mensual no se puede completar (por ejemplo, fondos insuficientes o una
          tarjeta vencida), tu app entra en un período de gracia breve para que regularices el pago. Si el pago sigue
          sin poder procesarse una vez vencido ese plazo, la app se suspende automáticamente hasta que se regularice o
          decidas cancelarla. Suspender no borra tus datos: los recuperás al reactivar el pago, salvo que la cuenta
          permanezca suspendida por un plazo prolongado, en cuyo caso se aplica la política de retención del punto 7
          de la Política de Privacidad.
        </p>
        <p>
          Wintuu puede suspender o dar de baja una cuenta, con o sin previo aviso según la gravedad del caso, si
          detecta un uso que viola estas Condiciones, un fraude, un intento de abuso de la prueba gratuita, contenido
          ilegal, o actividad que ponga en riesgo la plataforma, a Wintuu o a otros usuarios. En los casos que lo
          permitan, vamos a intentar avisarte antes de tomar esa medida.
        </p>
      </Section>

      <Section id="reembolsos" title="9. Reembolsos">
        <p>
          El pago del plan De por vida es por un servicio de acceso continuo, no por una entrega puntual: no
          ofrecemos reembolsos una vez que la app fue creada y activada y venció, si correspondiere, el plazo de
          revocación del punto 7, salvo que la ley aplicable establezca lo contrario o medie un error de cobro
          comprobable de nuestro lado. Para el plan Mensual, cancelar detiene los cobros futuros, pero no genera un
          reembolso del período ya abonado y en curso, salvo error de cobro comprobable.
        </p>
      </Section>

      <Section id="propiedad-intelectual" title="10. Propiedad intelectual">
        <p>
          El software, el código fuente, el diseño, la marca "Wintuu", su logo y toda la propiedad intelectual
          asociada a la plataforma le pertenecen a Wintuu (o a sus licenciantes) y están protegidos por la Ley
          11.723 de Propiedad Intelectual y la normativa de marcas aplicable. Estas Condiciones no te transfieren
          ninguna titularidad sobre ese software ni esa marca: únicamente te otorgan una licencia limitada, no
          exclusiva, revocable y no transferible para usar Wintuu de acuerdo con estas Condiciones.
        </p>
        <p>
          El nombre, el logo, los colores, los textos y las fotos que el Negocio cargue en su perfil o en su menú
          (el "Contenido") siguen siendo del Negocio: Wintuu no se los apropia. El Negocio le da a Wintuu una licencia
          limitada para almacenar y mostrar ese Contenido únicamente dentro de su propio perfil público, con el único
          fin de prestarle el servicio. De la misma forma, los datos de los Clientes de un Negocio (puntos, cupones,
          visitas) le pertenecen a ese Negocio: Wintuu los procesa técnicamente por su cuenta, no los usa para otros
          fines ni los comparte con otros Negocios de la plataforma.
        </p>
        <p>
          El Negocio declara y garantiza que cuenta con los derechos necesarios sobre las imágenes, textos y marcas
          que carga, y que ese Contenido no infringe derechos de terceros (propiedad intelectual, imagen, datos
          personales) ni la ley vigente. Ante un reclamo fundado de un tercero por infracción de derechos vinculado al
          Contenido de un Negocio, Wintuu puede remover o suspender ese Contenido en forma preventiva mientras se
          resuelve el reclamo.
        </p>
        <p>
          <strong>Wintuu no redacta, no revisa ni verifica la exactitud, legalidad o vigencia de los precios,
          descripciones, promociones o cualquier otro dato que un Negocio cargue.</strong> El Negocio es el único
          responsable de que sus precios, sus cupones y su información de contacto estén actualizados y sean
          correctos, y de responder ante sus Clientes por cualquier error, ambigüedad o desactualización en ese
          Contenido. Al aceptar estas Condiciones, el Negocio reconoce y acepta expresamente que es el responsable
          principal de su app frente a sus propios Clientes, incluyendo su Contenido y el cumplimiento de la
          normativa aplicable a su propia actividad comercial (por ejemplo, defensa del consumidor, lealtad
          comercial, y protección de datos personales respecto de sus Clientes).
        </p>
      </Section>

      <Section id="uso-aceptable" title="11. Uso aceptable">
        <p>No está permitido usar Wintuu para:</p>
        <ul className="list-disc pl-5">
          <li>Registrar puntos o canjes falsos, o manipular el sistema de cupones para beneficiarte de forma indebida.</li>
          <li>Crear cuentas falsas o repetidas para abusar de la prueba gratuita o de cualquier promoción.</li>
          <li>Publicar contenido ilegal, engañoso, discriminatorio, difamatorio o que suplante a otra persona o negocio.</li>
          <li>Intentar acceder a datos de otro Negocio o de otro Cliente sin autorización, o realizar ingeniería inversa, escaneo de vulnerabilidades no autorizado, o cualquier intento de vulnerar la seguridad de la plataforma.</li>
          <li>Usar la plataforma para enviar comunicaciones no solicitadas (spam) a Clientes que no lo consintieron.</li>
        </ul>
        <p className="mt-2">
          El incumplimiento de este punto habilita a Wintuu a suspender o eliminar la cuenta involucrada conforme el
          punto 8, sin perjuicio de las acciones legales que pudieran corresponder.
        </p>
      </Section>

      <Section id="disponibilidad" title="12. Disponibilidad del servicio y cambios">
        <p>
          Hacemos lo posible por mantener Wintuu disponible de forma estable, pero como toda plataforma en internet
          puede tener interrupciones por mantenimiento programado, fallas de proveedores externos (por ejemplo Mercado
          Pago, Google o nuestro proveedor de infraestructura) o causas de fuerza mayor. No garantizamos disponibilidad
          del 100% del tiempo. Wintuu puede agregar, modificar o discontinuar funcionalidades de la plataforma en
          cualquier momento; si una discontinuación afecta una función central del servicio contratado, te vamos a
          avisar con anticipación razonable.
        </p>
      </Section>

      <Section id="garantias" title='13. Garantías (servicio provisto "tal cual")'>
        <p>
          En la máxima medida permitida por la ley aplicable, Wintuu se provee "tal cual" ("as is") y "según
          disponibilidad", sin garantías de ningún tipo, expresas o implícitas, incluyendo garantías de
          comerciabilidad, idoneidad para un fin particular, o que el servicio será ininterrumpido, oportuno, seguro o
          libre de errores. Esto no limita ninguna garantía legal irrenunciable que te corresponda como consumidor
          bajo la Ley 24.240 en la medida en que dicha ley resulte aplicable a tu relación con Wintuu.
        </p>
      </Section>

      <Section id="limitacion-de-responsabilidad" title="14. Límite de responsabilidad">
        <p>
          En la máxima medida que permita la ley aplicable, la responsabilidad total de Wintuu frente a un Negocio por
          cualquier reclamo relacionado con el servicio (ya sea por incumplimiento contractual, culpa, o cualquier
          otra causa) se limita al monto efectivamente pagado por ese Negocio a Wintuu en los últimos 12 meses previos
          al hecho que origina el reclamo. Wintuu no responde por daños indirectos, incidentales, punitivos, lucro
          cesante o pérdida de Clientes o de chance, atribuibles a decisiones comerciales del Negocio, a la conducta de
          terceros (Google, Mercado Pago, proveedores de internet o de infraestructura) o a un uso indebido de la
          plataforma por parte del Negocio, sus dependientes o sus Clientes.
        </p>
      </Section>

      <Section id="indemnidad" title="15. Indemnidad">
        <p>
          El Negocio se compromete a mantener indemne a Wintuu, sus directivos, empleados y colaboradores, frente a
          cualquier reclamo, daño, pérdida o gasto (incluyendo honorarios legales razonables) que surja de: (a) el
          Contenido que el Negocio carga en su perfil; (b) la relación de consumo entre el Negocio y sus Clientes,
          incluyendo reclamos por cupones, premios, productos o servicios ofrecidos por el Negocio; o (c) el
          incumplimiento por parte del Negocio de estas Condiciones o de la normativa aplicable a su actividad.
        </p>
      </Section>

      <Section id="fuerza-mayor" title="16. Caso fortuito y fuerza mayor">
        <p>
          Ninguna de las partes será responsable por incumplimientos o demoras causados por circunstancias fuera de su
          control razonable, incluyendo fallas generalizadas de internet, cortes de energía prolongados, desastres
          naturales, pandemias, actos de gobierno, o fallas de proveedores externos esenciales (Google, Mercado Pago,
          proveedores de infraestructura en la nube).
        </p>
      </Section>

      <Section id="cesion" title="17. Cesión del contrato">
        <p>
          El Negocio no puede ceder ni transferir su cuenta o los derechos y obligaciones derivados de estas
          Condiciones sin el consentimiento previo y por escrito de Wintuu. Wintuu puede ceder estas Condiciones, en
          todo o en parte, en el marco de una fusión, adquisición, reorganización societaria o venta de la totalidad o
          parte de sus activos, notificándolo previamente.
        </p>
      </Section>

      <Section id="divisibilidad" title="18. Divisibilidad y renuncia">
        <p>
          Si alguna cláusula de estas Condiciones fuera declarada inválida o inaplicable por un tribunal competente,
          esa cláusula se interpretará de la forma que más se aproxime a su intención original dentro de lo permitido
          por la ley, y el resto de las Condiciones permanecerá plenamente vigente. Que Wintuu no ejerza en un momento
          dado un derecho previsto en estas Condiciones no implica que renuncie a ejercerlo en el futuro.
        </p>
      </Section>

      <Section id="acuerdo-integro" title="19. Acuerdo íntegro">
        <p>
          Estas Condiciones, junto con la Política de Privacidad y cualquier término adicional específico que se te
          haya informado al contratar un plan, constituyen el acuerdo completo entre el Negocio y Wintuu respecto del
          uso de la plataforma, y reemplazan cualquier acuerdo o entendimiento previo sobre el mismo objeto.
        </p>
      </Section>

      <Section id="cambios-a-estas-condiciones" title="20. Cambios a estas Condiciones">
        <p>
          Podemos actualizar estas Condiciones a medida que Wintuu suma o cambia funciones, o cuando lo exija un
          cambio normativo. Si el cambio afecta derechos u obligaciones de forma relevante, lo vamos a comunicar dentro
          de la plataforma con una anticipación mínima de 15 días antes de que entre en vigencia. Seguir usando
          Wintuu después de ese aviso implica aceptar la versión actualizada; si no estás de acuerdo, podés cancelar
          tu cuenta antes de que el cambio entre en vigencia.
        </p>
      </Section>

      <Section id="resolucion-de-conflictos" title="21. Resolución de conflictos">
        <p>
          Ante cualquier desacuerdo, primero vamos a intentar resolverlo de buena fe y de forma directa, escribiéndonos
          por los canales de contacto de esta página. Si tu reclamo encuadra como relación de consumo y no logramos un
          acuerdo directo, podés acudir al Sistema de Resolución de Conflictos en las Relaciones de Consumo (COPREC,
          Ley 26.993) o a la autoridad de aplicación de defensa del consumidor de tu jurisdicción, sin costo para vos.
        </p>
      </Section>

      <Section id="ley-aplicable" title="22. Ley aplicable y jurisdicción">
        <p>
          Estas Condiciones se rigen por las leyes de la República Argentina, incluyendo la Ley de Defensa del
          Consumidor N.º 24.240 y el Código Civil y Comercial de la Nación cuando corresponda. Ante cualquier
          controversia que no se resuelva por las vías del punto 21, las partes se someten a la jurisdicción de los
          tribunales ordinarios competentes de la Ciudad Autónoma de Buenos Aires, sin perjuicio del fuero que la ley
          establezca como irrenunciable para el consumidor.
        </p>
      </Section>

      <Section id="contacto" title="23. Contacto">
        <p>
          ¿Dudas sobre estas Condiciones?{' '}
          <a href={WA} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">
            Escribinos por WhatsApp
          </a>{' '}
          antes de aceptar, si algo no te queda claro.
        </p>
      </Section>

      <p className="mt-2 rounded-2xl border border-[var(--wt-border)] bg-[var(--wt-surface-raised)] p-4 text-[13px] leading-relaxed text-[var(--wt-muted)]">
        Este documento fue redactado con la mayor precisión posible en base al funcionamiento real de Wintuu y a la
        normativa argentina vigente (Código Civil y Comercial, Ley 24.240 de Defensa del Consumidor, Ley 25.326 de
        Protección de Datos Personales), pero no reemplaza el asesoramiento de un abogado matriculado. Antes de
        tratarlo como definitivo, te recomendamos que lo revise un profesional especializado en derecho comercial y de
        consumidor, sobre todo si vas a operar con Clientes fuera de la Argentina.
      </p>
    </LegalLayout>
  );
}
