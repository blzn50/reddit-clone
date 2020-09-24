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
import { User } from '../entities/User';
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
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() post: Post, @Ctx() { updootLoader, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({ postId: post.id, userId: req.session.userId });
    return updoot ? updoot.point : null;
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
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ''}
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
  async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(@Arg('input') input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | undefined> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return undefined;
    }

    if (post.creatorId !== req.session.userId) {
      throw new Error('not authorized');
    }

    if (typeof title !== 'undefined' && typeof text !== 'undefined') {
      const updatedPost = await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({ title, text })
        .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId })
        .returning('*')
        .execute();
      return updatedPost.raw[0];
    }
    return;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Arg('id', () => Int) id: number, @Ctx() { req }: MyContext): Promise<boolean> {
    const post = await Post.findOne({ id });

    if (!post) {
      return false;
    }

    if (post.creatorId !== req.session.userId) {
      throw new Error('not authorized');
    }

    await Updoot.delete({ postId: id });
    await Post.delete({ id });
    return true;
  }
}
