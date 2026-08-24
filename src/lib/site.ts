export const WHATSAPP_NUMBER = "5551996668646";
export const WHATSAPP_DISPLAY = "+55 51 99666-8646";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const SITE_NAME = "AguiarT.I";
export const SITE_EMAIL = "contato@aguiarti.com.br";
export const SITE_CITY = "Porto Alegre - RS, Brasil";
