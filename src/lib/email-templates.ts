import { brandEmailLayout } from "@/lib/email-layout";
import { sendEmail } from "@/lib/email";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  "https://optimavip.vercel.app";

export async function emailInquiryReceived(opts: {
  to: string;
  realtorName?: string | null;
  clientName: string;
  phone: string;
  email?: string | null;
  message: string;
  propertyTitle?: string | null;
}) {
  const isGeneral = !opts.propertyTitle;
  const body = `
    <p>Hola ${opts.realtorName ?? ""},</p>
    <p>${
      isGeneral
        ? "Recibiste un <strong>nuevo contacto desde la web</strong>:"
        : `Recibiste una nueva consulta por <strong>${opts.propertyTitle}</strong>:`
    }</p>
    <ul>
      <li><strong>Nombre:</strong> ${opts.clientName}</li>
      <li><strong>Teléfono:</strong> ${opts.phone}</li>
      ${opts.email ? `<li><strong>Email:</strong> ${opts.email}</li>` : ""}
    </ul>
    <p>${opts.message}</p>
    <p><a href="${appUrl()}/es/dashboard/inquiries">Ver en el panel</a></p>
  `;
  return sendEmail({
    to: opts.to,
    subject: isGeneral
      ? "Nuevo contacto web — OPTIMA VIP"
      : "Nueva consulta — OPTIMA VIP",
    replyTo: opts.email || undefined,
    html: brandEmailLayout(
      isGeneral ? "Nuevo contacto" : "Nueva consulta",
      body
    ),
  });
}

export async function emailPropertyMatch(opts: {
  to: string;
  clientName?: string | null;
  propertyTitle: string;
  propertySlug: string;
  priceLabel: string;
  isOpportunity: boolean;
}) {
  const body = `
    <p>Hola ${opts.clientName ?? ""},</p>
    <p>${
      opts.isOpportunity
        ? "Hay una <strong>propiedad con precio de oportunidad</strong> que coincide con tu búsqueda guardada:"
        : "Hay una <strong>nueva propiedad</strong> que coincide con tu búsqueda guardada:"
    }</p>
    <p><strong>${opts.propertyTitle}</strong><br/>${opts.priceLabel}</p>
    <p><a href="${appUrl()}/es/properties/${opts.propertySlug}">Ver propiedad</a></p>
  `;
  return sendEmail({
    to: opts.to,
    subject: opts.isOpportunity
      ? "Precio de oportunidad — OPTIMA VIP"
      : "Nueva propiedad para ti — OPTIMA VIP",
    html: brandEmailLayout("Alerta de búsqueda", body),
  });
}

export async function emailRealtorApproved(opts: {
  to: string;
  name?: string | null;
}) {
  const body = `
    <p>Hola ${opts.name ?? ""},</p>
    <p>Tu cuenta de asesor fue <strong>aprobada</strong>. Ya puedes ingresar y publicar propiedades.</p>
    <p><a href="${appUrl()}/es/dashboard/properties">Ir al panel</a></p>
  `;
  return sendEmail({
    to: opts.to,
    subject: "Cuenta aprobada — OPTIMA VIP",
    html: brandEmailLayout("Bienvenido a OPTIMA VIP", body),
  });
}

export async function emailRealtorRejected(opts: {
  to: string;
  name?: string | null;
}) {
  const body = `
    <p>Hola ${opts.name ?? ""},</p>
    <p>Tu solicitud de asesor no fue aprobada por ahora. Si crees que es un error, contáctanos.</p>
    <p><a href="${appUrl()}/es/contact">Contactar OPTIMA VIP</a></p>
  `;
  return sendEmail({
    to: opts.to,
    subject: "Solicitud de asesor — OPTIMA VIP",
    html: brandEmailLayout("Solicitud de asesor", body),
  });
}

export async function emailAdminCreated(opts: {
  to: string;
  name?: string | null;
  temporaryPassword: string;
}) {
  const body = `
    <p>Hola ${opts.name ?? ""},</p>
    <p>Se creó tu cuenta de <strong>administrador</strong> en OPTIMA VIP.</p>
    <ul>
      <li><strong>Correo:</strong> ${opts.to}</li>
      <li><strong>Contraseña temporal:</strong> ${opts.temporaryPassword}</li>
    </ul>
    <p>Te recomendamos cambiarla al iniciar sesión.</p>
    <p><a href="${appUrl()}/es/login">Iniciar sesión</a></p>
  `;
  return sendEmail({
    to: opts.to,
    subject: "Cuenta de administrador — OPTIMA VIP",
    html: brandEmailLayout("Bienvenido al panel", body),
  });
}

export async function emailPasswordReset(opts: {
  to: string;
  name?: string | null;
  resetUrl: string;
}) {
  const body = `
    <p>Hola ${opts.name ?? ""},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p><a href="${opts.resetUrl}">Restablecer contraseña</a></p>
    <p>El enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
  `;
  return sendEmail({
    to: opts.to,
    subject: "Restablecer contraseña — OPTIMA VIP",
    html: brandEmailLayout("Restablecer contraseña", body),
  });
}

export async function emailPropertyApproved(opts: {
  to: string;
  name?: string | null;
  propertyTitle: string;
  propertySlug: string;
}) {
  const body = `
    <p>Hola ${opts.name ?? ""},</p>
    <p>Tu propiedad <strong>${opts.propertyTitle}</strong> fue <strong>aprobada</strong> y ya es visible al público.</p>
    <p>
      <a href="${appUrl()}/es/properties/${opts.propertySlug}">Ver publicación</a>
      ·
      <a href="${appUrl()}/es/dashboard/properties">Ir al panel</a>
    </p>
  `;
  return sendEmail({
    to: opts.to,
    subject: "Propiedad aprobada — OPTIMA VIP",
    html: brandEmailLayout("Propiedad aprobada", body),
  });
}

export async function emailPropertyRejected(opts: {
  to: string;
  name?: string | null;
  propertyTitle: string;
  reason: string;
}) {
  const body = `
    <p>Hola ${opts.name ?? ""},</p>
    <p>Tu propiedad <strong>${opts.propertyTitle}</strong> fue <strong>rechazada</strong>.</p>
    <p><strong>Motivo:</strong> ${opts.reason}</p>
    <p>Puedes editarla y volver a enviarla a revisión desde el panel.</p>
    <p><a href="${appUrl()}/es/dashboard/properties">Ir al panel</a></p>
  `;
  return sendEmail({
    to: opts.to,
    subject: "Propiedad rechazada — OPTIMA VIP",
    html: brandEmailLayout("Propiedad rechazada", body),
  });
}
