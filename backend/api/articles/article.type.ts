import { Static, Type } from "@sinclair/typebox";
import {
  ApiErrorResponseSchema,
  createPaginatedSuccessResponseSchema,
  createSuccessResponseSchema,
} from "../../shared/types/response.type";

export const ArticleStatusSchema = Type.Union([
  Type.Literal("Draft"),
  Type.Literal("Published"),
]);

export const ArticlePathParamsSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
  },
  { additionalProperties: false }
);

export const CreateArticleBodySchema = Type.Object(
  {
    title: Type.String({ minLength: 1, maxLength: 150 }),
    content: Type.String({ minLength: 50 }),
    category: Type.String({ minLength: 1, maxLength: 80 }),
    status: Type.Optional(ArticleStatusSchema),
  },
  { additionalProperties: false }
);

export const UpdateArticleBodySchema = Type.Object(
  {
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 150 })),
    content: Type.Optional(Type.String({ minLength: 50 })),
    category: Type.Optional(Type.String({ minLength: 1, maxLength: 80 })),
    status: Type.Optional(ArticleStatusSchema),
  },
  { additionalProperties: false }
);

export const ArticleListQuerySchema = Type.Object(
  {
    category: Type.Optional(Type.String()),
    author: Type.Optional(Type.String()),
    q: Type.Optional(Type.String()),
    pageNumber: Type.Optional(Type.String()),
    pageSize: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

export const MyArticlesQuerySchema = Type.Object(
  {
    includeDeleted: Type.Optional(Type.String()),
    pageNumber: Type.Optional(Type.String()),
    pageSize: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

export const ArticleListItemSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    title: Type.String(),
    category: Type.String(),
    status: ArticleStatusSchema,
    createdAt: Type.String({ format: "date-time" }),
    authorId: Type.String({ format: "uuid" }),
    authorName: Type.String(),
  },
  { additionalProperties: false }
);

export const MyArticleListItemSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    title: Type.String(),
    category: Type.String(),
    status: ArticleStatusSchema,
    createdAt: Type.String({ format: "date-time" }),
    deletedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  },
  { additionalProperties: false }
);

export const ArticleDetailSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    title: Type.String(),
    content: Type.String(),
    category: Type.String(),
    status: ArticleStatusSchema,
    createdAt: Type.String({ format: "date-time" }),
    authorId: Type.String({ format: "uuid" }),
    authorName: Type.String(),
  },
  { additionalProperties: false }
);

export const ArticleDetailResponseSchema = createSuccessResponseSchema(ArticleDetailSchema);
export const CreateArticleResponseSchema = createSuccessResponseSchema(ArticleDetailSchema);
export const UpdateArticleResponseSchema = createSuccessResponseSchema(ArticleDetailSchema);
export const DeleteArticleResponseSchema = createSuccessResponseSchema(
  Type.Object(
    {
      id: Type.String({ format: "uuid" }),
      deletedAt: Type.String({ format: "date-time" }),
    },
    { additionalProperties: false }
  )
);

export const PublicArticleListResponseSchema =
  createPaginatedSuccessResponseSchema(ArticleListItemSchema);
export const MyArticleListResponseSchema =
  createPaginatedSuccessResponseSchema(MyArticleListItemSchema);

export const ArticleErrorResponseSchema = ApiErrorResponseSchema;

export type ArticleStatus = Static<typeof ArticleStatusSchema>;
export type CreateArticleBody = Static<typeof CreateArticleBodySchema>;
export type UpdateArticleBody = Static<typeof UpdateArticleBodySchema>;
export type ArticlePathParams = Static<typeof ArticlePathParamsSchema>;
export type ArticleListQuery = Static<typeof ArticleListQuerySchema>;
export type MyArticlesQuery = Static<typeof MyArticlesQuerySchema>;
