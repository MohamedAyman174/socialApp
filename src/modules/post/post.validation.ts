import * as z from "zod";
import { AvailabilityEnum, AllowCommentsEnum } from "../../common/enum/post.enum";

export const createPostSchema = z.object({
    content: z.string().min(2).max(5000).optional(),
    availability: z.enum(AvailabilityEnum).optional(),
    allowComments: z.enum(AllowCommentsEnum).optional(),
    tags: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
    
    if (data.tags && new Set(data.tags).size !== data.tags.length) {
        ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Duplicate tags are not allowed",
        });
    }
});

export const updatePostSchema = z.object({
    content: z.string().min(2).max(5000).optional(),
    availability: z.enum(AvailabilityEnum).optional(),
    allowComments: z.enum(AllowCommentsEnum).optional(),
    tags: z.array(z.string()).optional(),
});

export const getPostsSchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
});

export type ICreatePostType = z.infer<typeof createPostSchema>;
export type IUpdatePostType = z.infer<typeof updatePostSchema>;
export type IGetPostsType = z.infer<typeof getPostsSchema>;

export default {
    createPostSchema,
    updatePostSchema,
    getPostsSchema,
};