import { z } from "zod";

export const loginEmailSchema = z.object({
  identifier: z.string().min(2, "Email atau username wajib diisi"),
  password: z.string().min(4, "Kata sandi minimal 4 karakter"),
});

export const magicLinkSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const otpLoginSchema = z.object({
  target: z.string().min(3, "Email atau nomor telepon wajib diisi"),
  otp: z.string().min(4, "Kode OTP minimal 4 digit").max(8),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  username: z.string().optional(),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const verifyTwoFactorSchema = z.object({
  code: z.string().min(6, "Masukkan minimal 6 karakter kode"),
});

export type LoginEmailValues = z.infer<typeof loginEmailSchema>;
export type MagicLinkValues = z.infer<typeof magicLinkSchema>;
export type OtpLoginValues = z.infer<typeof otpLoginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyTwoFactorValues = z.infer<typeof verifyTwoFactorSchema>;
