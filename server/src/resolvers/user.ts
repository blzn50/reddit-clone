import { FORGOT_PASSWORD_PREFIX } from './../constants';
import { Resolver, Query, Mutation, Arg, Field, ObjectType, Ctx } from 'type-graphql';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/User';
import { getConnection } from 'typeorm';
import { MyContext } from '../types';
import { COOKIE_NAME } from '../constants';
import { sendMail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';
import { UsernamePasswordInput } from '../utils/UsernamePasswordInput';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Arg('confirmPassword') confirmPassword: string,
    @Ctx() { redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 5) {
      return {
        errors: [{ field: 'newPassword', message: 'Password must be longer than 5 characters' }],
      };
    }

    if (confirmPassword !== newPassword) {
      return { errors: [{ field: 'confirmPassword', message: 'Both passwords must match' }] };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [{ field: 'token', message: 'Token expired' }],
      };
    }

    const user = await User.findOne({ id: parseInt(userId) });
    if (!user) {
      return {
        errors: [{ field: 'token', message: 'User no longer exists' }],
      };
    }

    user.password = await argon2.hash(newPassword);

    // save updated user
    await user.save();

    // remove key from redis
    await redis.del(key);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { redis }: MyContext) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('user not found');

      return true;
    }
    const token = uuidv4();
    await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 2);
    sendMail(email, `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`);
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return undefined;
    }

    return User.findOne({ id: req.session.userId });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({ username: options.username, email: options.email, password: hashedPassword })
        .returning('*')
        .execute();
      user = result.raw[0];
    } catch (error) {
      if (error.code === '23505') {
        return {
          errors: [{ field: 'username', message: 'Username already taken' }],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [{ field: 'usernameOrEmail', message: "The account doesn't exists" }],
      };
    }
    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [{ field: 'password', message: 'Incorrect password' }],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log('err in logout', err);

          resolve(false);
          return;
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }

  // @Mutation(() => String)
  // async changePassword(@Arg('token') token: string, @Arg('newPassword') newPassword: string): Promise<> {
  //   if(newPassword.length <=2){
  //     return {
  //       errors: [
  //         {
  //           field: 'newPassword',
  //           message: 'Length must be greater than 2'
  //         }
  //       ]
  //     }
  //   }

  //   const userId = parseInt(id)
  //   const user = await User.findOne(userId);

  //   if(!user){
  //     return {
  //       errors: [
  //         {field: 'token', message: 'User no longer exists'}
  //       ]
  //     }
  //   }

  //   await User.update({id: userId}, {password: await })

  //   return {user}
  // }
}
