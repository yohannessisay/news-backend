import { AuthenticatedUser } from "../../shared/auth/auth.type";
import { parsePagination } from "../../shared/utils/query";
import {
  countAuthorDashboardRows,
  listAuthorDashboardRows,
} from "./author.model";
import { AuthorDashboardQuery } from "./author.type";

export class AuthorService {
  async getDashboard(author: AuthenticatedUser, query: AuthorDashboardQuery) {
    const pagination = parsePagination(query);

    const [rows, totalSize] = await Promise.all([
      listAuthorDashboardRows({
        authorId: author.id,
        pageSize: pagination.pageSize,
        offset: pagination.offset,
      }),
      countAuthorDashboardRows(author.id),
    ]);

    return {
      rows: rows.map((item) => ({
        id: item.id,
        title: item.title,
        createdAt: item.createdAt.toISOString(),
        totalViews: Number(item.totalViews),
      })),
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalSize,
    };
  }
}
