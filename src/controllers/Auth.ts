import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";
import { jwtSecret } from "../config";

/**
 * Authenication Class containing
 * static functions login / changePassword
 * for users to be able to login/change password
 * @export
 * @class AuthController
 */
export default class AuthController {
  /**
   * Will recieve email and password to login
   * and make sure password matches if not returns failure
   * @static
   * @memberof AuthController
   */
  static login = async (req: Request, res: Response) => {
    //make sure email and password are set if not respond 400
    let { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send();
    }

    //get user from db
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      res.status(401).send();
    }

    //make sure encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }

    //sign jwt, expires in 1hr
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "1h"
    });

    //respond with token for client
    res.send({token, user});
  };

  /**
   * Recieves old and new password to
   * verify old password and update it to the new password
   * @static
   * @memberof AuthController
   */
  static changePassword = async (req: Request, res: Response) => {
    //retrieve id from jwt
    const id = res.locals.jwtPayload.userId;

    //destruct old/new password from body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    //get user from db
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    //make sure old password matches
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    //validate the model
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    //has the password and save
    user.hashPassword();
    userRepository.save(user);

    res.status(204).send();
  };
}
