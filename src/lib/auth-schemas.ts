import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Informe seu e-mail." })
    .email({ message: "E-mail inválido." })
    .max(255, { message: "E-mail muito longo." }),
  password: z.string().min(1, { message: "Informe sua senha." }).max(72),
});

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: "Informe seu nome completo (mínimo 3 caracteres)." })
      .max(100, { message: "Nome muito longo (máximo 100 caracteres)." }),
    company: z
      .string()
      .trim()
      .min(2, { message: "Informe o nome da empresa (ou 'Autônomo')." })
      .max(120, { message: "Nome da empresa muito longo." }),
    phone: z
      .string()
      .trim()
      .max(20, { message: "Telefone muito longo." })
      .refine((v) => v === "" || /^[\d\s()+-]{10,20}$/.test(v), {
        message: "Telefone/WhatsApp inválido. Use apenas números, espaços, ( ) + -.",
      }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Informe seu e-mail." })
      .email({ message: "E-mail inválido." })
      .max(255, { message: "E-mail muito longo." }),
    password: z
      .string()
      .min(8, { message: "A senha precisa de no mínimo 8 caracteres." })
      .max(72, { message: "A senha pode ter no máximo 72 caracteres." })
      .regex(/[A-Za-z]/, { message: "A senha precisa conter ao menos uma letra." })
      .regex(/\d/, { message: "A senha precisa conter ao menos um número." }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });

export type SignUpValues = z.infer<typeof signUpSchema>;
export type FieldErrors = Partial<Record<string, string>>;

export function collectErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Mensagens amigáveis para os erros mais comuns do provedor de autenticação. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já possui cadastro. Use a aba 'Entrar' ou recupere sua senha.";
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  if (m.includes("password should be")) return "Senha muito fraca. Use ao menos 8 caracteres com letras e números.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  if (m.includes("network")) return "Falha de conexão. Verifique sua internet e tente novamente.";
  return message;
}
