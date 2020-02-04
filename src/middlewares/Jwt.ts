import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { jwtSecret } from "../config";

export /**
 * Checks token from header and signs jwt
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns
 */
const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  //retrieve token from the head
  const token = <string>req.headers["auth"];
  let jwtPayload;

  //validate the token and get data, if fail send 401
  try {
    jwtPayload = <any>jwt.verify(token, jwtSecret);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }

  //token valid for 1hr
  //send a new token on every request
  const { userId, email } = jwtPayload;
  const newToken = jwt.sign({ userId, email }, jwtSecret, {
    expiresIn: "1h"
  });
  res.setHeader("token", newToken);

  next();
};
