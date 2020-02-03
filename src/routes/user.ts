import { Router } from "express";
import { checkJwt } from "../middlewares/JWT";
import { checkRole } from "../middlewares/Role";
import UserController from "../controllers/User";

const router = Router();

//get all users
router.get("/", [checkJwt, checkRole(["ADMIN"])], UserController.listAll);

// get user by id
router.get(
  "/:email",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.getOneByEmail
);

//create a new user
router.post("/", UserController.newUser);

//edit user
router.patch(
  "/:email",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.editUser
);

//delete user
router.delete(
  "/:email",
  [checkJwt, checkRole(["ADMIN"])],
  UserController.deleteUser
);

export default router;
