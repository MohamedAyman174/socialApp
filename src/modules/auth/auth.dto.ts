import { z } from "zod";
import { confirmEmailSchema, signUpSchema , signInSchema} from "./auth.validation";
import e from "express";


export type signupDTO = z.infer<typeof signUpSchema>;
export type signInDTO = z.infer<typeof signInSchema>;
export type confirmEmailDTO = z.infer<typeof confirmEmailSchema>;