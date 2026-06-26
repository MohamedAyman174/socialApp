import { z } from "zod";
import { confirmEmailSchema, signUpSchema, signInSchema, resendOtpSchema, googleLoginSchema } from "./auth.validation";


export type signupDTO = z.infer<typeof signUpSchema>;
export type signInDTO = z.infer<typeof signInSchema>;
export type confirmEmailDTO = z.infer<typeof confirmEmailSchema>;
export type resendOtpDTO = z.infer<typeof resendOtpSchema>;
export type googleLoginDTO = z.infer<typeof googleLoginSchema>;