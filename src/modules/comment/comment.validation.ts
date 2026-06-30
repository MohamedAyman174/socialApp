import * as z from "zod";

export const createCommentSchema = z.object({
    content: z.string().min(1).max(2000).optional(),
});

export const createReplySchema = z.object({
    content: z.string().min(1).max(2000).optional(),
});

export type ICreateCommentType = z.infer<typeof createCommentSchema>;
export type ICreateReplyType = z.infer<typeof createReplySchema>;

export default {
    createCommentSchema,
    createReplySchema,
};