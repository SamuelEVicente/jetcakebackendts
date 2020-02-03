import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import { User } from "./entity/User";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
const typeOrmConfig : PostgresConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  synchronize: true,
  logging: false,
  entities: [
  User
  ]
};

//Connects to the Database -> then starts the express
createConnection(typeOrmConfig)
  .then(async connection => {
    // Create a new express application instance
    const app = express();

    // Call midlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    //Set all routes from routes folder
    app.use("/", routes);

    app.listen(4000, () => {
      console.log("Server started on port 4000!");
    });
  })
  .catch(error => console.log(error));
