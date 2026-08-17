import { z } from "zod";

// EVM Address regex: 0x + 40 hex characters
export const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const whitelistSubmitSchema = z.object({
  walletAddress: z
    .string()
    .trim()
    .regex(evmAddressRegex, { message: "Invalid EVM wallet address. Must start with 0x followed by 40 hex characters." }),
  discordUsername: z
    .string()
    .trim()
    .min(2, { message: "Discord username must be at least 2 characters." })
    .max(50, { message: "Discord username is too long." }),
  twitterUsername: z
    .string()
    .trim()
    .min(2, { message: "X/Twitter handle must be at least 2 characters." })
    .max(50, { message: "X/Twitter handle is too long." })
    .transform((val) => (val.startsWith("@") ? val : `@${val}`)),
  email: z.string().trim().email({ message: "Invalid email address format." }).optional().or(z.literal("")),
  referralCode: z.string().trim().max(50).optional().or(z.literal("")),
  completedTaskIds: z.array(z.string()).min(1, { message: "You must complete the required tasks." }),
  captchaToken: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  type: z.enum(["x_follow", "x_like", "x_repost", "discord_join", "telegram_join", "submit_wallet", "custom"]),
  url: z.string().trim().optional().or(z.literal("")),
  points: z.number().int().min(0).max(1000),
  required: z.boolean(),
  verificationType: z.enum(["manual", "url", "api"]),
  active: z.boolean(),
  sortOrder: z.number().int(),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
