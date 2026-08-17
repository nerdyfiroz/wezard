import { z } from "zod";

// EVM Address regex: 0x + 40 hex characters
export const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const whitelistSubmitSchema = z.object({
  walletAddress: z
    .string()
    .trim()
    .regex(evmAddressRegex, { message: "Invalid EVM wallet address. Must start with 0x followed by 40 hex characters." }),
  proofDetails: z.string().trim().max(1000, "Proof details must be under 1000 characters.").optional().or(z.literal("")),
  email: z.string().trim().email({ message: "Invalid email address format." }).optional().or(z.literal("")),
  completedTaskIds: z.array(z.string()).min(1, { message: "You must complete all required quests." }),
  mathChallengeId: z.string().min(1, { message: "Math CAPTCHA challenge ID is required." }),
  mathAnswer: z.union([z.string(), z.number()]),
});

export const taskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  type: z.enum(["x_follow", "x_like", "x_repost", "visit_url", "submit_wallet", "custom"]),
  url: z.string().trim().optional().or(z.literal("")),
  required: z.boolean(),
  verificationType: z.enum(["manual", "url", "api"]),
  active: z.boolean(),
  sortOrder: z.number().int(),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
