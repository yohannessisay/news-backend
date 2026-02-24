import { TSchema, Type } from "@sinclair/typebox";

export type ApiErrorDetail = {
  code: string;
  details?: unknown;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  data: null;
  error: ApiErrorDetail;
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  error: null;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const ApiErrorDetailSchema = Type.Object(
  {
    code: Type.String(),
    details: Type.Optional(Type.Any()),
  },
  { additionalProperties: false }
);

export const ApiErrorResponseSchema = Type.Object(
  {
    success: Type.Literal(false),
    message: Type.String(),
    data: Type.Null(),
    error: ApiErrorDetailSchema,
  },
  { additionalProperties: false }
);

export function createSuccessResponseSchema<T extends TSchema>(data: T) {
  return Type.Object(
    {
      success: Type.Literal(true),
      message: Type.String(),
      data,
      error: Type.Null(),
    },
    { additionalProperties: false }
  );
}
