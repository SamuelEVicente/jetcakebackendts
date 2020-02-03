import { Router } from "express";
import { checkJwt } from "../middlewares/JWT";
import AuthController from "../controllers/Auth";

const router = Router();

router.post("/login", AuthController.login);

router.post("/change-password", [checkJwt], AuthController.changePassword);

export default router;