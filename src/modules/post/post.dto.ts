import { z } from "zod";
import { createPostSchema, updatePostSchema, getPostsSchema } from "./post.validation";

export type createPostDTO = z.infer<typeof createPostSchema>;
export type updatePostDTO = z.infer<typeof updatePostSchema>;
export type getPostsDTO = z.infer<typeof getPostsSchema>;