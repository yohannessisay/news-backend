import { foreignKey, timestamp, uuid } from "drizzle-orm/pg-core";

export function createAuditColumns() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  };
}

type AuditColumns = {
  createdBy: any;
  updatedBy: any;
};

export function createAuditUserForeignKeys(
  table: AuditColumns,
  userIdColumn: any,
  tableName: string
) {
  return [
    foreignKey({
      name: `${tableName}_created_by_users_id_fk`,
      columns: [table.createdBy],
      foreignColumns: [userIdColumn],
    }).onDelete("set null"),
    foreignKey({
      name: `${tableName}_updated_by_users_id_fk`,
      columns: [table.updatedBy],
      foreignColumns: [userIdColumn],
    }).onDelete("set null"),
  ];
}
