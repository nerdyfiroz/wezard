import { z } from "zod";

// EVM Address regex: 0x + 40 hex characters
export const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const whitelistSubmitSchema = z.object({
  walletAddress: z
    .string()
    .trim()
    .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: "Invalid EVM wallet address. Must start with 0x followed by 40 hexadecimal characters (0-9, a-f).",
    }),
  twitterUsername: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? (val.startsWith("@") ? val : `@${val}`) : "")),
  replyCommentLink: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().optional().or(z.literal("")),
  completedTaskIds: z.array(z.string()).min(1, { message: "You must complete all required quests." }),
  mathChallengeId: z.string().min(1, { message: "Math CAPTCHA challenge ID is required." }),
  mathAnswer: z.union([z.string(), z.number()]),
  // Per-task proof URLs keyed by taskId
  taskProofs: z.record(z.string(), z.string()).optional(),
});

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(255),
  description: z.string().trim().optional().default("").or(z.literal("")),
  type: z.enum(["x_follow", "x_like", "x_repost", "visit_url", "submit_wallet", "custom"]),
  url: z.string().trim().optional().or(z.literal("")),
  required: z.boolean(),
  verificationType: z.enum(["manual", "url", "api"]),
  active: z.boolean(),
  sortOrder: z.number().int(),
  proofLabel: z.string().trim().max(255).optional().or(z.literal("")),
  proofRequired: z.boolean().optional(),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
