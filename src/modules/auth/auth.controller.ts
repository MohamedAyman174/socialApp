import { Router } from "express";
import authService from "./auth.service";
import { confirmEmailSchema, signUpSchema } from "./auth.validation";
import { Validation } from "../../common/middleware/validation";
import * as authValidation from "./auth.validation";
import { authentication } from "../../common/middleware/authentication";

const authRouter = Router();



authRouter.post("/signup", Validation(authValidation.signUpSchema), authService.signUp); 
authRouter.post("/signin", Validation(authValidation.signInSchema), authService.signIn);
authRouter.post("/confirm-email", Validation(authValidation.confirmEmailSchema), authService.confirmEmail);
authRouter.get("/profile/:id", authService.getProfile);



export default authRouter;
