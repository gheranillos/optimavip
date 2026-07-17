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
  const body = `
    <p>Hola ${opts.realtorName ?? ""},</p>
    <p>Recibiste una nueva consulta${opts.propertyTitle ? ` por <strong>${opts.propertyTitle}</strong>` : ""}:</p>
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
    subject: "Nueva consulta — OPTIMA VIP",
    replyTo: opts.email || undefined,
    html: brandEmailLayout("Nueva consulta", body),
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
