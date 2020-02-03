import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

export /**
 * Checks role to make sure its admin
 *
 * @param {Array<string>} roles
 * @returns
 */
const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //retrieve user id from prev middleware
    const id = res.locals.jwtPayload.userId;

    //retrieve user role from db
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    //make sure of auth roles contains specfic role
    if (roles.indexOf(user.role) > -1) next();
    else res.status(401).send();
  };
};
