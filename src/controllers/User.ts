import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { User } from "../entity/User";
import { jwtSecret } from "../config";
import * as jwt from "jsonwebtoken";

/**
 * User Class containing CRUD functinality
 * for users
 * @export
 * @class UserController
 */
export default class UserController {
  /**
   * List all users in the db
   *
   * @static
   * @memberof UserController
   */
  static listAll = async (req: Request, res: Response) => {
    //get user from db
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      select: ["id", "email", "role"] //dont send the passwords on response so only select whats needed
    });

    //send the users object
    res.send(users);
  };

  /**
   * Retrieves a user by id and returns user object
   *
   * @static
   * @memberof UserController
   */
  static getOneById = async (req: Request, res: Response) => {
    //retrieve id from jwt
    const id: string = req.params.id;

    //get user from db
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id, {
        select: ["id", "email", "role", "birth", "phone", "address", "photoUrl"] //We dont want to send the password on response
      });
      res.send(user);
    } catch (error) {
      res.status(404).send("User not found");
    }
  };

  static getOneByEmail = async (req: Request, res: Response) => {
    //retrieve id from jwt
    const email: string = req.params.email;

    //get user from db
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(
        { email: email },
        {
          select: [
            "id",
            "email",
            "role",
            "birth",
            "phone",
            "address",
            "photoUrl",
            "securityAnswers",
            "securityQuestions"
          ] //We dont want to send the password on response
        }
      );
      res.send({user});
    } catch (error) {
      res.status(404).send("User not found");
    }
  };

  /**
   * Creates new user in db
   *
   * @static
   * @memberof UserController
   */
  static newUser = async (req: Request, res: Response) => {
    //retrieve parameters from the body
    let {
      phone,
      address,
      email,
      password,
      role,
      securityQuestions,
      securityAnswers,
      photoUrl,
      birth
    } = req.body;

    let user = new User();
    user.phone = phone;
    user.address = address;
    user.email = email;
    user.password = password;
    user.role = role;
    user.securityAnswers = securityAnswers;
    user.securityQuestions = securityQuestions;
    user.photoUrl = photoUrl;
    user.birth = birth;

    //validate parameters of users
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //hash password for secure storage
    user.hashPassword();

    //save, if fails, email is in use
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send("email already in use");
      return;
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "1h"
    });
    res.status(201).send({ message: "User created", user, token });
  };

  /**
   * Edit user in db
   *
   * @static
   * @memberof UserController
   */
  static editUser = async (req: Request, res: Response) => {
    //retrieve values from the body
    const {
      phone,
      address,
      email,
      password,
      role,
      securityQuestions,
      securityAnswers,
      photoUrl,
      birth
    } = req.body;

    //find user on db
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ email: req.params.email });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("User not found");
      return;
    }

    //validate values on model
    user.phone = phone;
    user.address = address;
    user.email = email;
    user.password = password;
    user.role = role;
    user.securityAnswers = securityAnswers;
    user.securityQuestions = securityQuestions;
    user.photoUrl = photoUrl;
    user.birth = birth;

    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //save, if fails, email already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send("email already in use");
      return;
    }
    res.status(204).send();
  };

  /**
   * Delete user from db
   *
   * @static
   * @memberof UserController
   */
  static deleteUser = async (req: Request, res: Response) => {
    //retrieve id from params
    const email = req.params.email;

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ email: email });
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    userRepository.delete({ email: email });

    res.status(204).send();
  };
}
