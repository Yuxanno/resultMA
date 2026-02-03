import { Query } from 'mongoose';

/**
 * Утилита для оптимизации MongoDB запросов
 */

/**
 * Добавляет lean() для быстрых read-only запросов
 */
export function optimizeReadQuery<T>(query: Query<T, any>): Query<T, any> {
  return query.lean() as Query<T, any>;
}

/**
 * Добавляет пагинацию к запросу
 */
export function addPagination<T>(
  query: Query<T[], any>,
  page: number = 1,
  limit: number = 10
): Query<T[], any> {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
}

/**
 * Добавляет сортировку по дате создания (новые первыми)
 */
export function sortByNewest<T>(query: Query<T[], any>): Query<T[], any> {
  return query.sort({ createdAt: -1 });
}

/**
 * Выбирает только необходимые поля (projection)
 */
export function selectFields<T>(
  query: Query<T, any>,
  fields: string[]
): Query<T, any> {
  return query.select(fields.join(' '));
}

/**
 * Комплексная оптимизация для списков
 */
export function optimizeListQuery<T>(
  query: Query<T[], any>,
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    select?: string[];
    populate?: string | string[];
  } = {}
): Query<T[], any> {
  let optimizedQuery = query.lean() as Query<T[], any>;

  // Пагинация
  if (options.page && options.limit) {
    optimizedQuery = addPagination(optimizedQuery, options.page, options.limit);
  }

  // Сортировка
  if (options.sort) {
    optimizedQuery = optimizedQuery.sort(options.sort);
  } else {
    optimizedQuery = sortByNewest(optimizedQuery);
  }

  // Выбор полей
  if (options.select) {
    optimizedQuery = selectFields(optimizedQuery, options.select);
  }

  // Populate
  if (options.populate) {
    const populates = Array.isArray(options.populate) ? options.populate : [options.populate];
    populates.forEach(pop => {
      optimizedQuery = optimizedQuery.populate(pop);
    });
  }

  return optimizedQuery;
}

/**
 * Создает агрегационный пайплайн для подсчета с фильтрацией
 */
export function createCountPipeline(filter: Record<string, any> = {}) {
  return [
    { $match: filter },
    { $count: 'total' }
  ];
}

/**
 * Создает агрегационный пайплайн для группировки и подсчета
 */
export function createGroupCountPipeline(
  groupBy: string,
  filter: Record<string, any> = {}
) {
  return [
    { $match: filter },
    {
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ];
}

/**
 * Оптимизация для поиска по тексту
 */
export function addTextSearch<T>(
  query: Query<T[], any>,
  searchText: string,
  fields: string[]
): Query<T[], any> {
  if (!searchText) return query;

  const searchRegex = new RegExp(searchText, 'i');
  const orConditions = fields.map(field => ({
    [field]: searchRegex
  }));

  return query.or(orConditions);
}

/**
 * Batch операции для массовых обновлений
 */
export async function batchUpdate<T>(
  model: any,
  updates: Array<{ filter: any; update: any }>,
  options: { ordered?: boolean } = {}
) {
  const bulkOps = updates.map(({ filter, update }) => ({
    updateOne: {
      filter,
      update,
      upsert: false
    }
  }));

  return model.bulkWrite(bulkOps, { ordered: options.ordered ?? false });
}
