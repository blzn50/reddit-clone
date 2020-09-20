import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Updoot } from '../entities/Updoot';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('point', () => Int) point: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = point !== -1;
    const realPoint = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // already voted, wants to change
    if (updoot && updoot.point !== realPoint) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `update updoot set point = $3
          where "postId" = $2 and "userId" = $1;
          `,
          [userId, postId, realPoint]
        );

        await tm.query(
          `update post set points = points + $2
          where id = $1;
          `,
          [postId, 2 * realPoint]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          insert into updoot ("userId", "postId", point) 
          values ($1, $2, $3);
          `,
          [userId, postId, realPoint]
        );

        await tm.query(
          `update post set points = points + $2
          where id = $1;
          `,
          [postId, realPoint]
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int!) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne, req.session.userId];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
    select p.*, 
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator, 
      ${
        req.session.userId
          ? '(select point from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
          : 'null as "voteStatus"'
      }
    from post p
    inner join "user" u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $3` : ''}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(realLimitPlusOne);

    // const posts = await qb.getMany();
    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(@Arg('input') input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | undefined> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return undefined;
    }

    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
