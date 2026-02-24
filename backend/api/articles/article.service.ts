import { AppError } from "../../shared/types/app-error";
import { AuthenticatedUser } from "../../shared/auth/auth.type";
import { normalizeOptionalString, parsePagination } from "../../shared/utils/query";
import { trackReadInBackground } from "../analytics/analytics.service";
import {
  countAuthorArticles,
  countPublicArticles,
  createArticle,
  findArticleById,
  listAuthorArticles,
  listPublicArticles,
  softDeleteAuthorArticle,
  updateAuthorArticle,
} from "./article.model";
import { ArticleListQuery, CreateArticleBody, MyArticlesQuery, UpdateArticleBody } from "./article.type";

function toBooleanString(value?: string) {
  return value === "true" || value === "1";
}

export class ArticleService {
  async create(author: AuthenticatedUser, body: CreateArticleBody) {
    const article = await createArticle({
      body,
      authorId: author.id,
    });

    if (!article) {
      throw new AppError({
        statusCode: 500,
        message: "Failed to create article",
      });
    }

    const fullArticle = await findArticleById(article.id);
    if (!fullArticle) {
      throw new AppError({
        statusCode: 500,
        message: "Failed to load created article",
      });
    }

    return {
      id: fullArticle.id,
      title: fullArticle.title,
      content: fullArticle.content,
      category: fullArticle.category,
      status: fullArticle.status,
      createdAt: fullArticle.createdAt.toISOString(),
      authorId: fullArticle.authorId,
      authorName: fullArticle.authorName,
    };
  }

  async listMine(author: AuthenticatedUser, query: MyArticlesQuery) {
    const includeDeleted = toBooleanString(query.includeDeleted);
    const pagination = parsePagination(query);

    const [rows, totalSize] = await Promise.all([
      listAuthorArticles({
        authorId: author.id,
        includeDeleted,
        pageSize: pagination.pageSize,
        offset: pagination.offset,
      }),
      countAuthorArticles(author.id, includeDeleted),
    ]);

    return {
      rows: rows.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
      })),
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalSize,
    };
  }

  async update(author: AuthenticatedUser, articleId: string, body: UpdateArticleBody) {
    if (
      body.title === undefined &&
      body.content === undefined &&
      body.category === undefined &&
      body.status === undefined
    ) {
      throw new AppError({
        statusCode: 400,
        message: "At least one field is required to update",
      });
    }

    const existingArticle = await findArticleById(articleId);
    if (!existingArticle) {
      throw new AppError({
        statusCode: 404,
        message: "Article not found",
      });
    }
    if (existingArticle.authorId !== author.id) {
      throw new AppError({
        statusCode: 403,
        message: "Forbidden",
      });
    }
    if (existingArticle.deletedAt) {
      throw new AppError({
        statusCode: 410,
        message: "News article no longer available",
      });
    }

    const updatedArticle = await updateAuthorArticle({
      id: articleId,
      authorId: author.id,
      body,
    });
    if (!updatedArticle) {
      throw new AppError({
        statusCode: 500,
        message: "Failed to update article",
      });
    }

    const article = await findArticleById(updatedArticle.id);
    if (!article) {
      throw new AppError({
        statusCode: 500,
        message: "Failed to load updated article",
      });
    }

    return {
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      status: article.status,
      createdAt: article.createdAt.toISOString(),
      authorId: article.authorId,
      authorName: article.authorName,
    };
  }

  async softDelete(author: AuthenticatedUser, articleId: string) {
    const existingArticle = await findArticleById(articleId);
    if (!existingArticle) {
      throw new AppError({
        statusCode: 404,
        message: "Article not found",
      });
    }
    if (existingArticle.authorId !== author.id) {
      throw new AppError({
        statusCode: 403,
        message: "Forbidden",
      });
    }
    if (existingArticle.deletedAt) {
      throw new AppError({
        statusCode: 410,
        message: "News article no longer available",
      });
    }

    const deleted = await softDeleteAuthorArticle(articleId, author.id);
    if (!deleted || !deleted.deletedAt) {
      throw new AppError({
        statusCode: 500,
        message: "Failed to delete article",
      });
    }

    return {
      id: deleted.id,
      deletedAt: deleted.deletedAt.toISOString(),
    };
  }

  async listPublic(query: ArticleListQuery) {
    const pagination = parsePagination(query);
    const filters: ArticleListQuery = {
      category: normalizeOptionalString(query.category),
      author: normalizeOptionalString(query.author),
      q: normalizeOptionalString(query.q),
    };

    const [rows, totalSize] = await Promise.all([
      listPublicArticles({
        filters,
        pageSize: pagination.pageSize,
        offset: pagination.offset,
      }),
      countPublicArticles(filters),
    ]);

    return {
      rows: rows.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        authorId: item.authorId,
        authorName: item.authorName,
      })),
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalSize,
    };
  }

  async getById(articleId: string, reader: AuthenticatedUser | null) {
    const article = await findArticleById(articleId);

    if (!article) {
      throw new AppError({
        statusCode: 404,
        message: "Article not found",
      });
    }

    if (article.deletedAt) {
      throw new AppError({
        statusCode: 410,
        message: "News article no longer available",
      });
    }

    if (article.status === "Draft" && reader?.id !== article.authorId) {
      throw new AppError({
        statusCode: 404,
        message: "Article not found",
      });
    }

    trackReadInBackground({
      articleId: article.id,
      readerId: reader?.id ?? null,
    });

    return {
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      status: article.status,
      createdAt: article.createdAt.toISOString(),
      authorId: article.authorId,
      authorName: article.authorName,
    };
  }
}
