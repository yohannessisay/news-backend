import { TSchema, Type } from "@sinclair/typebox";

export type ApiErrorResponse = {
  Success: false;
  Message: string;
  Object: null;
  Errors: string[] | null;
};

export type ApiSuccessResponse<T> = {
  Success: true;
  Message: string;
  Object: T;
  Errors: null;
};

export const ApiErrorsSchema = Type.Union([
  Type.Array(Type.String()),
  Type.Null(),
]);

export const ApiErrorResponseSchema = Type.Object(
  {
    Success: Type.Literal(false),
    Message: Type.String(),
    Object: Type.Null(),
    Errors: ApiErrorsSchema,
  },
  { additionalProperties: false }
);

export function createSuccessResponseSchema<T extends TSchema>(data: T) {
  return Type.Object(
    {
      Success: Type.Literal(true),
      Message: Type.String(),
      Object: data,
      Errors: Type.Null(),
    },
    { additionalProperties: false }
  );
}
