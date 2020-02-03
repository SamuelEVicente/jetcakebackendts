import { MigrationInterface, QueryRunner, getRepository } from "typeorm";
import { User } from "../entity/User";

export class CreateUser implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    let user = new User();
    user.role = "ADMIN";
    user.photoUrl = "url.url";
    user.email = "samuel.vicente@live.com";
    user.password = "PassWord";
    user.phone = "210-273-1278";
    user.address = "6119 Higbee";
    user.securityAnswers = "1";
    user.securityQuestions = "1";
    user.birth = "08/22/1994";

    user.hashPassword();
    const userRepository = getRepository(User);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
