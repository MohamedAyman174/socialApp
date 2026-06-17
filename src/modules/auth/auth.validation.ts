
import * as z from "zod";

import { GenderEnum } from "../../common/enum/user.enum";



export const signUpSchema = z.object({
    userName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    cPassword: z.string().min(6),
    age: z.number().min(18),
    phone: z.string().optional(),
    address: z.string().optional(),
    gender: z.enum(GenderEnum).optional(),
}).superRefine((data, ctx) => {
    if (data.password !== data.cPassword) {
        ctx.addIssue({
            code: "custom",
            path: ["cPassword"],
            message: "Passwords do not match",
        })
    }
})

export const confirmEmailSchema = z.object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number"),

})

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    
})






export type ISignUpType = z.infer<typeof signUpSchema>;
export type IConfirmEmailType = z.infer<typeof confirmEmailSchema>;
export type ISignInType = z.infer<typeof signInSchema>;
export default {
    signUpSchema,
    confirmEmailSchema,
    signInSchema
}