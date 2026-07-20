import { z } from "zod";

import { RESERVED_USERNAMES, USERNAME_REGEX } from "./constants";

export const usernameSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(32, "At most 32 characters")
  .regex(USERNAME_REGEX, "Lowercase letters, numbers and hyphens only")
  .refine((v) => !RESERVED_USERNAMES.has(v), "This username is reserved");

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !!url.hostname;
  } catch {
    return false;
  }
}

const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine(isHttpUrl, "Must be a valid HTTP(S) URL");

const urlOrEmpty = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isHttpUrl(v), "Must be a valid HTTP(S) URL")
  .optional();

export const profileSchema = z.object({
  username: usernameSchema,
  headline: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  avatarUrl: urlOrEmpty,
  availability: z.enum(["AVAILABLE", "LIMITED", "UNAVAILABLE"]),
  availabilityNote: z.string().trim().max(160).optional().or(z.literal("")),
  bookingUrl: urlOrEmpty,
  website: urlOrEmpty,
  theme: z.enum(["system", "light", "dark"]),
  socials: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        url: httpUrl,
      }),
    )
    .max(10)
    .default([]),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  priceType: z.enum(["FIXED", "STARTING_AT", "ON_REQUEST"]),
  priceCents: z.number().int().min(0).max(100_000_000).nullable(),
  currency: z.string().trim().length(3).default("USD"),
  deliveryDays: z.number().int().min(1).max(365).nullable(),
  technologies: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  published: z.boolean().default(true),
});

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  summary: z.string().trim().min(10).max(280),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  imageUrl: urlOrEmpty,
  videoUrl: urlOrEmpty,
  repoUrl: urlOrEmpty,
  liveUrl: urlOrEmpty,
  technologies: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  year: z.number().int().min(1990).max(2100).nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  authorRole: z.string().trim().max(80).optional().or(z.literal("")),
  authorCompany: z.string().trim().max(80).optional().or(z.literal("")),
  content: z.string().trim().min(10).max(1000),
  published: z.boolean().default(true),
});

export const experienceSchema = z.object({
  company: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
    .optional()
    .or(z.literal("")),
  current: z.boolean().default(false),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(40),
  category: z.string().trim().max(40).optional().or(z.literal("")),
});

export const certificationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  issuer: z.string().trim().min(2).max(120),
  year: z.number().int().min(1950).max(2100).nullable(),
  url: urlOrEmpty,
});

export const leadSchema = z.object({
  username: usernameSchema,
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email"),
  budget: z.string().trim().max(40).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more about the project (min. 20 characters)")
    .max(2000),
});

export const leadStatusSchema = z.enum([
  "NEW",
  "READ",
  "QUALIFIED",
  "WON",
  "LOST",
  "ARCHIVED",
]);

export const leadDetailsSchema = z.object({
  valueCents: z.number().int().min(0).max(100_000_000).nullable(),
  currency: z.string().trim().length(3).regex(/^[A-Za-z]{3}$/),
  nextFollowUp: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }, "Enter a valid follow-up date")
    .nullable(),
});

export const leadNoteSchema = z.string().trim().min(1).max(2000);

export type ProfileInput = z.infer<typeof profileSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
