import { z } from "zod";
import { createCommentSchema, createReplySchema } from "./comment.validation";

export type createCommentDTO = z.infer<typeof createCommentSchema>;
export type createReplyDTO = z.infer<typeof createReplySchema>;