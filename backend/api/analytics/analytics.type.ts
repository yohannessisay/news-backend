import { Static, Type } from "@sinclair/typebox";
import {
  ApiErrorResponseSchema,
  createSuccessResponseSchema,
} from "../../shared/types/response.type";

export const ProcessAnalyticsBodySchema = Type.Object(
  {
    date: Type.Optional(Type.String({ format: "date" })),
  },
  { additionalProperties: false }
);

export const ProcessAnalyticsResponseDataSchema = Type.Object(
  {
    date: Type.String({ format: "date" }),
    enqueued: Type.Number(),
  },
  { additionalProperties: false }
);

export const ProcessAnalyticsSuccessResponseSchema = createSuccessResponseSchema(
  ProcessAnalyticsResponseDataSchema
);
export const ProcessAnalyticsErrorResponseSchema = ApiErrorResponseSchema;

export type ProcessAnalyticsBody = Static<typeof ProcessAnalyticsBodySchema>;
