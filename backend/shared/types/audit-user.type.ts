import { Static, Type } from "@sinclair/typebox";

export const AuditUserSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    name: Type.String(),
    email: Type.String({ format: "email" }),
  },
  { additionalProperties: false }
);

export const NullableAuditUserSchema = Type.Union([AuditUserSchema, Type.Null()]);

export type AuditUser = Static<typeof AuditUserSchema>;
