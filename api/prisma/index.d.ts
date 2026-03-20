
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model AuthCode
 * 
 */
export type AuthCode = $Result.DefaultSelection<Prisma.$AuthCodePayload>
/**
 * Model OutBoundEmail
 * 
 */
export type OutBoundEmail = $Result.DefaultSelection<Prisma.$OutBoundEmailPayload>
/**
 * Model OutBoundEmailQueue
 * 
 */
export type OutBoundEmailQueue = $Result.DefaultSelection<Prisma.$OutBoundEmailQueuePayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model Post
 * 
 */
export type Post = $Result.DefaultSelection<Prisma.$PostPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.authCode`: Exposes CRUD operations for the **AuthCode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthCodes
    * const authCodes = await prisma.authCode.findMany()
    * ```
    */
  get authCode(): Prisma.AuthCodeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outBoundEmail`: Exposes CRUD operations for the **OutBoundEmail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OutBoundEmails
    * const outBoundEmails = await prisma.outBoundEmail.findMany()
    * ```
    */
  get outBoundEmail(): Prisma.OutBoundEmailDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outBoundEmailQueue`: Exposes CRUD operations for the **OutBoundEmailQueue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OutBoundEmailQueues
    * const outBoundEmailQueues = await prisma.outBoundEmailQueue.findMany()
    * ```
    */
  get outBoundEmailQueue(): Prisma.OutBoundEmailQueueDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.post`: Exposes CRUD operations for the **Post** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Posts
    * const posts = await prisma.post.findMany()
    * ```
    */
  get post(): Prisma.PostDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.2
   * Query Engine version: 94a226be1cf2967af2541cca5529f0f7ba866919
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    AuthCode: 'AuthCode',
    OutBoundEmail: 'OutBoundEmail',
    OutBoundEmailQueue: 'OutBoundEmailQueue',
    Session: 'Session',
    Post: 'Post'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "authCode" | "outBoundEmail" | "outBoundEmailQueue" | "session" | "post"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      AuthCode: {
        payload: Prisma.$AuthCodePayload<ExtArgs>
        fields: Prisma.AuthCodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthCodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthCodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          findFirst: {
            args: Prisma.AuthCodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthCodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          findMany: {
            args: Prisma.AuthCodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>[]
          }
          create: {
            args: Prisma.AuthCodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          createMany: {
            args: Prisma.AuthCodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthCodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>[]
          }
          delete: {
            args: Prisma.AuthCodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          update: {
            args: Prisma.AuthCodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          deleteMany: {
            args: Prisma.AuthCodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthCodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuthCodeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>[]
          }
          upsert: {
            args: Prisma.AuthCodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthCodePayload>
          }
          aggregate: {
            args: Prisma.AuthCodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthCode>
          }
          groupBy: {
            args: Prisma.AuthCodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthCodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthCodeCountArgs<ExtArgs>
            result: $Utils.Optional<AuthCodeCountAggregateOutputType> | number
          }
        }
      }
      OutBoundEmail: {
        payload: Prisma.$OutBoundEmailPayload<ExtArgs>
        fields: Prisma.OutBoundEmailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutBoundEmailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutBoundEmailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>
          }
          findFirst: {
            args: Prisma.OutBoundEmailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutBoundEmailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>
          }
          findMany: {
            args: Prisma.OutBoundEmailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>[]
          }
          create: {
            args: Prisma.OutBoundEmailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>
          }
          createMany: {
            args: Prisma.OutBoundEmailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutBoundEmailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>[]
          }
          delete: {
            args: Prisma.OutBoundEmailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>
          }
          update: {
            args: Prisma.OutBoundEmailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>
          }
          deleteMany: {
            args: Prisma.OutBoundEmailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutBoundEmailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutBoundEmailUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>[]
          }
          upsert: {
            args: Prisma.OutBoundEmailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailPayload>
          }
          aggregate: {
            args: Prisma.OutBoundEmailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutBoundEmail>
          }
          groupBy: {
            args: Prisma.OutBoundEmailGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutBoundEmailGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutBoundEmailCountArgs<ExtArgs>
            result: $Utils.Optional<OutBoundEmailCountAggregateOutputType> | number
          }
        }
      }
      OutBoundEmailQueue: {
        payload: Prisma.$OutBoundEmailQueuePayload<ExtArgs>
        fields: Prisma.OutBoundEmailQueueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutBoundEmailQueueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutBoundEmailQueueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>
          }
          findFirst: {
            args: Prisma.OutBoundEmailQueueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutBoundEmailQueueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>
          }
          findMany: {
            args: Prisma.OutBoundEmailQueueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>[]
          }
          create: {
            args: Prisma.OutBoundEmailQueueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>
          }
          createMany: {
            args: Prisma.OutBoundEmailQueueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutBoundEmailQueueCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>[]
          }
          delete: {
            args: Prisma.OutBoundEmailQueueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>
          }
          update: {
            args: Prisma.OutBoundEmailQueueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>
          }
          deleteMany: {
            args: Prisma.OutBoundEmailQueueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutBoundEmailQueueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutBoundEmailQueueUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>[]
          }
          upsert: {
            args: Prisma.OutBoundEmailQueueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutBoundEmailQueuePayload>
          }
          aggregate: {
            args: Prisma.OutBoundEmailQueueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutBoundEmailQueue>
          }
          groupBy: {
            args: Prisma.OutBoundEmailQueueGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutBoundEmailQueueGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutBoundEmailQueueCountArgs<ExtArgs>
            result: $Utils.Optional<OutBoundEmailQueueCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      Post: {
        payload: Prisma.$PostPayload<ExtArgs>
        fields: Prisma.PostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findFirst: {
            args: Prisma.PostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findMany: {
            args: Prisma.PostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          create: {
            args: Prisma.PostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          createMany: {
            args: Prisma.PostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PostCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          delete: {
            args: Prisma.PostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          update: {
            args: Prisma.PostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          deleteMany: {
            args: Prisma.PostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PostUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          upsert: {
            args: Prisma.PostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          aggregate: {
            args: Prisma.PostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePost>
          }
          groupBy: {
            args: Prisma.PostGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostCountArgs<ExtArgs>
            result: $Utils.Optional<PostCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    authCode?: AuthCodeOmit
    outBoundEmail?: OutBoundEmailOmit
    outBoundEmailQueue?: OutBoundEmailQueueOmit
    session?: SessionOmit
    post?: PostOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    posts: number
    authCodes: number
    sessions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | UserCountOutputTypeCountPostsArgs
    authCodes?: boolean | UserCountOutputTypeCountAuthCodesArgs
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuthCodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthCodeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }


  /**
   * Count Type OutBoundEmailCountOutputType
   */

  export type OutBoundEmailCountOutputType = {
    outBoundEmailQueues: number
  }

  export type OutBoundEmailCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outBoundEmailQueues?: boolean | OutBoundEmailCountOutputTypeCountOutBoundEmailQueuesArgs
  }

  // Custom InputTypes
  /**
   * OutBoundEmailCountOutputType without action
   */
  export type OutBoundEmailCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailCountOutputType
     */
    select?: OutBoundEmailCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OutBoundEmailCountOutputType without action
   */
  export type OutBoundEmailCountOutputTypeCountOutBoundEmailQueuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutBoundEmailQueueWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    userlevel: number | null
  }

  export type UserSumAggregateOutputType = {
    userlevel: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    emailverified: boolean | null
    datecreated: Date | null
    dateupdated: Date | null
    dateloggedin: Date | null
    userlevel: number | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    emailverified: boolean | null
    datecreated: Date | null
    dateupdated: Date | null
    dateloggedin: Date | null
    userlevel: number | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    emailverified: number
    datecreated: number
    dateupdated: number
    dateloggedin: number
    userlevel: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    userlevel?: true
  }

  export type UserSumAggregateInputType = {
    userlevel?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    emailverified?: true
    datecreated?: true
    dateupdated?: true
    dateloggedin?: true
    userlevel?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    emailverified?: true
    datecreated?: true
    dateupdated?: true
    dateloggedin?: true
    userlevel?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    emailverified?: true
    datecreated?: true
    dateupdated?: true
    dateloggedin?: true
    userlevel?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    password: string
    emailverified: boolean
    datecreated: Date
    dateupdated: Date
    dateloggedin: Date | null
    userlevel: number
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    emailverified?: boolean
    datecreated?: boolean
    dateupdated?: boolean
    dateloggedin?: boolean
    userlevel?: boolean
    posts?: boolean | User$postsArgs<ExtArgs>
    authCodes?: boolean | User$authCodesArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    emailverified?: boolean
    datecreated?: boolean
    dateupdated?: boolean
    dateloggedin?: boolean
    userlevel?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    emailverified?: boolean
    datecreated?: boolean
    dateupdated?: boolean
    dateloggedin?: boolean
    userlevel?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    emailverified?: boolean
    datecreated?: boolean
    dateupdated?: boolean
    dateloggedin?: boolean
    userlevel?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "emailverified" | "datecreated" | "dateupdated" | "dateloggedin" | "userlevel", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | User$postsArgs<ExtArgs>
    authCodes?: boolean | User$authCodesArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      posts: Prisma.$PostPayload<ExtArgs>[]
      authCodes: Prisma.$AuthCodePayload<ExtArgs>[]
      sessions: Prisma.$SessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      password: string
      emailverified: boolean
      datecreated: Date
      dateupdated: Date
      dateloggedin: Date | null
      userlevel: number
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    posts<T extends User$postsArgs<ExtArgs> = {}>(args?: Subset<T, User$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    authCodes<T extends User$authCodesArgs<ExtArgs> = {}>(args?: Subset<T, User$authCodesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly emailverified: FieldRef<"User", 'Boolean'>
    readonly datecreated: FieldRef<"User", 'DateTime'>
    readonly dateupdated: FieldRef<"User", 'DateTime'>
    readonly dateloggedin: FieldRef<"User", 'DateTime'>
    readonly userlevel: FieldRef<"User", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.posts
   */
  export type User$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * User.authCodes
   */
  export type User$authCodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    where?: AuthCodeWhereInput
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    cursor?: AuthCodeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuthCodeScalarFieldEnum | AuthCodeScalarFieldEnum[]
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model AuthCode
   */

  export type AggregateAuthCode = {
    _count: AuthCodeCountAggregateOutputType | null
    _avg: AuthCodeAvgAggregateOutputType | null
    _sum: AuthCodeSumAggregateOutputType | null
    _min: AuthCodeMinAggregateOutputType | null
    _max: AuthCodeMaxAggregateOutputType | null
  }

  export type AuthCodeAvgAggregateOutputType = {
    id: number | null
  }

  export type AuthCodeSumAggregateOutputType = {
    id: number | null
  }

  export type AuthCodeMinAggregateOutputType = {
    id: number | null
    code: string | null
    userId: string | null
    flow: string | null
    dateCreated: Date | null
    expiresAt: Date | null
  }

  export type AuthCodeMaxAggregateOutputType = {
    id: number | null
    code: string | null
    userId: string | null
    flow: string | null
    dateCreated: Date | null
    expiresAt: Date | null
  }

  export type AuthCodeCountAggregateOutputType = {
    id: number
    code: number
    userId: number
    flow: number
    dateCreated: number
    expiresAt: number
    _all: number
  }


  export type AuthCodeAvgAggregateInputType = {
    id?: true
  }

  export type AuthCodeSumAggregateInputType = {
    id?: true
  }

  export type AuthCodeMinAggregateInputType = {
    id?: true
    code?: true
    userId?: true
    flow?: true
    dateCreated?: true
    expiresAt?: true
  }

  export type AuthCodeMaxAggregateInputType = {
    id?: true
    code?: true
    userId?: true
    flow?: true
    dateCreated?: true
    expiresAt?: true
  }

  export type AuthCodeCountAggregateInputType = {
    id?: true
    code?: true
    userId?: true
    flow?: true
    dateCreated?: true
    expiresAt?: true
    _all?: true
  }

  export type AuthCodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthCode to aggregate.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuthCodes
    **/
    _count?: true | AuthCodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuthCodeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuthCodeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthCodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthCodeMaxAggregateInputType
  }

  export type GetAuthCodeAggregateType<T extends AuthCodeAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthCode[P]>
      : GetScalarType<T[P], AggregateAuthCode[P]>
  }




  export type AuthCodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthCodeWhereInput
    orderBy?: AuthCodeOrderByWithAggregationInput | AuthCodeOrderByWithAggregationInput[]
    by: AuthCodeScalarFieldEnum[] | AuthCodeScalarFieldEnum
    having?: AuthCodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthCodeCountAggregateInputType | true
    _avg?: AuthCodeAvgAggregateInputType
    _sum?: AuthCodeSumAggregateInputType
    _min?: AuthCodeMinAggregateInputType
    _max?: AuthCodeMaxAggregateInputType
  }

  export type AuthCodeGroupByOutputType = {
    id: number
    code: string
    userId: string
    flow: string
    dateCreated: Date
    expiresAt: Date
    _count: AuthCodeCountAggregateOutputType | null
    _avg: AuthCodeAvgAggregateOutputType | null
    _sum: AuthCodeSumAggregateOutputType | null
    _min: AuthCodeMinAggregateOutputType | null
    _max: AuthCodeMaxAggregateOutputType | null
  }

  type GetAuthCodeGroupByPayload<T extends AuthCodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthCodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthCodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthCodeGroupByOutputType[P]>
            : GetScalarType<T[P], AuthCodeGroupByOutputType[P]>
        }
      >
    >


  export type AuthCodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    userId?: boolean
    flow?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authCode"]>

  export type AuthCodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    userId?: boolean
    flow?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authCode"]>

  export type AuthCodeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    userId?: boolean
    flow?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authCode"]>

  export type AuthCodeSelectScalar = {
    id?: boolean
    code?: boolean
    userId?: boolean
    flow?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
  }

  export type AuthCodeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "userId" | "flow" | "dateCreated" | "expiresAt", ExtArgs["result"]["authCode"]>
  export type AuthCodeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuthCodeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuthCodeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AuthCodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuthCode"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      code: string
      userId: string
      flow: string
      dateCreated: Date
      expiresAt: Date
    }, ExtArgs["result"]["authCode"]>
    composites: {}
  }

  type AuthCodeGetPayload<S extends boolean | null | undefined | AuthCodeDefaultArgs> = $Result.GetResult<Prisma.$AuthCodePayload, S>

  type AuthCodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuthCodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuthCodeCountAggregateInputType | true
    }

  export interface AuthCodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuthCode'], meta: { name: 'AuthCode' } }
    /**
     * Find zero or one AuthCode that matches the filter.
     * @param {AuthCodeFindUniqueArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthCodeFindUniqueArgs>(args: SelectSubset<T, AuthCodeFindUniqueArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuthCode that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthCodeFindUniqueOrThrowArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthCodeFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeFindFirstArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthCodeFindFirstArgs>(args?: SelectSubset<T, AuthCodeFindFirstArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeFindFirstOrThrowArgs} args - Arguments to find a AuthCode
     * @example
     * // Get one AuthCode
     * const authCode = await prisma.authCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthCodeFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuthCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthCodes
     * const authCodes = await prisma.authCode.findMany()
     * 
     * // Get first 10 AuthCodes
     * const authCodes = await prisma.authCode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authCodeWithIdOnly = await prisma.authCode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthCodeFindManyArgs>(args?: SelectSubset<T, AuthCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuthCode.
     * @param {AuthCodeCreateArgs} args - Arguments to create a AuthCode.
     * @example
     * // Create one AuthCode
     * const AuthCode = await prisma.authCode.create({
     *   data: {
     *     // ... data to create a AuthCode
     *   }
     * })
     * 
     */
    create<T extends AuthCodeCreateArgs>(args: SelectSubset<T, AuthCodeCreateArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuthCodes.
     * @param {AuthCodeCreateManyArgs} args - Arguments to create many AuthCodes.
     * @example
     * // Create many AuthCodes
     * const authCode = await prisma.authCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthCodeCreateManyArgs>(args?: SelectSubset<T, AuthCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuthCodes and returns the data saved in the database.
     * @param {AuthCodeCreateManyAndReturnArgs} args - Arguments to create many AuthCodes.
     * @example
     * // Create many AuthCodes
     * const authCode = await prisma.authCode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuthCodes and only return the `id`
     * const authCodeWithIdOnly = await prisma.authCode.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthCodeCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthCodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuthCode.
     * @param {AuthCodeDeleteArgs} args - Arguments to delete one AuthCode.
     * @example
     * // Delete one AuthCode
     * const AuthCode = await prisma.authCode.delete({
     *   where: {
     *     // ... filter to delete one AuthCode
     *   }
     * })
     * 
     */
    delete<T extends AuthCodeDeleteArgs>(args: SelectSubset<T, AuthCodeDeleteArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuthCode.
     * @param {AuthCodeUpdateArgs} args - Arguments to update one AuthCode.
     * @example
     * // Update one AuthCode
     * const authCode = await prisma.authCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthCodeUpdateArgs>(args: SelectSubset<T, AuthCodeUpdateArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuthCodes.
     * @param {AuthCodeDeleteManyArgs} args - Arguments to filter AuthCodes to delete.
     * @example
     * // Delete a few AuthCodes
     * const { count } = await prisma.authCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthCodeDeleteManyArgs>(args?: SelectSubset<T, AuthCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthCodes
     * const authCode = await prisma.authCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthCodeUpdateManyArgs>(args: SelectSubset<T, AuthCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthCodes and returns the data updated in the database.
     * @param {AuthCodeUpdateManyAndReturnArgs} args - Arguments to update many AuthCodes.
     * @example
     * // Update many AuthCodes
     * const authCode = await prisma.authCode.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuthCodes and only return the `id`
     * const authCodeWithIdOnly = await prisma.authCode.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthCodeUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthCodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuthCode.
     * @param {AuthCodeUpsertArgs} args - Arguments to update or create a AuthCode.
     * @example
     * // Update or create a AuthCode
     * const authCode = await prisma.authCode.upsert({
     *   create: {
     *     // ... data to create a AuthCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthCode we want to update
     *   }
     * })
     */
    upsert<T extends AuthCodeUpsertArgs>(args: SelectSubset<T, AuthCodeUpsertArgs<ExtArgs>>): Prisma__AuthCodeClient<$Result.GetResult<Prisma.$AuthCodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuthCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeCountArgs} args - Arguments to filter AuthCodes to count.
     * @example
     * // Count the number of AuthCodes
     * const count = await prisma.authCode.count({
     *   where: {
     *     // ... the filter for the AuthCodes we want to count
     *   }
     * })
    **/
    count<T extends AuthCodeCountArgs>(
      args?: Subset<T, AuthCodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthCodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthCodeAggregateArgs>(args: Subset<T, AuthCodeAggregateArgs>): Prisma.PrismaPromise<GetAuthCodeAggregateType<T>>

    /**
     * Group by AuthCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthCodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthCodeGroupByArgs['orderBy'] }
        : { orderBy?: AuthCodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuthCode model
   */
  readonly fields: AuthCodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuthCode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthCodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuthCode model
   */
  interface AuthCodeFieldRefs {
    readonly id: FieldRef<"AuthCode", 'Int'>
    readonly code: FieldRef<"AuthCode", 'String'>
    readonly userId: FieldRef<"AuthCode", 'String'>
    readonly flow: FieldRef<"AuthCode", 'String'>
    readonly dateCreated: FieldRef<"AuthCode", 'DateTime'>
    readonly expiresAt: FieldRef<"AuthCode", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuthCode findUnique
   */
  export type AuthCodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode findUniqueOrThrow
   */
  export type AuthCodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode findFirst
   */
  export type AuthCodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthCodes.
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthCodes.
     */
    distinct?: AuthCodeScalarFieldEnum | AuthCodeScalarFieldEnum[]
  }

  /**
   * AuthCode findFirstOrThrow
   */
  export type AuthCodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * Filter, which AuthCode to fetch.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthCodes.
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthCodes.
     */
    distinct?: AuthCodeScalarFieldEnum | AuthCodeScalarFieldEnum[]
  }

  /**
   * AuthCode findMany
   */
  export type AuthCodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * Filter, which AuthCodes to fetch.
     */
    where?: AuthCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthCodes to fetch.
     */
    orderBy?: AuthCodeOrderByWithRelationInput | AuthCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuthCodes.
     */
    cursor?: AuthCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthCodes.
     */
    skip?: number
    distinct?: AuthCodeScalarFieldEnum | AuthCodeScalarFieldEnum[]
  }

  /**
   * AuthCode create
   */
  export type AuthCodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * The data needed to create a AuthCode.
     */
    data: XOR<AuthCodeCreateInput, AuthCodeUncheckedCreateInput>
  }

  /**
   * AuthCode createMany
   */
  export type AuthCodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuthCodes.
     */
    data: AuthCodeCreateManyInput | AuthCodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthCode createManyAndReturn
   */
  export type AuthCodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * The data used to create many AuthCodes.
     */
    data: AuthCodeCreateManyInput | AuthCodeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuthCode update
   */
  export type AuthCodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * The data needed to update a AuthCode.
     */
    data: XOR<AuthCodeUpdateInput, AuthCodeUncheckedUpdateInput>
    /**
     * Choose, which AuthCode to update.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode updateMany
   */
  export type AuthCodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuthCodes.
     */
    data: XOR<AuthCodeUpdateManyMutationInput, AuthCodeUncheckedUpdateManyInput>
    /**
     * Filter which AuthCodes to update
     */
    where?: AuthCodeWhereInput
    /**
     * Limit how many AuthCodes to update.
     */
    limit?: number
  }

  /**
   * AuthCode updateManyAndReturn
   */
  export type AuthCodeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * The data used to update AuthCodes.
     */
    data: XOR<AuthCodeUpdateManyMutationInput, AuthCodeUncheckedUpdateManyInput>
    /**
     * Filter which AuthCodes to update
     */
    where?: AuthCodeWhereInput
    /**
     * Limit how many AuthCodes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuthCode upsert
   */
  export type AuthCodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * The filter to search for the AuthCode to update in case it exists.
     */
    where: AuthCodeWhereUniqueInput
    /**
     * In case the AuthCode found by the `where` argument doesn't exist, create a new AuthCode with this data.
     */
    create: XOR<AuthCodeCreateInput, AuthCodeUncheckedCreateInput>
    /**
     * In case the AuthCode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthCodeUpdateInput, AuthCodeUncheckedUpdateInput>
  }

  /**
   * AuthCode delete
   */
  export type AuthCodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
    /**
     * Filter which AuthCode to delete.
     */
    where: AuthCodeWhereUniqueInput
  }

  /**
   * AuthCode deleteMany
   */
  export type AuthCodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthCodes to delete
     */
    where?: AuthCodeWhereInput
    /**
     * Limit how many AuthCodes to delete.
     */
    limit?: number
  }

  /**
   * AuthCode without action
   */
  export type AuthCodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthCode
     */
    select?: AuthCodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthCode
     */
    omit?: AuthCodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthCodeInclude<ExtArgs> | null
  }


  /**
   * Model OutBoundEmail
   */

  export type AggregateOutBoundEmail = {
    _count: OutBoundEmailCountAggregateOutputType | null
    _avg: OutBoundEmailAvgAggregateOutputType | null
    _sum: OutBoundEmailSumAggregateOutputType | null
    _min: OutBoundEmailMinAggregateOutputType | null
    _max: OutBoundEmailMaxAggregateOutputType | null
  }

  export type OutBoundEmailAvgAggregateOutputType = {
    id: number | null
  }

  export type OutBoundEmailSumAggregateOutputType = {
    id: number | null
  }

  export type OutBoundEmailMinAggregateOutputType = {
    id: number | null
    to: string | null
    subject: string | null
    body: string | null
    dateCreated: Date | null
    sentAt: Date | null
  }

  export type OutBoundEmailMaxAggregateOutputType = {
    id: number | null
    to: string | null
    subject: string | null
    body: string | null
    dateCreated: Date | null
    sentAt: Date | null
  }

  export type OutBoundEmailCountAggregateOutputType = {
    id: number
    to: number
    subject: number
    body: number
    dateCreated: number
    sentAt: number
    _all: number
  }


  export type OutBoundEmailAvgAggregateInputType = {
    id?: true
  }

  export type OutBoundEmailSumAggregateInputType = {
    id?: true
  }

  export type OutBoundEmailMinAggregateInputType = {
    id?: true
    to?: true
    subject?: true
    body?: true
    dateCreated?: true
    sentAt?: true
  }

  export type OutBoundEmailMaxAggregateInputType = {
    id?: true
    to?: true
    subject?: true
    body?: true
    dateCreated?: true
    sentAt?: true
  }

  export type OutBoundEmailCountAggregateInputType = {
    id?: true
    to?: true
    subject?: true
    body?: true
    dateCreated?: true
    sentAt?: true
    _all?: true
  }

  export type OutBoundEmailAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutBoundEmail to aggregate.
     */
    where?: OutBoundEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmails to fetch.
     */
    orderBy?: OutBoundEmailOrderByWithRelationInput | OutBoundEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutBoundEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OutBoundEmails
    **/
    _count?: true | OutBoundEmailCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutBoundEmailAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutBoundEmailSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutBoundEmailMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutBoundEmailMaxAggregateInputType
  }

  export type GetOutBoundEmailAggregateType<T extends OutBoundEmailAggregateArgs> = {
        [P in keyof T & keyof AggregateOutBoundEmail]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutBoundEmail[P]>
      : GetScalarType<T[P], AggregateOutBoundEmail[P]>
  }




  export type OutBoundEmailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutBoundEmailWhereInput
    orderBy?: OutBoundEmailOrderByWithAggregationInput | OutBoundEmailOrderByWithAggregationInput[]
    by: OutBoundEmailScalarFieldEnum[] | OutBoundEmailScalarFieldEnum
    having?: OutBoundEmailScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutBoundEmailCountAggregateInputType | true
    _avg?: OutBoundEmailAvgAggregateInputType
    _sum?: OutBoundEmailSumAggregateInputType
    _min?: OutBoundEmailMinAggregateInputType
    _max?: OutBoundEmailMaxAggregateInputType
  }

  export type OutBoundEmailGroupByOutputType = {
    id: number
    to: string
    subject: string
    body: string
    dateCreated: Date
    sentAt: Date | null
    _count: OutBoundEmailCountAggregateOutputType | null
    _avg: OutBoundEmailAvgAggregateOutputType | null
    _sum: OutBoundEmailSumAggregateOutputType | null
    _min: OutBoundEmailMinAggregateOutputType | null
    _max: OutBoundEmailMaxAggregateOutputType | null
  }

  type GetOutBoundEmailGroupByPayload<T extends OutBoundEmailGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutBoundEmailGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutBoundEmailGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutBoundEmailGroupByOutputType[P]>
            : GetScalarType<T[P], OutBoundEmailGroupByOutputType[P]>
        }
      >
    >


  export type OutBoundEmailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    to?: boolean
    subject?: boolean
    body?: boolean
    dateCreated?: boolean
    sentAt?: boolean
    outBoundEmailQueues?: boolean | OutBoundEmail$outBoundEmailQueuesArgs<ExtArgs>
    _count?: boolean | OutBoundEmailCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outBoundEmail"]>

  export type OutBoundEmailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    to?: boolean
    subject?: boolean
    body?: boolean
    dateCreated?: boolean
    sentAt?: boolean
  }, ExtArgs["result"]["outBoundEmail"]>

  export type OutBoundEmailSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    to?: boolean
    subject?: boolean
    body?: boolean
    dateCreated?: boolean
    sentAt?: boolean
  }, ExtArgs["result"]["outBoundEmail"]>

  export type OutBoundEmailSelectScalar = {
    id?: boolean
    to?: boolean
    subject?: boolean
    body?: boolean
    dateCreated?: boolean
    sentAt?: boolean
  }

  export type OutBoundEmailOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "to" | "subject" | "body" | "dateCreated" | "sentAt", ExtArgs["result"]["outBoundEmail"]>
  export type OutBoundEmailInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outBoundEmailQueues?: boolean | OutBoundEmail$outBoundEmailQueuesArgs<ExtArgs>
    _count?: boolean | OutBoundEmailCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OutBoundEmailIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OutBoundEmailIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OutBoundEmailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OutBoundEmail"
    objects: {
      outBoundEmailQueues: Prisma.$OutBoundEmailQueuePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      to: string
      subject: string
      body: string
      dateCreated: Date
      sentAt: Date | null
    }, ExtArgs["result"]["outBoundEmail"]>
    composites: {}
  }

  type OutBoundEmailGetPayload<S extends boolean | null | undefined | OutBoundEmailDefaultArgs> = $Result.GetResult<Prisma.$OutBoundEmailPayload, S>

  type OutBoundEmailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutBoundEmailFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutBoundEmailCountAggregateInputType | true
    }

  export interface OutBoundEmailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OutBoundEmail'], meta: { name: 'OutBoundEmail' } }
    /**
     * Find zero or one OutBoundEmail that matches the filter.
     * @param {OutBoundEmailFindUniqueArgs} args - Arguments to find a OutBoundEmail
     * @example
     * // Get one OutBoundEmail
     * const outBoundEmail = await prisma.outBoundEmail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutBoundEmailFindUniqueArgs>(args: SelectSubset<T, OutBoundEmailFindUniqueArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OutBoundEmail that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutBoundEmailFindUniqueOrThrowArgs} args - Arguments to find a OutBoundEmail
     * @example
     * // Get one OutBoundEmail
     * const outBoundEmail = await prisma.outBoundEmail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutBoundEmailFindUniqueOrThrowArgs>(args: SelectSubset<T, OutBoundEmailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutBoundEmail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailFindFirstArgs} args - Arguments to find a OutBoundEmail
     * @example
     * // Get one OutBoundEmail
     * const outBoundEmail = await prisma.outBoundEmail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutBoundEmailFindFirstArgs>(args?: SelectSubset<T, OutBoundEmailFindFirstArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutBoundEmail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailFindFirstOrThrowArgs} args - Arguments to find a OutBoundEmail
     * @example
     * // Get one OutBoundEmail
     * const outBoundEmail = await prisma.outBoundEmail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutBoundEmailFindFirstOrThrowArgs>(args?: SelectSubset<T, OutBoundEmailFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OutBoundEmails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OutBoundEmails
     * const outBoundEmails = await prisma.outBoundEmail.findMany()
     * 
     * // Get first 10 OutBoundEmails
     * const outBoundEmails = await prisma.outBoundEmail.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outBoundEmailWithIdOnly = await prisma.outBoundEmail.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutBoundEmailFindManyArgs>(args?: SelectSubset<T, OutBoundEmailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OutBoundEmail.
     * @param {OutBoundEmailCreateArgs} args - Arguments to create a OutBoundEmail.
     * @example
     * // Create one OutBoundEmail
     * const OutBoundEmail = await prisma.outBoundEmail.create({
     *   data: {
     *     // ... data to create a OutBoundEmail
     *   }
     * })
     * 
     */
    create<T extends OutBoundEmailCreateArgs>(args: SelectSubset<T, OutBoundEmailCreateArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OutBoundEmails.
     * @param {OutBoundEmailCreateManyArgs} args - Arguments to create many OutBoundEmails.
     * @example
     * // Create many OutBoundEmails
     * const outBoundEmail = await prisma.outBoundEmail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutBoundEmailCreateManyArgs>(args?: SelectSubset<T, OutBoundEmailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OutBoundEmails and returns the data saved in the database.
     * @param {OutBoundEmailCreateManyAndReturnArgs} args - Arguments to create many OutBoundEmails.
     * @example
     * // Create many OutBoundEmails
     * const outBoundEmail = await prisma.outBoundEmail.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OutBoundEmails and only return the `id`
     * const outBoundEmailWithIdOnly = await prisma.outBoundEmail.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutBoundEmailCreateManyAndReturnArgs>(args?: SelectSubset<T, OutBoundEmailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OutBoundEmail.
     * @param {OutBoundEmailDeleteArgs} args - Arguments to delete one OutBoundEmail.
     * @example
     * // Delete one OutBoundEmail
     * const OutBoundEmail = await prisma.outBoundEmail.delete({
     *   where: {
     *     // ... filter to delete one OutBoundEmail
     *   }
     * })
     * 
     */
    delete<T extends OutBoundEmailDeleteArgs>(args: SelectSubset<T, OutBoundEmailDeleteArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OutBoundEmail.
     * @param {OutBoundEmailUpdateArgs} args - Arguments to update one OutBoundEmail.
     * @example
     * // Update one OutBoundEmail
     * const outBoundEmail = await prisma.outBoundEmail.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutBoundEmailUpdateArgs>(args: SelectSubset<T, OutBoundEmailUpdateArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OutBoundEmails.
     * @param {OutBoundEmailDeleteManyArgs} args - Arguments to filter OutBoundEmails to delete.
     * @example
     * // Delete a few OutBoundEmails
     * const { count } = await prisma.outBoundEmail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutBoundEmailDeleteManyArgs>(args?: SelectSubset<T, OutBoundEmailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutBoundEmails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OutBoundEmails
     * const outBoundEmail = await prisma.outBoundEmail.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutBoundEmailUpdateManyArgs>(args: SelectSubset<T, OutBoundEmailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutBoundEmails and returns the data updated in the database.
     * @param {OutBoundEmailUpdateManyAndReturnArgs} args - Arguments to update many OutBoundEmails.
     * @example
     * // Update many OutBoundEmails
     * const outBoundEmail = await prisma.outBoundEmail.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OutBoundEmails and only return the `id`
     * const outBoundEmailWithIdOnly = await prisma.outBoundEmail.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutBoundEmailUpdateManyAndReturnArgs>(args: SelectSubset<T, OutBoundEmailUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OutBoundEmail.
     * @param {OutBoundEmailUpsertArgs} args - Arguments to update or create a OutBoundEmail.
     * @example
     * // Update or create a OutBoundEmail
     * const outBoundEmail = await prisma.outBoundEmail.upsert({
     *   create: {
     *     // ... data to create a OutBoundEmail
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OutBoundEmail we want to update
     *   }
     * })
     */
    upsert<T extends OutBoundEmailUpsertArgs>(args: SelectSubset<T, OutBoundEmailUpsertArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OutBoundEmails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailCountArgs} args - Arguments to filter OutBoundEmails to count.
     * @example
     * // Count the number of OutBoundEmails
     * const count = await prisma.outBoundEmail.count({
     *   where: {
     *     // ... the filter for the OutBoundEmails we want to count
     *   }
     * })
    **/
    count<T extends OutBoundEmailCountArgs>(
      args?: Subset<T, OutBoundEmailCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutBoundEmailCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OutBoundEmail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutBoundEmailAggregateArgs>(args: Subset<T, OutBoundEmailAggregateArgs>): Prisma.PrismaPromise<GetOutBoundEmailAggregateType<T>>

    /**
     * Group by OutBoundEmail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutBoundEmailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutBoundEmailGroupByArgs['orderBy'] }
        : { orderBy?: OutBoundEmailGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutBoundEmailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutBoundEmailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OutBoundEmail model
   */
  readonly fields: OutBoundEmailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OutBoundEmail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutBoundEmailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    outBoundEmailQueues<T extends OutBoundEmail$outBoundEmailQueuesArgs<ExtArgs> = {}>(args?: Subset<T, OutBoundEmail$outBoundEmailQueuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OutBoundEmail model
   */
  interface OutBoundEmailFieldRefs {
    readonly id: FieldRef<"OutBoundEmail", 'Int'>
    readonly to: FieldRef<"OutBoundEmail", 'String'>
    readonly subject: FieldRef<"OutBoundEmail", 'String'>
    readonly body: FieldRef<"OutBoundEmail", 'String'>
    readonly dateCreated: FieldRef<"OutBoundEmail", 'DateTime'>
    readonly sentAt: FieldRef<"OutBoundEmail", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OutBoundEmail findUnique
   */
  export type OutBoundEmailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmail to fetch.
     */
    where: OutBoundEmailWhereUniqueInput
  }

  /**
   * OutBoundEmail findUniqueOrThrow
   */
  export type OutBoundEmailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmail to fetch.
     */
    where: OutBoundEmailWhereUniqueInput
  }

  /**
   * OutBoundEmail findFirst
   */
  export type OutBoundEmailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmail to fetch.
     */
    where?: OutBoundEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmails to fetch.
     */
    orderBy?: OutBoundEmailOrderByWithRelationInput | OutBoundEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutBoundEmails.
     */
    cursor?: OutBoundEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutBoundEmails.
     */
    distinct?: OutBoundEmailScalarFieldEnum | OutBoundEmailScalarFieldEnum[]
  }

  /**
   * OutBoundEmail findFirstOrThrow
   */
  export type OutBoundEmailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmail to fetch.
     */
    where?: OutBoundEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmails to fetch.
     */
    orderBy?: OutBoundEmailOrderByWithRelationInput | OutBoundEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutBoundEmails.
     */
    cursor?: OutBoundEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutBoundEmails.
     */
    distinct?: OutBoundEmailScalarFieldEnum | OutBoundEmailScalarFieldEnum[]
  }

  /**
   * OutBoundEmail findMany
   */
  export type OutBoundEmailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmails to fetch.
     */
    where?: OutBoundEmailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmails to fetch.
     */
    orderBy?: OutBoundEmailOrderByWithRelationInput | OutBoundEmailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OutBoundEmails.
     */
    cursor?: OutBoundEmailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmails.
     */
    skip?: number
    distinct?: OutBoundEmailScalarFieldEnum | OutBoundEmailScalarFieldEnum[]
  }

  /**
   * OutBoundEmail create
   */
  export type OutBoundEmailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * The data needed to create a OutBoundEmail.
     */
    data: XOR<OutBoundEmailCreateInput, OutBoundEmailUncheckedCreateInput>
  }

  /**
   * OutBoundEmail createMany
   */
  export type OutBoundEmailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OutBoundEmails.
     */
    data: OutBoundEmailCreateManyInput | OutBoundEmailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutBoundEmail createManyAndReturn
   */
  export type OutBoundEmailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * The data used to create many OutBoundEmails.
     */
    data: OutBoundEmailCreateManyInput | OutBoundEmailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutBoundEmail update
   */
  export type OutBoundEmailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * The data needed to update a OutBoundEmail.
     */
    data: XOR<OutBoundEmailUpdateInput, OutBoundEmailUncheckedUpdateInput>
    /**
     * Choose, which OutBoundEmail to update.
     */
    where: OutBoundEmailWhereUniqueInput
  }

  /**
   * OutBoundEmail updateMany
   */
  export type OutBoundEmailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OutBoundEmails.
     */
    data: XOR<OutBoundEmailUpdateManyMutationInput, OutBoundEmailUncheckedUpdateManyInput>
    /**
     * Filter which OutBoundEmails to update
     */
    where?: OutBoundEmailWhereInput
    /**
     * Limit how many OutBoundEmails to update.
     */
    limit?: number
  }

  /**
   * OutBoundEmail updateManyAndReturn
   */
  export type OutBoundEmailUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * The data used to update OutBoundEmails.
     */
    data: XOR<OutBoundEmailUpdateManyMutationInput, OutBoundEmailUncheckedUpdateManyInput>
    /**
     * Filter which OutBoundEmails to update
     */
    where?: OutBoundEmailWhereInput
    /**
     * Limit how many OutBoundEmails to update.
     */
    limit?: number
  }

  /**
   * OutBoundEmail upsert
   */
  export type OutBoundEmailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * The filter to search for the OutBoundEmail to update in case it exists.
     */
    where: OutBoundEmailWhereUniqueInput
    /**
     * In case the OutBoundEmail found by the `where` argument doesn't exist, create a new OutBoundEmail with this data.
     */
    create: XOR<OutBoundEmailCreateInput, OutBoundEmailUncheckedCreateInput>
    /**
     * In case the OutBoundEmail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutBoundEmailUpdateInput, OutBoundEmailUncheckedUpdateInput>
  }

  /**
   * OutBoundEmail delete
   */
  export type OutBoundEmailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
    /**
     * Filter which OutBoundEmail to delete.
     */
    where: OutBoundEmailWhereUniqueInput
  }

  /**
   * OutBoundEmail deleteMany
   */
  export type OutBoundEmailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutBoundEmails to delete
     */
    where?: OutBoundEmailWhereInput
    /**
     * Limit how many OutBoundEmails to delete.
     */
    limit?: number
  }

  /**
   * OutBoundEmail.outBoundEmailQueues
   */
  export type OutBoundEmail$outBoundEmailQueuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    where?: OutBoundEmailQueueWhereInput
    orderBy?: OutBoundEmailQueueOrderByWithRelationInput | OutBoundEmailQueueOrderByWithRelationInput[]
    cursor?: OutBoundEmailQueueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutBoundEmailQueueScalarFieldEnum | OutBoundEmailQueueScalarFieldEnum[]
  }

  /**
   * OutBoundEmail without action
   */
  export type OutBoundEmailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmail
     */
    select?: OutBoundEmailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmail
     */
    omit?: OutBoundEmailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailInclude<ExtArgs> | null
  }


  /**
   * Model OutBoundEmailQueue
   */

  export type AggregateOutBoundEmailQueue = {
    _count: OutBoundEmailQueueCountAggregateOutputType | null
    _avg: OutBoundEmailQueueAvgAggregateOutputType | null
    _sum: OutBoundEmailQueueSumAggregateOutputType | null
    _min: OutBoundEmailQueueMinAggregateOutputType | null
    _max: OutBoundEmailQueueMaxAggregateOutputType | null
  }

  export type OutBoundEmailQueueAvgAggregateOutputType = {
    id: number | null
    emailId: number | null
  }

  export type OutBoundEmailQueueSumAggregateOutputType = {
    id: number | null
    emailId: number | null
  }

  export type OutBoundEmailQueueMinAggregateOutputType = {
    id: number | null
    emailId: number | null
    dateQueued: Date | null
    sentAt: Date | null
  }

  export type OutBoundEmailQueueMaxAggregateOutputType = {
    id: number | null
    emailId: number | null
    dateQueued: Date | null
    sentAt: Date | null
  }

  export type OutBoundEmailQueueCountAggregateOutputType = {
    id: number
    emailId: number
    dateQueued: number
    sentAt: number
    _all: number
  }


  export type OutBoundEmailQueueAvgAggregateInputType = {
    id?: true
    emailId?: true
  }

  export type OutBoundEmailQueueSumAggregateInputType = {
    id?: true
    emailId?: true
  }

  export type OutBoundEmailQueueMinAggregateInputType = {
    id?: true
    emailId?: true
    dateQueued?: true
    sentAt?: true
  }

  export type OutBoundEmailQueueMaxAggregateInputType = {
    id?: true
    emailId?: true
    dateQueued?: true
    sentAt?: true
  }

  export type OutBoundEmailQueueCountAggregateInputType = {
    id?: true
    emailId?: true
    dateQueued?: true
    sentAt?: true
    _all?: true
  }

  export type OutBoundEmailQueueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutBoundEmailQueue to aggregate.
     */
    where?: OutBoundEmailQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmailQueues to fetch.
     */
    orderBy?: OutBoundEmailQueueOrderByWithRelationInput | OutBoundEmailQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutBoundEmailQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmailQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmailQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OutBoundEmailQueues
    **/
    _count?: true | OutBoundEmailQueueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutBoundEmailQueueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutBoundEmailQueueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutBoundEmailQueueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutBoundEmailQueueMaxAggregateInputType
  }

  export type GetOutBoundEmailQueueAggregateType<T extends OutBoundEmailQueueAggregateArgs> = {
        [P in keyof T & keyof AggregateOutBoundEmailQueue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutBoundEmailQueue[P]>
      : GetScalarType<T[P], AggregateOutBoundEmailQueue[P]>
  }




  export type OutBoundEmailQueueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutBoundEmailQueueWhereInput
    orderBy?: OutBoundEmailQueueOrderByWithAggregationInput | OutBoundEmailQueueOrderByWithAggregationInput[]
    by: OutBoundEmailQueueScalarFieldEnum[] | OutBoundEmailQueueScalarFieldEnum
    having?: OutBoundEmailQueueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutBoundEmailQueueCountAggregateInputType | true
    _avg?: OutBoundEmailQueueAvgAggregateInputType
    _sum?: OutBoundEmailQueueSumAggregateInputType
    _min?: OutBoundEmailQueueMinAggregateInputType
    _max?: OutBoundEmailQueueMaxAggregateInputType
  }

  export type OutBoundEmailQueueGroupByOutputType = {
    id: number
    emailId: number
    dateQueued: Date
    sentAt: Date | null
    _count: OutBoundEmailQueueCountAggregateOutputType | null
    _avg: OutBoundEmailQueueAvgAggregateOutputType | null
    _sum: OutBoundEmailQueueSumAggregateOutputType | null
    _min: OutBoundEmailQueueMinAggregateOutputType | null
    _max: OutBoundEmailQueueMaxAggregateOutputType | null
  }

  type GetOutBoundEmailQueueGroupByPayload<T extends OutBoundEmailQueueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutBoundEmailQueueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutBoundEmailQueueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutBoundEmailQueueGroupByOutputType[P]>
            : GetScalarType<T[P], OutBoundEmailQueueGroupByOutputType[P]>
        }
      >
    >


  export type OutBoundEmailQueueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    emailId?: boolean
    dateQueued?: boolean
    sentAt?: boolean
    email?: boolean | OutBoundEmailDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outBoundEmailQueue"]>

  export type OutBoundEmailQueueSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    emailId?: boolean
    dateQueued?: boolean
    sentAt?: boolean
    email?: boolean | OutBoundEmailDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outBoundEmailQueue"]>

  export type OutBoundEmailQueueSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    emailId?: boolean
    dateQueued?: boolean
    sentAt?: boolean
    email?: boolean | OutBoundEmailDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outBoundEmailQueue"]>

  export type OutBoundEmailQueueSelectScalar = {
    id?: boolean
    emailId?: boolean
    dateQueued?: boolean
    sentAt?: boolean
  }

  export type OutBoundEmailQueueOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "emailId" | "dateQueued" | "sentAt", ExtArgs["result"]["outBoundEmailQueue"]>
  export type OutBoundEmailQueueInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    email?: boolean | OutBoundEmailDefaultArgs<ExtArgs>
  }
  export type OutBoundEmailQueueIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    email?: boolean | OutBoundEmailDefaultArgs<ExtArgs>
  }
  export type OutBoundEmailQueueIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    email?: boolean | OutBoundEmailDefaultArgs<ExtArgs>
  }

  export type $OutBoundEmailQueuePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OutBoundEmailQueue"
    objects: {
      email: Prisma.$OutBoundEmailPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      emailId: number
      dateQueued: Date
      sentAt: Date | null
    }, ExtArgs["result"]["outBoundEmailQueue"]>
    composites: {}
  }

  type OutBoundEmailQueueGetPayload<S extends boolean | null | undefined | OutBoundEmailQueueDefaultArgs> = $Result.GetResult<Prisma.$OutBoundEmailQueuePayload, S>

  type OutBoundEmailQueueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutBoundEmailQueueFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutBoundEmailQueueCountAggregateInputType | true
    }

  export interface OutBoundEmailQueueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OutBoundEmailQueue'], meta: { name: 'OutBoundEmailQueue' } }
    /**
     * Find zero or one OutBoundEmailQueue that matches the filter.
     * @param {OutBoundEmailQueueFindUniqueArgs} args - Arguments to find a OutBoundEmailQueue
     * @example
     * // Get one OutBoundEmailQueue
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutBoundEmailQueueFindUniqueArgs>(args: SelectSubset<T, OutBoundEmailQueueFindUniqueArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OutBoundEmailQueue that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutBoundEmailQueueFindUniqueOrThrowArgs} args - Arguments to find a OutBoundEmailQueue
     * @example
     * // Get one OutBoundEmailQueue
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutBoundEmailQueueFindUniqueOrThrowArgs>(args: SelectSubset<T, OutBoundEmailQueueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutBoundEmailQueue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailQueueFindFirstArgs} args - Arguments to find a OutBoundEmailQueue
     * @example
     * // Get one OutBoundEmailQueue
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutBoundEmailQueueFindFirstArgs>(args?: SelectSubset<T, OutBoundEmailQueueFindFirstArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutBoundEmailQueue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailQueueFindFirstOrThrowArgs} args - Arguments to find a OutBoundEmailQueue
     * @example
     * // Get one OutBoundEmailQueue
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutBoundEmailQueueFindFirstOrThrowArgs>(args?: SelectSubset<T, OutBoundEmailQueueFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OutBoundEmailQueues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailQueueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OutBoundEmailQueues
     * const outBoundEmailQueues = await prisma.outBoundEmailQueue.findMany()
     * 
     * // Get first 10 OutBoundEmailQueues
     * const outBoundEmailQueues = await prisma.outBoundEmailQueue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outBoundEmailQueueWithIdOnly = await prisma.outBoundEmailQueue.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutBoundEmailQueueFindManyArgs>(args?: SelectSubset<T, OutBoundEmailQueueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OutBoundEmailQueue.
     * @param {OutBoundEmailQueueCreateArgs} args - Arguments to create a OutBoundEmailQueue.
     * @example
     * // Create one OutBoundEmailQueue
     * const OutBoundEmailQueue = await prisma.outBoundEmailQueue.create({
     *   data: {
     *     // ... data to create a OutBoundEmailQueue
     *   }
     * })
     * 
     */
    create<T extends OutBoundEmailQueueCreateArgs>(args: SelectSubset<T, OutBoundEmailQueueCreateArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OutBoundEmailQueues.
     * @param {OutBoundEmailQueueCreateManyArgs} args - Arguments to create many OutBoundEmailQueues.
     * @example
     * // Create many OutBoundEmailQueues
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutBoundEmailQueueCreateManyArgs>(args?: SelectSubset<T, OutBoundEmailQueueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OutBoundEmailQueues and returns the data saved in the database.
     * @param {OutBoundEmailQueueCreateManyAndReturnArgs} args - Arguments to create many OutBoundEmailQueues.
     * @example
     * // Create many OutBoundEmailQueues
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OutBoundEmailQueues and only return the `id`
     * const outBoundEmailQueueWithIdOnly = await prisma.outBoundEmailQueue.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutBoundEmailQueueCreateManyAndReturnArgs>(args?: SelectSubset<T, OutBoundEmailQueueCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OutBoundEmailQueue.
     * @param {OutBoundEmailQueueDeleteArgs} args - Arguments to delete one OutBoundEmailQueue.
     * @example
     * // Delete one OutBoundEmailQueue
     * const OutBoundEmailQueue = await prisma.outBoundEmailQueue.delete({
     *   where: {
     *     // ... filter to delete one OutBoundEmailQueue
     *   }
     * })
     * 
     */
    delete<T extends OutBoundEmailQueueDeleteArgs>(args: SelectSubset<T, OutBoundEmailQueueDeleteArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OutBoundEmailQueue.
     * @param {OutBoundEmailQueueUpdateArgs} args - Arguments to update one OutBoundEmailQueue.
     * @example
     * // Update one OutBoundEmailQueue
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutBoundEmailQueueUpdateArgs>(args: SelectSubset<T, OutBoundEmailQueueUpdateArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OutBoundEmailQueues.
     * @param {OutBoundEmailQueueDeleteManyArgs} args - Arguments to filter OutBoundEmailQueues to delete.
     * @example
     * // Delete a few OutBoundEmailQueues
     * const { count } = await prisma.outBoundEmailQueue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutBoundEmailQueueDeleteManyArgs>(args?: SelectSubset<T, OutBoundEmailQueueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutBoundEmailQueues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailQueueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OutBoundEmailQueues
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutBoundEmailQueueUpdateManyArgs>(args: SelectSubset<T, OutBoundEmailQueueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutBoundEmailQueues and returns the data updated in the database.
     * @param {OutBoundEmailQueueUpdateManyAndReturnArgs} args - Arguments to update many OutBoundEmailQueues.
     * @example
     * // Update many OutBoundEmailQueues
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OutBoundEmailQueues and only return the `id`
     * const outBoundEmailQueueWithIdOnly = await prisma.outBoundEmailQueue.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutBoundEmailQueueUpdateManyAndReturnArgs>(args: SelectSubset<T, OutBoundEmailQueueUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OutBoundEmailQueue.
     * @param {OutBoundEmailQueueUpsertArgs} args - Arguments to update or create a OutBoundEmailQueue.
     * @example
     * // Update or create a OutBoundEmailQueue
     * const outBoundEmailQueue = await prisma.outBoundEmailQueue.upsert({
     *   create: {
     *     // ... data to create a OutBoundEmailQueue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OutBoundEmailQueue we want to update
     *   }
     * })
     */
    upsert<T extends OutBoundEmailQueueUpsertArgs>(args: SelectSubset<T, OutBoundEmailQueueUpsertArgs<ExtArgs>>): Prisma__OutBoundEmailQueueClient<$Result.GetResult<Prisma.$OutBoundEmailQueuePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OutBoundEmailQueues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailQueueCountArgs} args - Arguments to filter OutBoundEmailQueues to count.
     * @example
     * // Count the number of OutBoundEmailQueues
     * const count = await prisma.outBoundEmailQueue.count({
     *   where: {
     *     // ... the filter for the OutBoundEmailQueues we want to count
     *   }
     * })
    **/
    count<T extends OutBoundEmailQueueCountArgs>(
      args?: Subset<T, OutBoundEmailQueueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutBoundEmailQueueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OutBoundEmailQueue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailQueueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutBoundEmailQueueAggregateArgs>(args: Subset<T, OutBoundEmailQueueAggregateArgs>): Prisma.PrismaPromise<GetOutBoundEmailQueueAggregateType<T>>

    /**
     * Group by OutBoundEmailQueue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutBoundEmailQueueGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutBoundEmailQueueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutBoundEmailQueueGroupByArgs['orderBy'] }
        : { orderBy?: OutBoundEmailQueueGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutBoundEmailQueueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutBoundEmailQueueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OutBoundEmailQueue model
   */
  readonly fields: OutBoundEmailQueueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OutBoundEmailQueue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutBoundEmailQueueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    email<T extends OutBoundEmailDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OutBoundEmailDefaultArgs<ExtArgs>>): Prisma__OutBoundEmailClient<$Result.GetResult<Prisma.$OutBoundEmailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OutBoundEmailQueue model
   */
  interface OutBoundEmailQueueFieldRefs {
    readonly id: FieldRef<"OutBoundEmailQueue", 'Int'>
    readonly emailId: FieldRef<"OutBoundEmailQueue", 'Int'>
    readonly dateQueued: FieldRef<"OutBoundEmailQueue", 'DateTime'>
    readonly sentAt: FieldRef<"OutBoundEmailQueue", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OutBoundEmailQueue findUnique
   */
  export type OutBoundEmailQueueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmailQueue to fetch.
     */
    where: OutBoundEmailQueueWhereUniqueInput
  }

  /**
   * OutBoundEmailQueue findUniqueOrThrow
   */
  export type OutBoundEmailQueueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmailQueue to fetch.
     */
    where: OutBoundEmailQueueWhereUniqueInput
  }

  /**
   * OutBoundEmailQueue findFirst
   */
  export type OutBoundEmailQueueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmailQueue to fetch.
     */
    where?: OutBoundEmailQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmailQueues to fetch.
     */
    orderBy?: OutBoundEmailQueueOrderByWithRelationInput | OutBoundEmailQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutBoundEmailQueues.
     */
    cursor?: OutBoundEmailQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmailQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmailQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutBoundEmailQueues.
     */
    distinct?: OutBoundEmailQueueScalarFieldEnum | OutBoundEmailQueueScalarFieldEnum[]
  }

  /**
   * OutBoundEmailQueue findFirstOrThrow
   */
  export type OutBoundEmailQueueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmailQueue to fetch.
     */
    where?: OutBoundEmailQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmailQueues to fetch.
     */
    orderBy?: OutBoundEmailQueueOrderByWithRelationInput | OutBoundEmailQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutBoundEmailQueues.
     */
    cursor?: OutBoundEmailQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmailQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmailQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutBoundEmailQueues.
     */
    distinct?: OutBoundEmailQueueScalarFieldEnum | OutBoundEmailQueueScalarFieldEnum[]
  }

  /**
   * OutBoundEmailQueue findMany
   */
  export type OutBoundEmailQueueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * Filter, which OutBoundEmailQueues to fetch.
     */
    where?: OutBoundEmailQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutBoundEmailQueues to fetch.
     */
    orderBy?: OutBoundEmailQueueOrderByWithRelationInput | OutBoundEmailQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OutBoundEmailQueues.
     */
    cursor?: OutBoundEmailQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutBoundEmailQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutBoundEmailQueues.
     */
    skip?: number
    distinct?: OutBoundEmailQueueScalarFieldEnum | OutBoundEmailQueueScalarFieldEnum[]
  }

  /**
   * OutBoundEmailQueue create
   */
  export type OutBoundEmailQueueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * The data needed to create a OutBoundEmailQueue.
     */
    data: XOR<OutBoundEmailQueueCreateInput, OutBoundEmailQueueUncheckedCreateInput>
  }

  /**
   * OutBoundEmailQueue createMany
   */
  export type OutBoundEmailQueueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OutBoundEmailQueues.
     */
    data: OutBoundEmailQueueCreateManyInput | OutBoundEmailQueueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutBoundEmailQueue createManyAndReturn
   */
  export type OutBoundEmailQueueCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * The data used to create many OutBoundEmailQueues.
     */
    data: OutBoundEmailQueueCreateManyInput | OutBoundEmailQueueCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutBoundEmailQueue update
   */
  export type OutBoundEmailQueueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * The data needed to update a OutBoundEmailQueue.
     */
    data: XOR<OutBoundEmailQueueUpdateInput, OutBoundEmailQueueUncheckedUpdateInput>
    /**
     * Choose, which OutBoundEmailQueue to update.
     */
    where: OutBoundEmailQueueWhereUniqueInput
  }

  /**
   * OutBoundEmailQueue updateMany
   */
  export type OutBoundEmailQueueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OutBoundEmailQueues.
     */
    data: XOR<OutBoundEmailQueueUpdateManyMutationInput, OutBoundEmailQueueUncheckedUpdateManyInput>
    /**
     * Filter which OutBoundEmailQueues to update
     */
    where?: OutBoundEmailQueueWhereInput
    /**
     * Limit how many OutBoundEmailQueues to update.
     */
    limit?: number
  }

  /**
   * OutBoundEmailQueue updateManyAndReturn
   */
  export type OutBoundEmailQueueUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * The data used to update OutBoundEmailQueues.
     */
    data: XOR<OutBoundEmailQueueUpdateManyMutationInput, OutBoundEmailQueueUncheckedUpdateManyInput>
    /**
     * Filter which OutBoundEmailQueues to update
     */
    where?: OutBoundEmailQueueWhereInput
    /**
     * Limit how many OutBoundEmailQueues to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutBoundEmailQueue upsert
   */
  export type OutBoundEmailQueueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * The filter to search for the OutBoundEmailQueue to update in case it exists.
     */
    where: OutBoundEmailQueueWhereUniqueInput
    /**
     * In case the OutBoundEmailQueue found by the `where` argument doesn't exist, create a new OutBoundEmailQueue with this data.
     */
    create: XOR<OutBoundEmailQueueCreateInput, OutBoundEmailQueueUncheckedCreateInput>
    /**
     * In case the OutBoundEmailQueue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutBoundEmailQueueUpdateInput, OutBoundEmailQueueUncheckedUpdateInput>
  }

  /**
   * OutBoundEmailQueue delete
   */
  export type OutBoundEmailQueueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
    /**
     * Filter which OutBoundEmailQueue to delete.
     */
    where: OutBoundEmailQueueWhereUniqueInput
  }

  /**
   * OutBoundEmailQueue deleteMany
   */
  export type OutBoundEmailQueueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutBoundEmailQueues to delete
     */
    where?: OutBoundEmailQueueWhereInput
    /**
     * Limit how many OutBoundEmailQueues to delete.
     */
    limit?: number
  }

  /**
   * OutBoundEmailQueue without action
   */
  export type OutBoundEmailQueueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutBoundEmailQueue
     */
    select?: OutBoundEmailQueueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutBoundEmailQueue
     */
    omit?: OutBoundEmailQueueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutBoundEmailQueueInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _avg: SessionAvgAggregateOutputType | null
    _sum: SessionSumAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionAvgAggregateOutputType = {
    id: number | null
  }

  export type SessionSumAggregateOutputType = {
    id: number | null
  }

  export type SessionMinAggregateOutputType = {
    id: number | null
    token: string | null
    userId: string | null
    dateCreated: Date | null
    expiresAt: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    id: number | null
    token: string | null
    userId: string | null
    dateCreated: Date | null
    expiresAt: Date | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    token: number
    userId: number
    dateCreated: number
    expiresAt: number
    _all: number
  }


  export type SessionAvgAggregateInputType = {
    id?: true
  }

  export type SessionSumAggregateInputType = {
    id?: true
  }

  export type SessionMinAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    dateCreated?: true
    expiresAt?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    dateCreated?: true
    expiresAt?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    dateCreated?: true
    expiresAt?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _avg?: SessionAvgAggregateInputType
    _sum?: SessionSumAggregateInputType
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: number
    token: string
    userId: string
    dateCreated: Date
    expiresAt: Date
    _count: SessionCountAggregateOutputType | null
    _avg: SessionAvgAggregateOutputType | null
    _sum: SessionSumAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    token?: boolean
    userId?: boolean
    dateCreated?: boolean
    expiresAt?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "token" | "userId" | "dateCreated" | "expiresAt", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      token: string
      userId: string
      dateCreated: Date
      expiresAt: Date
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'Int'>
    readonly token: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly dateCreated: FieldRef<"Session", 'DateTime'>
    readonly expiresAt: FieldRef<"Session", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model Post
   */

  export type AggregatePost = {
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  export type PostAvgAggregateOutputType = {
    id: number | null
  }

  export type PostSumAggregateOutputType = {
    id: number | null
  }

  export type PostMinAggregateOutputType = {
    id: number | null
    title: string | null
    content: string | null
    published: boolean | null
    authorId: string | null
  }

  export type PostMaxAggregateOutputType = {
    id: number | null
    title: string | null
    content: string | null
    published: boolean | null
    authorId: string | null
  }

  export type PostCountAggregateOutputType = {
    id: number
    title: number
    content: number
    published: number
    authorId: number
    _all: number
  }


  export type PostAvgAggregateInputType = {
    id?: true
  }

  export type PostSumAggregateInputType = {
    id?: true
  }

  export type PostMinAggregateInputType = {
    id?: true
    title?: true
    content?: true
    published?: true
    authorId?: true
  }

  export type PostMaxAggregateInputType = {
    id?: true
    title?: true
    content?: true
    published?: true
    authorId?: true
  }

  export type PostCountAggregateInputType = {
    id?: true
    title?: true
    content?: true
    published?: true
    authorId?: true
    _all?: true
  }

  export type PostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Post to aggregate.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Posts
    **/
    _count?: true | PostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PostAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PostSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostMaxAggregateInputType
  }

  export type GetPostAggregateType<T extends PostAggregateArgs> = {
        [P in keyof T & keyof AggregatePost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePost[P]>
      : GetScalarType<T[P], AggregatePost[P]>
  }




  export type PostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
    orderBy?: PostOrderByWithAggregationInput | PostOrderByWithAggregationInput[]
    by: PostScalarFieldEnum[] | PostScalarFieldEnum
    having?: PostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostCountAggregateInputType | true
    _avg?: PostAvgAggregateInputType
    _sum?: PostSumAggregateInputType
    _min?: PostMinAggregateInputType
    _max?: PostMaxAggregateInputType
  }

  export type PostGroupByOutputType = {
    id: number
    title: string
    content: string | null
    published: boolean
    authorId: string
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  type GetPostGroupByPayload<T extends PostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostGroupByOutputType[P]>
            : GetScalarType<T[P], PostGroupByOutputType[P]>
        }
      >
    >


  export type PostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    published?: boolean
    authorId?: boolean
    author?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    published?: boolean
    authorId?: boolean
    author?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    published?: boolean
    authorId?: boolean
    author?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectScalar = {
    id?: boolean
    title?: boolean
    content?: boolean
    published?: boolean
    authorId?: boolean
  }

  export type PostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "content" | "published" | "authorId", ExtArgs["result"]["post"]>
  export type PostInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PostIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PostIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Post"
    objects: {
      author: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      title: string
      content: string | null
      published: boolean
      authorId: string
    }, ExtArgs["result"]["post"]>
    composites: {}
  }

  type PostGetPayload<S extends boolean | null | undefined | PostDefaultArgs> = $Result.GetResult<Prisma.$PostPayload, S>

  type PostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostCountAggregateInputType | true
    }

  export interface PostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Post'], meta: { name: 'Post' } }
    /**
     * Find zero or one Post that matches the filter.
     * @param {PostFindUniqueArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostFindUniqueArgs>(args: SelectSubset<T, PostFindUniqueArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Post that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostFindUniqueOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostFindUniqueOrThrowArgs>(args: SelectSubset<T, PostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostFindFirstArgs>(args?: SelectSubset<T, PostFindFirstArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostFindFirstOrThrowArgs>(args?: SelectSubset<T, PostFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Posts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Posts
     * const posts = await prisma.post.findMany()
     * 
     * // Get first 10 Posts
     * const posts = await prisma.post.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postWithIdOnly = await prisma.post.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostFindManyArgs>(args?: SelectSubset<T, PostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Post.
     * @param {PostCreateArgs} args - Arguments to create a Post.
     * @example
     * // Create one Post
     * const Post = await prisma.post.create({
     *   data: {
     *     // ... data to create a Post
     *   }
     * })
     * 
     */
    create<T extends PostCreateArgs>(args: SelectSubset<T, PostCreateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Posts.
     * @param {PostCreateManyArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostCreateManyArgs>(args?: SelectSubset<T, PostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Posts and returns the data saved in the database.
     * @param {PostCreateManyAndReturnArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PostCreateManyAndReturnArgs>(args?: SelectSubset<T, PostCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Post.
     * @param {PostDeleteArgs} args - Arguments to delete one Post.
     * @example
     * // Delete one Post
     * const Post = await prisma.post.delete({
     *   where: {
     *     // ... filter to delete one Post
     *   }
     * })
     * 
     */
    delete<T extends PostDeleteArgs>(args: SelectSubset<T, PostDeleteArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Post.
     * @param {PostUpdateArgs} args - Arguments to update one Post.
     * @example
     * // Update one Post
     * const post = await prisma.post.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostUpdateArgs>(args: SelectSubset<T, PostUpdateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Posts.
     * @param {PostDeleteManyArgs} args - Arguments to filter Posts to delete.
     * @example
     * // Delete a few Posts
     * const { count } = await prisma.post.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostDeleteManyArgs>(args?: SelectSubset<T, PostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostUpdateManyArgs>(args: SelectSubset<T, PostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts and returns the data updated in the database.
     * @param {PostUpdateManyAndReturnArgs} args - Arguments to update many Posts.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PostUpdateManyAndReturnArgs>(args: SelectSubset<T, PostUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Post.
     * @param {PostUpsertArgs} args - Arguments to update or create a Post.
     * @example
     * // Update or create a Post
     * const post = await prisma.post.upsert({
     *   create: {
     *     // ... data to create a Post
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Post we want to update
     *   }
     * })
     */
    upsert<T extends PostUpsertArgs>(args: SelectSubset<T, PostUpsertArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostCountArgs} args - Arguments to filter Posts to count.
     * @example
     * // Count the number of Posts
     * const count = await prisma.post.count({
     *   where: {
     *     // ... the filter for the Posts we want to count
     *   }
     * })
    **/
    count<T extends PostCountArgs>(
      args?: Subset<T, PostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PostAggregateArgs>(args: Subset<T, PostAggregateArgs>): Prisma.PrismaPromise<GetPostAggregateType<T>>

    /**
     * Group by Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostGroupByArgs['orderBy'] }
        : { orderBy?: PostGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Post model
   */
  readonly fields: PostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Post.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    author<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Post model
   */
  interface PostFieldRefs {
    readonly id: FieldRef<"Post", 'Int'>
    readonly title: FieldRef<"Post", 'String'>
    readonly content: FieldRef<"Post", 'String'>
    readonly published: FieldRef<"Post", 'Boolean'>
    readonly authorId: FieldRef<"Post", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Post findUnique
   */
  export type PostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findUniqueOrThrow
   */
  export type PostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findFirst
   */
  export type PostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findFirstOrThrow
   */
  export type PostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findMany
   */
  export type PostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Posts to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post create
   */
  export type PostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to create a Post.
     */
    data: XOR<PostCreateInput, PostUncheckedCreateInput>
  }

  /**
   * Post createMany
   */
  export type PostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Post createManyAndReturn
   */
  export type PostCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post update
   */
  export type PostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to update a Post.
     */
    data: XOR<PostUpdateInput, PostUncheckedUpdateInput>
    /**
     * Choose, which Post to update.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post updateMany
   */
  export type PostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
  }

  /**
   * Post updateManyAndReturn
   */
  export type PostUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post upsert
   */
  export type PostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The filter to search for the Post to update in case it exists.
     */
    where: PostWhereUniqueInput
    /**
     * In case the Post found by the `where` argument doesn't exist, create a new Post with this data.
     */
    create: XOR<PostCreateInput, PostUncheckedCreateInput>
    /**
     * In case the Post was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostUpdateInput, PostUncheckedUpdateInput>
  }

  /**
   * Post delete
   */
  export type PostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter which Post to delete.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post deleteMany
   */
  export type PostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Posts to delete
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to delete.
     */
    limit?: number
  }

  /**
   * Post without action
   */
  export type PostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    emailverified: 'emailverified',
    datecreated: 'datecreated',
    dateupdated: 'dateupdated',
    dateloggedin: 'dateloggedin',
    userlevel: 'userlevel'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AuthCodeScalarFieldEnum: {
    id: 'id',
    code: 'code',
    userId: 'userId',
    flow: 'flow',
    dateCreated: 'dateCreated',
    expiresAt: 'expiresAt'
  };

  export type AuthCodeScalarFieldEnum = (typeof AuthCodeScalarFieldEnum)[keyof typeof AuthCodeScalarFieldEnum]


  export const OutBoundEmailScalarFieldEnum: {
    id: 'id',
    to: 'to',
    subject: 'subject',
    body: 'body',
    dateCreated: 'dateCreated',
    sentAt: 'sentAt'
  };

  export type OutBoundEmailScalarFieldEnum = (typeof OutBoundEmailScalarFieldEnum)[keyof typeof OutBoundEmailScalarFieldEnum]


  export const OutBoundEmailQueueScalarFieldEnum: {
    id: 'id',
    emailId: 'emailId',
    dateQueued: 'dateQueued',
    sentAt: 'sentAt'
  };

  export type OutBoundEmailQueueScalarFieldEnum = (typeof OutBoundEmailQueueScalarFieldEnum)[keyof typeof OutBoundEmailQueueScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    token: 'token',
    userId: 'userId',
    dateCreated: 'dateCreated',
    expiresAt: 'expiresAt'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const PostScalarFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    published: 'published',
    authorId: 'authorId'
  };

  export type PostScalarFieldEnum = (typeof PostScalarFieldEnum)[keyof typeof PostScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    emailverified?: BoolFilter<"User"> | boolean
    datecreated?: DateTimeFilter<"User"> | Date | string
    dateupdated?: DateTimeFilter<"User"> | Date | string
    dateloggedin?: DateTimeNullableFilter<"User"> | Date | string | null
    userlevel?: IntFilter<"User"> | number
    posts?: PostListRelationFilter
    authCodes?: AuthCodeListRelationFilter
    sessions?: SessionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    emailverified?: SortOrder
    datecreated?: SortOrder
    dateupdated?: SortOrder
    dateloggedin?: SortOrderInput | SortOrder
    userlevel?: SortOrder
    posts?: PostOrderByRelationAggregateInput
    authCodes?: AuthCodeOrderByRelationAggregateInput
    sessions?: SessionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    emailverified?: BoolFilter<"User"> | boolean
    datecreated?: DateTimeFilter<"User"> | Date | string
    dateupdated?: DateTimeFilter<"User"> | Date | string
    dateloggedin?: DateTimeNullableFilter<"User"> | Date | string | null
    userlevel?: IntFilter<"User"> | number
    posts?: PostListRelationFilter
    authCodes?: AuthCodeListRelationFilter
    sessions?: SessionListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    emailverified?: SortOrder
    datecreated?: SortOrder
    dateupdated?: SortOrder
    dateloggedin?: SortOrderInput | SortOrder
    userlevel?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    emailverified?: BoolWithAggregatesFilter<"User"> | boolean
    datecreated?: DateTimeWithAggregatesFilter<"User"> | Date | string
    dateupdated?: DateTimeWithAggregatesFilter<"User"> | Date | string
    dateloggedin?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    userlevel?: IntWithAggregatesFilter<"User"> | number
  }

  export type AuthCodeWhereInput = {
    AND?: AuthCodeWhereInput | AuthCodeWhereInput[]
    OR?: AuthCodeWhereInput[]
    NOT?: AuthCodeWhereInput | AuthCodeWhereInput[]
    id?: IntFilter<"AuthCode"> | number
    code?: StringFilter<"AuthCode"> | string
    userId?: StringFilter<"AuthCode"> | string
    flow?: StringFilter<"AuthCode"> | string
    dateCreated?: DateTimeFilter<"AuthCode"> | Date | string
    expiresAt?: DateTimeFilter<"AuthCode"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AuthCodeOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    userId?: SortOrder
    flow?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AuthCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    code?: string
    AND?: AuthCodeWhereInput | AuthCodeWhereInput[]
    OR?: AuthCodeWhereInput[]
    NOT?: AuthCodeWhereInput | AuthCodeWhereInput[]
    userId?: StringFilter<"AuthCode"> | string
    flow?: StringFilter<"AuthCode"> | string
    dateCreated?: DateTimeFilter<"AuthCode"> | Date | string
    expiresAt?: DateTimeFilter<"AuthCode"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "code">

  export type AuthCodeOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    userId?: SortOrder
    flow?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
    _count?: AuthCodeCountOrderByAggregateInput
    _avg?: AuthCodeAvgOrderByAggregateInput
    _max?: AuthCodeMaxOrderByAggregateInput
    _min?: AuthCodeMinOrderByAggregateInput
    _sum?: AuthCodeSumOrderByAggregateInput
  }

  export type AuthCodeScalarWhereWithAggregatesInput = {
    AND?: AuthCodeScalarWhereWithAggregatesInput | AuthCodeScalarWhereWithAggregatesInput[]
    OR?: AuthCodeScalarWhereWithAggregatesInput[]
    NOT?: AuthCodeScalarWhereWithAggregatesInput | AuthCodeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AuthCode"> | number
    code?: StringWithAggregatesFilter<"AuthCode"> | string
    userId?: StringWithAggregatesFilter<"AuthCode"> | string
    flow?: StringWithAggregatesFilter<"AuthCode"> | string
    dateCreated?: DateTimeWithAggregatesFilter<"AuthCode"> | Date | string
    expiresAt?: DateTimeWithAggregatesFilter<"AuthCode"> | Date | string
  }

  export type OutBoundEmailWhereInput = {
    AND?: OutBoundEmailWhereInput | OutBoundEmailWhereInput[]
    OR?: OutBoundEmailWhereInput[]
    NOT?: OutBoundEmailWhereInput | OutBoundEmailWhereInput[]
    id?: IntFilter<"OutBoundEmail"> | number
    to?: StringFilter<"OutBoundEmail"> | string
    subject?: StringFilter<"OutBoundEmail"> | string
    body?: StringFilter<"OutBoundEmail"> | string
    dateCreated?: DateTimeFilter<"OutBoundEmail"> | Date | string
    sentAt?: DateTimeNullableFilter<"OutBoundEmail"> | Date | string | null
    outBoundEmailQueues?: OutBoundEmailQueueListRelationFilter
  }

  export type OutBoundEmailOrderByWithRelationInput = {
    id?: SortOrder
    to?: SortOrder
    subject?: SortOrder
    body?: SortOrder
    dateCreated?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    outBoundEmailQueues?: OutBoundEmailQueueOrderByRelationAggregateInput
  }

  export type OutBoundEmailWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: OutBoundEmailWhereInput | OutBoundEmailWhereInput[]
    OR?: OutBoundEmailWhereInput[]
    NOT?: OutBoundEmailWhereInput | OutBoundEmailWhereInput[]
    to?: StringFilter<"OutBoundEmail"> | string
    subject?: StringFilter<"OutBoundEmail"> | string
    body?: StringFilter<"OutBoundEmail"> | string
    dateCreated?: DateTimeFilter<"OutBoundEmail"> | Date | string
    sentAt?: DateTimeNullableFilter<"OutBoundEmail"> | Date | string | null
    outBoundEmailQueues?: OutBoundEmailQueueListRelationFilter
  }, "id">

  export type OutBoundEmailOrderByWithAggregationInput = {
    id?: SortOrder
    to?: SortOrder
    subject?: SortOrder
    body?: SortOrder
    dateCreated?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    _count?: OutBoundEmailCountOrderByAggregateInput
    _avg?: OutBoundEmailAvgOrderByAggregateInput
    _max?: OutBoundEmailMaxOrderByAggregateInput
    _min?: OutBoundEmailMinOrderByAggregateInput
    _sum?: OutBoundEmailSumOrderByAggregateInput
  }

  export type OutBoundEmailScalarWhereWithAggregatesInput = {
    AND?: OutBoundEmailScalarWhereWithAggregatesInput | OutBoundEmailScalarWhereWithAggregatesInput[]
    OR?: OutBoundEmailScalarWhereWithAggregatesInput[]
    NOT?: OutBoundEmailScalarWhereWithAggregatesInput | OutBoundEmailScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OutBoundEmail"> | number
    to?: StringWithAggregatesFilter<"OutBoundEmail"> | string
    subject?: StringWithAggregatesFilter<"OutBoundEmail"> | string
    body?: StringWithAggregatesFilter<"OutBoundEmail"> | string
    dateCreated?: DateTimeWithAggregatesFilter<"OutBoundEmail"> | Date | string
    sentAt?: DateTimeNullableWithAggregatesFilter<"OutBoundEmail"> | Date | string | null
  }

  export type OutBoundEmailQueueWhereInput = {
    AND?: OutBoundEmailQueueWhereInput | OutBoundEmailQueueWhereInput[]
    OR?: OutBoundEmailQueueWhereInput[]
    NOT?: OutBoundEmailQueueWhereInput | OutBoundEmailQueueWhereInput[]
    id?: IntFilter<"OutBoundEmailQueue"> | number
    emailId?: IntFilter<"OutBoundEmailQueue"> | number
    dateQueued?: DateTimeFilter<"OutBoundEmailQueue"> | Date | string
    sentAt?: DateTimeNullableFilter<"OutBoundEmailQueue"> | Date | string | null
    email?: XOR<OutBoundEmailScalarRelationFilter, OutBoundEmailWhereInput>
  }

  export type OutBoundEmailQueueOrderByWithRelationInput = {
    id?: SortOrder
    emailId?: SortOrder
    dateQueued?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    email?: OutBoundEmailOrderByWithRelationInput
  }

  export type OutBoundEmailQueueWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: OutBoundEmailQueueWhereInput | OutBoundEmailQueueWhereInput[]
    OR?: OutBoundEmailQueueWhereInput[]
    NOT?: OutBoundEmailQueueWhereInput | OutBoundEmailQueueWhereInput[]
    emailId?: IntFilter<"OutBoundEmailQueue"> | number
    dateQueued?: DateTimeFilter<"OutBoundEmailQueue"> | Date | string
    sentAt?: DateTimeNullableFilter<"OutBoundEmailQueue"> | Date | string | null
    email?: XOR<OutBoundEmailScalarRelationFilter, OutBoundEmailWhereInput>
  }, "id">

  export type OutBoundEmailQueueOrderByWithAggregationInput = {
    id?: SortOrder
    emailId?: SortOrder
    dateQueued?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    _count?: OutBoundEmailQueueCountOrderByAggregateInput
    _avg?: OutBoundEmailQueueAvgOrderByAggregateInput
    _max?: OutBoundEmailQueueMaxOrderByAggregateInput
    _min?: OutBoundEmailQueueMinOrderByAggregateInput
    _sum?: OutBoundEmailQueueSumOrderByAggregateInput
  }

  export type OutBoundEmailQueueScalarWhereWithAggregatesInput = {
    AND?: OutBoundEmailQueueScalarWhereWithAggregatesInput | OutBoundEmailQueueScalarWhereWithAggregatesInput[]
    OR?: OutBoundEmailQueueScalarWhereWithAggregatesInput[]
    NOT?: OutBoundEmailQueueScalarWhereWithAggregatesInput | OutBoundEmailQueueScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OutBoundEmailQueue"> | number
    emailId?: IntWithAggregatesFilter<"OutBoundEmailQueue"> | number
    dateQueued?: DateTimeWithAggregatesFilter<"OutBoundEmailQueue"> | Date | string
    sentAt?: DateTimeNullableWithAggregatesFilter<"OutBoundEmailQueue"> | Date | string | null
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: IntFilter<"Session"> | number
    token?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    dateCreated?: DateTimeFilter<"Session"> | Date | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    token?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    userId?: StringFilter<"Session"> | string
    dateCreated?: DateTimeFilter<"Session"> | Date | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _avg?: SessionAvgOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
    _sum?: SessionSumOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Session"> | number
    token?: StringWithAggregatesFilter<"Session"> | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    dateCreated?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    expiresAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
  }

  export type PostWhereInput = {
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    id?: IntFilter<"Post"> | number
    title?: StringFilter<"Post"> | string
    content?: StringNullableFilter<"Post"> | string | null
    published?: BoolFilter<"Post"> | boolean
    authorId?: StringFilter<"Post"> | string
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type PostOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrderInput | SortOrder
    published?: SortOrder
    authorId?: SortOrder
    author?: UserOrderByWithRelationInput
  }

  export type PostWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    title?: StringFilter<"Post"> | string
    content?: StringNullableFilter<"Post"> | string | null
    published?: BoolFilter<"Post"> | boolean
    authorId?: StringFilter<"Post"> | string
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type PostOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrderInput | SortOrder
    published?: SortOrder
    authorId?: SortOrder
    _count?: PostCountOrderByAggregateInput
    _avg?: PostAvgOrderByAggregateInput
    _max?: PostMaxOrderByAggregateInput
    _min?: PostMinOrderByAggregateInput
    _sum?: PostSumOrderByAggregateInput
  }

  export type PostScalarWhereWithAggregatesInput = {
    AND?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    OR?: PostScalarWhereWithAggregatesInput[]
    NOT?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Post"> | number
    title?: StringWithAggregatesFilter<"Post"> | string
    content?: StringNullableWithAggregatesFilter<"Post"> | string | null
    published?: BoolWithAggregatesFilter<"Post"> | boolean
    authorId?: StringWithAggregatesFilter<"Post"> | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    posts?: PostCreateNestedManyWithoutAuthorInput
    authCodes?: AuthCodeCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    authCodes?: AuthCodeUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    posts?: PostUpdateManyWithoutAuthorNestedInput
    authCodes?: AuthCodeUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    authCodes?: AuthCodeUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
  }

  export type AuthCodeCreateInput = {
    code: string
    flow: string
    dateCreated?: Date | string
    expiresAt?: Date | string
    user: UserCreateNestedOneWithoutAuthCodesInput
  }

  export type AuthCodeUncheckedCreateInput = {
    id?: number
    code: string
    userId: string
    flow: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type AuthCodeUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    flow?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAuthCodesNestedInput
  }

  export type AuthCodeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    flow?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeCreateManyInput = {
    id?: number
    code: string
    userId: string
    flow: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type AuthCodeUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string
    flow?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    flow?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutBoundEmailCreateInput = {
    to: string
    subject: string
    body: string
    dateCreated?: Date | string
    sentAt?: Date | string | null
    outBoundEmailQueues?: OutBoundEmailQueueCreateNestedManyWithoutEmailInput
  }

  export type OutBoundEmailUncheckedCreateInput = {
    id?: number
    to: string
    subject: string
    body: string
    dateCreated?: Date | string
    sentAt?: Date | string | null
    outBoundEmailQueues?: OutBoundEmailQueueUncheckedCreateNestedManyWithoutEmailInput
  }

  export type OutBoundEmailUpdateInput = {
    to?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    outBoundEmailQueues?: OutBoundEmailQueueUpdateManyWithoutEmailNestedInput
  }

  export type OutBoundEmailUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    to?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    outBoundEmailQueues?: OutBoundEmailQueueUncheckedUpdateManyWithoutEmailNestedInput
  }

  export type OutBoundEmailCreateManyInput = {
    id?: number
    to: string
    subject: string
    body: string
    dateCreated?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailUpdateManyMutationInput = {
    to?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutBoundEmailUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    to?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutBoundEmailQueueCreateInput = {
    dateQueued?: Date | string
    sentAt?: Date | string | null
    email: OutBoundEmailCreateNestedOneWithoutOutBoundEmailQueuesInput
  }

  export type OutBoundEmailQueueUncheckedCreateInput = {
    id?: number
    emailId: number
    dateQueued?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailQueueUpdateInput = {
    dateQueued?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    email?: OutBoundEmailUpdateOneRequiredWithoutOutBoundEmailQueuesNestedInput
  }

  export type OutBoundEmailQueueUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    emailId?: IntFieldUpdateOperationsInput | number
    dateQueued?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutBoundEmailQueueCreateManyInput = {
    id?: number
    emailId: number
    dateQueued?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailQueueUpdateManyMutationInput = {
    dateQueued?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutBoundEmailQueueUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    emailId?: IntFieldUpdateOperationsInput | number
    dateQueued?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SessionCreateInput = {
    token: string
    dateCreated?: Date | string
    expiresAt?: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: number
    token: string
    userId: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type SessionUpdateInput = {
    token?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    token?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    id?: number
    token: string
    userId: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    token?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    token?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostCreateInput = {
    title: string
    content?: string | null
    published?: boolean
    author: UserCreateNestedOneWithoutPostsInput
  }

  export type PostUncheckedCreateInput = {
    id?: number
    title: string
    content?: string | null
    published?: boolean
    authorId: string
  }

  export type PostUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    published?: BoolFieldUpdateOperationsInput | boolean
    author?: UserUpdateOneRequiredWithoutPostsNestedInput
  }

  export type PostUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    published?: BoolFieldUpdateOperationsInput | boolean
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type PostCreateManyInput = {
    id?: number
    title: string
    content?: string | null
    published?: boolean
    authorId: string
  }

  export type PostUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    published?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PostUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    published?: BoolFieldUpdateOperationsInput | boolean
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type PostListRelationFilter = {
    every?: PostWhereInput
    some?: PostWhereInput
    none?: PostWhereInput
  }

  export type AuthCodeListRelationFilter = {
    every?: AuthCodeWhereInput
    some?: AuthCodeWhereInput
    none?: AuthCodeWhereInput
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PostOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuthCodeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    emailverified?: SortOrder
    datecreated?: SortOrder
    dateupdated?: SortOrder
    dateloggedin?: SortOrder
    userlevel?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    userlevel?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    emailverified?: SortOrder
    datecreated?: SortOrder
    dateupdated?: SortOrder
    dateloggedin?: SortOrder
    userlevel?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    emailverified?: SortOrder
    datecreated?: SortOrder
    dateupdated?: SortOrder
    dateloggedin?: SortOrder
    userlevel?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    userlevel?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type AuthCodeCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    userId?: SortOrder
    flow?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
  }

  export type AuthCodeAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AuthCodeMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    userId?: SortOrder
    flow?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
  }

  export type AuthCodeMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    userId?: SortOrder
    flow?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
  }

  export type AuthCodeSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type OutBoundEmailQueueListRelationFilter = {
    every?: OutBoundEmailQueueWhereInput
    some?: OutBoundEmailQueueWhereInput
    none?: OutBoundEmailQueueWhereInput
  }

  export type OutBoundEmailQueueOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OutBoundEmailCountOrderByAggregateInput = {
    id?: SortOrder
    to?: SortOrder
    subject?: SortOrder
    body?: SortOrder
    dateCreated?: SortOrder
    sentAt?: SortOrder
  }

  export type OutBoundEmailAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type OutBoundEmailMaxOrderByAggregateInput = {
    id?: SortOrder
    to?: SortOrder
    subject?: SortOrder
    body?: SortOrder
    dateCreated?: SortOrder
    sentAt?: SortOrder
  }

  export type OutBoundEmailMinOrderByAggregateInput = {
    id?: SortOrder
    to?: SortOrder
    subject?: SortOrder
    body?: SortOrder
    dateCreated?: SortOrder
    sentAt?: SortOrder
  }

  export type OutBoundEmailSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type OutBoundEmailScalarRelationFilter = {
    is?: OutBoundEmailWhereInput
    isNot?: OutBoundEmailWhereInput
  }

  export type OutBoundEmailQueueCountOrderByAggregateInput = {
    id?: SortOrder
    emailId?: SortOrder
    dateQueued?: SortOrder
    sentAt?: SortOrder
  }

  export type OutBoundEmailQueueAvgOrderByAggregateInput = {
    id?: SortOrder
    emailId?: SortOrder
  }

  export type OutBoundEmailQueueMaxOrderByAggregateInput = {
    id?: SortOrder
    emailId?: SortOrder
    dateQueued?: SortOrder
    sentAt?: SortOrder
  }

  export type OutBoundEmailQueueMinOrderByAggregateInput = {
    id?: SortOrder
    emailId?: SortOrder
    dateQueued?: SortOrder
    sentAt?: SortOrder
  }

  export type OutBoundEmailQueueSumOrderByAggregateInput = {
    id?: SortOrder
    emailId?: SortOrder
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
  }

  export type SessionAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    dateCreated?: SortOrder
    expiresAt?: SortOrder
  }

  export type SessionSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PostCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    published?: SortOrder
    authorId?: SortOrder
  }

  export type PostAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PostMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    published?: SortOrder
    authorId?: SortOrder
  }

  export type PostMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    published?: SortOrder
    authorId?: SortOrder
  }

  export type PostSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PostCreateNestedManyWithoutAuthorInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type AuthCodeCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthCodeCreateWithoutUserInput, AuthCodeUncheckedCreateWithoutUserInput> | AuthCodeCreateWithoutUserInput[] | AuthCodeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthCodeCreateOrConnectWithoutUserInput | AuthCodeCreateOrConnectWithoutUserInput[]
    createMany?: AuthCodeCreateManyUserInputEnvelope
    connect?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type AuthCodeUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthCodeCreateWithoutUserInput, AuthCodeUncheckedCreateWithoutUserInput> | AuthCodeCreateWithoutUserInput[] | AuthCodeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthCodeCreateOrConnectWithoutUserInput | AuthCodeCreateOrConnectWithoutUserInput[]
    createMany?: AuthCodeCreateManyUserInputEnvelope
    connect?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PostUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutAuthorInput | PostUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutAuthorInput | PostUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: PostUpdateManyWithWhereWithoutAuthorInput | PostUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type AuthCodeUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthCodeCreateWithoutUserInput, AuthCodeUncheckedCreateWithoutUserInput> | AuthCodeCreateWithoutUserInput[] | AuthCodeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthCodeCreateOrConnectWithoutUserInput | AuthCodeCreateOrConnectWithoutUserInput[]
    upsert?: AuthCodeUpsertWithWhereUniqueWithoutUserInput | AuthCodeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthCodeCreateManyUserInputEnvelope
    set?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    disconnect?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    delete?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    connect?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    update?: AuthCodeUpdateWithWhereUniqueWithoutUserInput | AuthCodeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthCodeUpdateManyWithWhereWithoutUserInput | AuthCodeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthCodeScalarWhereInput | AuthCodeScalarWhereInput[]
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutAuthorInput | PostUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutAuthorInput | PostUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: PostUpdateManyWithWhereWithoutAuthorInput | PostUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type AuthCodeUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthCodeCreateWithoutUserInput, AuthCodeUncheckedCreateWithoutUserInput> | AuthCodeCreateWithoutUserInput[] | AuthCodeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthCodeCreateOrConnectWithoutUserInput | AuthCodeCreateOrConnectWithoutUserInput[]
    upsert?: AuthCodeUpsertWithWhereUniqueWithoutUserInput | AuthCodeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthCodeCreateManyUserInputEnvelope
    set?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    disconnect?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    delete?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    connect?: AuthCodeWhereUniqueInput | AuthCodeWhereUniqueInput[]
    update?: AuthCodeUpdateWithWhereUniqueWithoutUserInput | AuthCodeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthCodeUpdateManyWithWhereWithoutUserInput | AuthCodeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthCodeScalarWhereInput | AuthCodeScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAuthCodesInput = {
    create?: XOR<UserCreateWithoutAuthCodesInput, UserUncheckedCreateWithoutAuthCodesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuthCodesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAuthCodesNestedInput = {
    create?: XOR<UserCreateWithoutAuthCodesInput, UserUncheckedCreateWithoutAuthCodesInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuthCodesInput
    upsert?: UserUpsertWithoutAuthCodesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAuthCodesInput, UserUpdateWithoutAuthCodesInput>, UserUncheckedUpdateWithoutAuthCodesInput>
  }

  export type OutBoundEmailQueueCreateNestedManyWithoutEmailInput = {
    create?: XOR<OutBoundEmailQueueCreateWithoutEmailInput, OutBoundEmailQueueUncheckedCreateWithoutEmailInput> | OutBoundEmailQueueCreateWithoutEmailInput[] | OutBoundEmailQueueUncheckedCreateWithoutEmailInput[]
    connectOrCreate?: OutBoundEmailQueueCreateOrConnectWithoutEmailInput | OutBoundEmailQueueCreateOrConnectWithoutEmailInput[]
    createMany?: OutBoundEmailQueueCreateManyEmailInputEnvelope
    connect?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
  }

  export type OutBoundEmailQueueUncheckedCreateNestedManyWithoutEmailInput = {
    create?: XOR<OutBoundEmailQueueCreateWithoutEmailInput, OutBoundEmailQueueUncheckedCreateWithoutEmailInput> | OutBoundEmailQueueCreateWithoutEmailInput[] | OutBoundEmailQueueUncheckedCreateWithoutEmailInput[]
    connectOrCreate?: OutBoundEmailQueueCreateOrConnectWithoutEmailInput | OutBoundEmailQueueCreateOrConnectWithoutEmailInput[]
    createMany?: OutBoundEmailQueueCreateManyEmailInputEnvelope
    connect?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
  }

  export type OutBoundEmailQueueUpdateManyWithoutEmailNestedInput = {
    create?: XOR<OutBoundEmailQueueCreateWithoutEmailInput, OutBoundEmailQueueUncheckedCreateWithoutEmailInput> | OutBoundEmailQueueCreateWithoutEmailInput[] | OutBoundEmailQueueUncheckedCreateWithoutEmailInput[]
    connectOrCreate?: OutBoundEmailQueueCreateOrConnectWithoutEmailInput | OutBoundEmailQueueCreateOrConnectWithoutEmailInput[]
    upsert?: OutBoundEmailQueueUpsertWithWhereUniqueWithoutEmailInput | OutBoundEmailQueueUpsertWithWhereUniqueWithoutEmailInput[]
    createMany?: OutBoundEmailQueueCreateManyEmailInputEnvelope
    set?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    disconnect?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    delete?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    connect?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    update?: OutBoundEmailQueueUpdateWithWhereUniqueWithoutEmailInput | OutBoundEmailQueueUpdateWithWhereUniqueWithoutEmailInput[]
    updateMany?: OutBoundEmailQueueUpdateManyWithWhereWithoutEmailInput | OutBoundEmailQueueUpdateManyWithWhereWithoutEmailInput[]
    deleteMany?: OutBoundEmailQueueScalarWhereInput | OutBoundEmailQueueScalarWhereInput[]
  }

  export type OutBoundEmailQueueUncheckedUpdateManyWithoutEmailNestedInput = {
    create?: XOR<OutBoundEmailQueueCreateWithoutEmailInput, OutBoundEmailQueueUncheckedCreateWithoutEmailInput> | OutBoundEmailQueueCreateWithoutEmailInput[] | OutBoundEmailQueueUncheckedCreateWithoutEmailInput[]
    connectOrCreate?: OutBoundEmailQueueCreateOrConnectWithoutEmailInput | OutBoundEmailQueueCreateOrConnectWithoutEmailInput[]
    upsert?: OutBoundEmailQueueUpsertWithWhereUniqueWithoutEmailInput | OutBoundEmailQueueUpsertWithWhereUniqueWithoutEmailInput[]
    createMany?: OutBoundEmailQueueCreateManyEmailInputEnvelope
    set?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    disconnect?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    delete?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    connect?: OutBoundEmailQueueWhereUniqueInput | OutBoundEmailQueueWhereUniqueInput[]
    update?: OutBoundEmailQueueUpdateWithWhereUniqueWithoutEmailInput | OutBoundEmailQueueUpdateWithWhereUniqueWithoutEmailInput[]
    updateMany?: OutBoundEmailQueueUpdateManyWithWhereWithoutEmailInput | OutBoundEmailQueueUpdateManyWithWhereWithoutEmailInput[]
    deleteMany?: OutBoundEmailQueueScalarWhereInput | OutBoundEmailQueueScalarWhereInput[]
  }

  export type OutBoundEmailCreateNestedOneWithoutOutBoundEmailQueuesInput = {
    create?: XOR<OutBoundEmailCreateWithoutOutBoundEmailQueuesInput, OutBoundEmailUncheckedCreateWithoutOutBoundEmailQueuesInput>
    connectOrCreate?: OutBoundEmailCreateOrConnectWithoutOutBoundEmailQueuesInput
    connect?: OutBoundEmailWhereUniqueInput
  }

  export type OutBoundEmailUpdateOneRequiredWithoutOutBoundEmailQueuesNestedInput = {
    create?: XOR<OutBoundEmailCreateWithoutOutBoundEmailQueuesInput, OutBoundEmailUncheckedCreateWithoutOutBoundEmailQueuesInput>
    connectOrCreate?: OutBoundEmailCreateOrConnectWithoutOutBoundEmailQueuesInput
    upsert?: OutBoundEmailUpsertWithoutOutBoundEmailQueuesInput
    connect?: OutBoundEmailWhereUniqueInput
    update?: XOR<XOR<OutBoundEmailUpdateToOneWithWhereWithoutOutBoundEmailQueuesInput, OutBoundEmailUpdateWithoutOutBoundEmailQueuesInput>, OutBoundEmailUncheckedUpdateWithoutOutBoundEmailQueuesInput>
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserCreateNestedOneWithoutPostsInput = {
    create?: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutPostsNestedInput = {
    create?: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostsInput
    upsert?: UserUpsertWithoutPostsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPostsInput, UserUpdateWithoutPostsInput>, UserUncheckedUpdateWithoutPostsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type PostCreateWithoutAuthorInput = {
    title: string
    content?: string | null
    published?: boolean
  }

  export type PostUncheckedCreateWithoutAuthorInput = {
    id?: number
    title: string
    content?: string | null
    published?: boolean
  }

  export type PostCreateOrConnectWithoutAuthorInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput>
  }

  export type PostCreateManyAuthorInputEnvelope = {
    data: PostCreateManyAuthorInput | PostCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type AuthCodeCreateWithoutUserInput = {
    code: string
    flow: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type AuthCodeUncheckedCreateWithoutUserInput = {
    id?: number
    code: string
    flow: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type AuthCodeCreateOrConnectWithoutUserInput = {
    where: AuthCodeWhereUniqueInput
    create: XOR<AuthCodeCreateWithoutUserInput, AuthCodeUncheckedCreateWithoutUserInput>
  }

  export type AuthCodeCreateManyUserInputEnvelope = {
    data: AuthCodeCreateManyUserInput | AuthCodeCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SessionCreateWithoutUserInput = {
    token: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: number
    token: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PostUpsertWithWhereUniqueWithoutAuthorInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutAuthorInput, PostUncheckedUpdateWithoutAuthorInput>
    create: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput>
  }

  export type PostUpdateWithWhereUniqueWithoutAuthorInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutAuthorInput, PostUncheckedUpdateWithoutAuthorInput>
  }

  export type PostUpdateManyWithWhereWithoutAuthorInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutAuthorInput>
  }

  export type PostScalarWhereInput = {
    AND?: PostScalarWhereInput | PostScalarWhereInput[]
    OR?: PostScalarWhereInput[]
    NOT?: PostScalarWhereInput | PostScalarWhereInput[]
    id?: IntFilter<"Post"> | number
    title?: StringFilter<"Post"> | string
    content?: StringNullableFilter<"Post"> | string | null
    published?: BoolFilter<"Post"> | boolean
    authorId?: StringFilter<"Post"> | string
  }

  export type AuthCodeUpsertWithWhereUniqueWithoutUserInput = {
    where: AuthCodeWhereUniqueInput
    update: XOR<AuthCodeUpdateWithoutUserInput, AuthCodeUncheckedUpdateWithoutUserInput>
    create: XOR<AuthCodeCreateWithoutUserInput, AuthCodeUncheckedCreateWithoutUserInput>
  }

  export type AuthCodeUpdateWithWhereUniqueWithoutUserInput = {
    where: AuthCodeWhereUniqueInput
    data: XOR<AuthCodeUpdateWithoutUserInput, AuthCodeUncheckedUpdateWithoutUserInput>
  }

  export type AuthCodeUpdateManyWithWhereWithoutUserInput = {
    where: AuthCodeScalarWhereInput
    data: XOR<AuthCodeUpdateManyMutationInput, AuthCodeUncheckedUpdateManyWithoutUserInput>
  }

  export type AuthCodeScalarWhereInput = {
    AND?: AuthCodeScalarWhereInput | AuthCodeScalarWhereInput[]
    OR?: AuthCodeScalarWhereInput[]
    NOT?: AuthCodeScalarWhereInput | AuthCodeScalarWhereInput[]
    id?: IntFilter<"AuthCode"> | number
    code?: StringFilter<"AuthCode"> | string
    userId?: StringFilter<"AuthCode"> | string
    flow?: StringFilter<"AuthCode"> | string
    dateCreated?: DateTimeFilter<"AuthCode"> | Date | string
    expiresAt?: DateTimeFilter<"AuthCode"> | Date | string
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: IntFilter<"Session"> | number
    token?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    dateCreated?: DateTimeFilter<"Session"> | Date | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
  }

  export type UserCreateWithoutAuthCodesInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    posts?: PostCreateNestedManyWithoutAuthorInput
    sessions?: SessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAuthCodesInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAuthCodesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAuthCodesInput, UserUncheckedCreateWithoutAuthCodesInput>
  }

  export type UserUpsertWithoutAuthCodesInput = {
    update: XOR<UserUpdateWithoutAuthCodesInput, UserUncheckedUpdateWithoutAuthCodesInput>
    create: XOR<UserCreateWithoutAuthCodesInput, UserUncheckedCreateWithoutAuthCodesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAuthCodesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAuthCodesInput, UserUncheckedUpdateWithoutAuthCodesInput>
  }

  export type UserUpdateWithoutAuthCodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAuthCodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OutBoundEmailQueueCreateWithoutEmailInput = {
    dateQueued?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailQueueUncheckedCreateWithoutEmailInput = {
    id?: number
    dateQueued?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailQueueCreateOrConnectWithoutEmailInput = {
    where: OutBoundEmailQueueWhereUniqueInput
    create: XOR<OutBoundEmailQueueCreateWithoutEmailInput, OutBoundEmailQueueUncheckedCreateWithoutEmailInput>
  }

  export type OutBoundEmailQueueCreateManyEmailInputEnvelope = {
    data: OutBoundEmailQueueCreateManyEmailInput | OutBoundEmailQueueCreateManyEmailInput[]
    skipDuplicates?: boolean
  }

  export type OutBoundEmailQueueUpsertWithWhereUniqueWithoutEmailInput = {
    where: OutBoundEmailQueueWhereUniqueInput
    update: XOR<OutBoundEmailQueueUpdateWithoutEmailInput, OutBoundEmailQueueUncheckedUpdateWithoutEmailInput>
    create: XOR<OutBoundEmailQueueCreateWithoutEmailInput, OutBoundEmailQueueUncheckedCreateWithoutEmailInput>
  }

  export type OutBoundEmailQueueUpdateWithWhereUniqueWithoutEmailInput = {
    where: OutBoundEmailQueueWhereUniqueInput
    data: XOR<OutBoundEmailQueueUpdateWithoutEmailInput, OutBoundEmailQueueUncheckedUpdateWithoutEmailInput>
  }

  export type OutBoundEmailQueueUpdateManyWithWhereWithoutEmailInput = {
    where: OutBoundEmailQueueScalarWhereInput
    data: XOR<OutBoundEmailQueueUpdateManyMutationInput, OutBoundEmailQueueUncheckedUpdateManyWithoutEmailInput>
  }

  export type OutBoundEmailQueueScalarWhereInput = {
    AND?: OutBoundEmailQueueScalarWhereInput | OutBoundEmailQueueScalarWhereInput[]
    OR?: OutBoundEmailQueueScalarWhereInput[]
    NOT?: OutBoundEmailQueueScalarWhereInput | OutBoundEmailQueueScalarWhereInput[]
    id?: IntFilter<"OutBoundEmailQueue"> | number
    emailId?: IntFilter<"OutBoundEmailQueue"> | number
    dateQueued?: DateTimeFilter<"OutBoundEmailQueue"> | Date | string
    sentAt?: DateTimeNullableFilter<"OutBoundEmailQueue"> | Date | string | null
  }

  export type OutBoundEmailCreateWithoutOutBoundEmailQueuesInput = {
    to: string
    subject: string
    body: string
    dateCreated?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailUncheckedCreateWithoutOutBoundEmailQueuesInput = {
    id?: number
    to: string
    subject: string
    body: string
    dateCreated?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailCreateOrConnectWithoutOutBoundEmailQueuesInput = {
    where: OutBoundEmailWhereUniqueInput
    create: XOR<OutBoundEmailCreateWithoutOutBoundEmailQueuesInput, OutBoundEmailUncheckedCreateWithoutOutBoundEmailQueuesInput>
  }

  export type OutBoundEmailUpsertWithoutOutBoundEmailQueuesInput = {
    update: XOR<OutBoundEmailUpdateWithoutOutBoundEmailQueuesInput, OutBoundEmailUncheckedUpdateWithoutOutBoundEmailQueuesInput>
    create: XOR<OutBoundEmailCreateWithoutOutBoundEmailQueuesInput, OutBoundEmailUncheckedCreateWithoutOutBoundEmailQueuesInput>
    where?: OutBoundEmailWhereInput
  }

  export type OutBoundEmailUpdateToOneWithWhereWithoutOutBoundEmailQueuesInput = {
    where?: OutBoundEmailWhereInput
    data: XOR<OutBoundEmailUpdateWithoutOutBoundEmailQueuesInput, OutBoundEmailUncheckedUpdateWithoutOutBoundEmailQueuesInput>
  }

  export type OutBoundEmailUpdateWithoutOutBoundEmailQueuesInput = {
    to?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutBoundEmailUncheckedUpdateWithoutOutBoundEmailQueuesInput = {
    id?: IntFieldUpdateOperationsInput | number
    to?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    posts?: PostCreateNestedManyWithoutAuthorInput
    authCodes?: AuthCodeCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    authCodes?: AuthCodeUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    posts?: PostUpdateManyWithoutAuthorNestedInput
    authCodes?: AuthCodeUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    authCodes?: AuthCodeUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPostsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    authCodes?: AuthCodeCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPostsInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    emailverified?: boolean
    datecreated?: Date | string
    dateupdated?: Date | string
    dateloggedin?: Date | string | null
    userlevel?: number
    authCodes?: AuthCodeUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPostsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
  }

  export type UserUpsertWithoutPostsInput = {
    update: XOR<UserUpdateWithoutPostsInput, UserUncheckedUpdateWithoutPostsInput>
    create: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPostsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPostsInput, UserUncheckedUpdateWithoutPostsInput>
  }

  export type UserUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    authCodes?: AuthCodeUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    emailverified?: BoolFieldUpdateOperationsInput | boolean
    datecreated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateupdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dateloggedin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userlevel?: IntFieldUpdateOperationsInput | number
    authCodes?: AuthCodeUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PostCreateManyAuthorInput = {
    id?: number
    title: string
    content?: string | null
    published?: boolean
  }

  export type AuthCodeCreateManyUserInput = {
    id?: number
    code: string
    flow: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type SessionCreateManyUserInput = {
    id?: number
    token: string
    dateCreated?: Date | string
    expiresAt?: Date | string
  }

  export type PostUpdateWithoutAuthorInput = {
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    published?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PostUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    published?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PostUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    published?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AuthCodeUpdateWithoutUserInput = {
    code?: StringFieldUpdateOperationsInput | string
    flow?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    flow?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthCodeUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    flow?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUpdateWithoutUserInput = {
    token?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    token?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    token?: StringFieldUpdateOperationsInput | string
    dateCreated?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutBoundEmailQueueCreateManyEmailInput = {
    id?: number
    dateQueued?: Date | string
    sentAt?: Date | string | null
  }

  export type OutBoundEmailQueueUpdateWithoutEmailInput = {
    dateQueued?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutBoundEmailQueueUncheckedUpdateWithoutEmailInput = {
    id?: IntFieldUpdateOperationsInput | number
    dateQueued?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutBoundEmailQueueUncheckedUpdateManyWithoutEmailInput = {
    id?: IntFieldUpdateOperationsInput | number
    dateQueued?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}