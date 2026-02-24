import { Static, Type } from "@sinclair/typebox";
import {
  ApiErrorResponseSchema,
  createPaginatedSuccessResponseSchema,
} from "../../shared/types/response.type";

export const AuthorDashboardQuerySchema = Type.Object(
  {
    pageNumber: Type.Optional(Type.String()),
    pageSize: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

export const AuthorDashboardItemSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    title: Type.String(),
    createdAt: Type.String({ format: "date-time" }),
    totalViews: Type.Number(),
  },
  { additionalProperties: false }
);

export const AuthorDashboardSuccessResponseSchema =
  createPaginatedSuccessResponseSchema(AuthorDashboardItemSchema);
export const AuthorDashboardErrorResponseSchema = ApiErrorResponseSchema;

export type AuthorDashboardQuery = Static<typeof AuthorDashboardQuerySchema>;
