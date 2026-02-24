import { Static, Type } from "@sinclair/typebox";
import {
  ApiErrorResponseSchema,
  createSuccessResponseSchema,
} from "../../shared/types/response.type";

export const HealthDataSchema = Type.Object(
  {
    status: Type.Literal("ok"),
    timestamp: Type.String({ format: "date-time" }),
    uptime: Type.Number(),
  },
  { additionalProperties: false }
);

export const HealthSuccessResponseSchema =
  createSuccessResponseSchema(HealthDataSchema);

export const HealthErrorResponseSchema = ApiErrorResponseSchema;

export type HealthResponseData = Static<typeof HealthDataSchema>;
