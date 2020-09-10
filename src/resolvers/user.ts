import { Resolver, Query, Mutation, Arg, InputType, Field, ObjectType } from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';
import { getConnection } from 'typeorm';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

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
  async register(@Arg('options') options: UsernamePasswordInput): Promise<UserResponse> {
    if (options.username.length <= 4) {
      return {
        errors: [{ field: 'username', message: 'Username must be longer than 4 characters' }],
      };
    }

    if (options.password.length <= 5) {
      return {
        errors: [{ field: 'username', message: 'Password must be longer than 5 characters' }],
      };
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
          errors: [{ field: 'username', message: 'Username already exists' }],
        };
      }
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [{ field: 'username/password', message: 'Username/password error' }],
      };
    }
    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [{ field: 'username/password', message: 'Username/password error' }],
      };
    }

    return { user };
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
