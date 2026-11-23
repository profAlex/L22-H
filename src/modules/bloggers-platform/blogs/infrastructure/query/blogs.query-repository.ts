import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
// import {FilterQuery, ObjectId} from "mongoose";
// import { type FilterQuery } from 'mongoose';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { DataSource, IsNull, Repository } from 'typeorm';
import { SQLBlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/type-orm-blog.entity';
import { BlogsSortBy } from '../../api/input-dto/blogs-sort-by';

interface RawBlogData {
    id: string;
    name: string;
    description: string;
    website_url: string;
    created_at: string | Date;
    is_membership: boolean;
}

@Injectable()
export class BlogsQueryRepository {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Blog)
        private readonly blogRepository: Repository<Blog>,
    ) {}

    // async SQLgetAllBlogs(
    //     query: GetBlogsQueryParams,
    // ): Promise<PaginatedViewDto<SQLBlogViewDto>> {
    //     // вспомонательная переменная для накопления условиий WHERE фильтрации: со старта отсекаем soft-deleted сущности
    //     const whereConditions: string[] = [`blogs.deleted_at IS NULL`];
    //
    //     // вспомогательная переменная для хранения части условий в WHERE, которые присоединяются через OR
    //     const orConditions: string[] = [];
    //
    //     // эта переменная для формирования массива параметров, который подменяет $1, $2, $3
    //     const queryParams: any[] = [];
    //
    //     // переменная для счетчика, для формирования правильной последовательной нумерации параметров $1, $2, $3
    //     let indexParamCounter: number = 1;
    //
    //     // если в запрос передано условие поиска по имени (searchNameTerm) тогда его в качестве OR составляющей надо будет добваить в запрос WHERE
    //     if (query.searchNameTerm && query.searchNameTerm.trim() !== '') {
    //         orConditions.push(`name ILIKE $${indexParamCounter}`);
    //         queryParams.push(`%${query.searchNameTerm}%`);
    //         indexParamCounter += 1;
    //     }
    //
    //     // добавляем все OR условия одним общим блоком в скобках ( ... OR ... ) к WHERE блоку
    //     if (orConditions.length > 0) {
    //         whereConditions.push(`(${orConditions.join(' OR ')})`); // хоть тут и один параметр максимум (searchNameTerm), но на случай если их количество изменится все равно делаем join
    //     }
    //
    //     // соединяем предварительное условие
    //     const whereClause = whereConditions.join(' AND ');
    //
    //     // определяем "белый список" разрешенных полей для сортировки
    //     // это защищает от SQL-инъекций, маппя camelCase из API в snake_case колонок БД
    //     // для каждого типа сущности тут будет свой набор
    //     const auxSortingMapper: Record<string, string> = {
    //         name: 'name',
    //         description: 'description',
    //         websiteUrl: 'website_url',
    //         createdAt: 'created_at',
    //         isMembership: 'is_membership',
    //     };
    //
    //     // определяем имя колонки для ORDER BY. Если передан невалидный ключ — фоллбэк на 'created_at'
    //     const sortByColumn = auxSortingMapper[query.sortBy] || 'created_at';
    //
    //     // определяем направление сортировки приводим к верхнему регистру и проверяем на ASC, иначе DESC
    //     const sortDirection =
    //         query.sortDirection && query.sortDirection.toUpperCase() === 'ASC'
    //             ? 'ASC'
    //             : 'DESC';
    //
    //     // вычисляем смещение (сколько записей пропустить: (pageNumber - 1) * pageSize)
    //     const offset = query.calculateSkip();
    //
    //     // количество элементов на странице
    //     const limit = query.pageSize;
    //
    //     // формируем SQL-запрос для получения самих элементов
    //     const itemsQuery = `
    //         SELECT
    //             id,
    //             name,
    //             description,
    //             website_url,
    //             created_at,
    //             is_membership
    //         FROM blogs
    //         WHERE ${whereClause}
    //         ORDER BY ${sortByColumn} ${sortDirection}
    //         LIMIT $${indexParamCounter}
    //         OFFSET $${indexParamCounter + 1}
    //     `;
    //
    //     // SQL-запрос для получения общего количества записей (без LIMIT/OFFSET),
    //     // чтобы рассчитать общее количество страниц.
    //     // ::int принудительно приводит bigint из Postgres к обыкновенному number в JS
    //     const countQuery = `
    //         SELECT COUNT(*) ::int AS "totalCount"
    //         FROM blogs
    //         WHERE ${whereClause}
    //     `;
    //
    //     // оба запроса можно запусить параллельно с помощью Promise.all
    //     const [blogsRows, countResult] = await Promise.all([
    //         this.dataSource.query<RawBlogData[]>(itemsQuery, [
    //             ...queryParams,
    //             limit,
    //             offset,
    //         ]),
    //         this.dataSource.query<{ totalCount: number }[]>(
    //             countQuery,
    //             queryParams,
    //         ),
    //     ]);
    //
    //     // преобразуем сырые строки из базы (snake_case) в DTO для клиентов (camelCase) и в требуемой структуре
    //     const items = blogsRows.map(SQLBlogViewDto.mapFromDbRaw);
    //     const totalCount = countResult[0]?.totalCount ?? 0;
    //
    //     return PaginatedViewDto.mapToView<SQLBlogViewDto>({
    //         items: items,
    //         page: query.pageNumber,
    //         size: query.pageSize,
    //         totalCount: totalCount,
    //     });
    // }

    async SQLgetAllBlogs(
        query: GetBlogsQueryParams,
    ): Promise<PaginatedViewDto<SQLBlogViewDto>> {
        const queryBuilder = this.blogRepository.createQueryBuilder('b');

        queryBuilder.where('b.deleted_at IS NULL');

        if (query.searchNameTerm) {
            queryBuilder.andWhere('b.name ILIKE :passedNameTerm', {
                passedNameTerm: `%${query.searchNameTerm}%`,
            });
        }

        // делаем подсчет до того как проведен .select, чтобы не сломался счет
        const totalCount = await queryBuilder.getCount();

        const allowedSortingFields: Record<BlogsSortBy, string> = {
            // ипользуем Computed Property Names - вычисляемые имена свойств
            [BlogsSortBy.CreatedAt]: 'b.created_at',
            [BlogsSortBy.Name]: 'b.name',
            [BlogsSortBy.Description]: 'b.description',
            [BlogsSortBy.WebsiteUrl]: 'b.website_url',
            [BlogsSortBy.IsMembership]: 'b.is_membership',
        };
        const sortByColumn =
            allowedSortingFields[query.sortBy] || 'b.created_at';
        const sortDirection =
            query.sortDirection && query.sortDirection.toUpperCase() === 'ASC'
                ? 'ASC'
                : 'DESC';

        queryBuilder.orderBy(sortByColumn, sortDirection);

        const skip = query.calculateSkip();
        queryBuilder.skip(skip).take(query.pageSize);

        queryBuilder.select([
            `b.id AS "id"`,
            `b.name AS "name"`,
            `b.description AS "description"`,
            `b.website_url AS "website_url"`,
            `b.created_at AS "created_at"`,
            `b.is_membership AS "is_membership"`,
        ]);

        const blogRows = await queryBuilder.getRawMany();

        const items = blogRows.map(SQLBlogViewDto.mapFromDbRaw);

        return PaginatedViewDto.mapToView<SQLBlogViewDto>({
            items: items,
            page: query.pageNumber,
            size: query.pageSize,
            totalCount: totalCount,
        });
    }

    async SQLgetBlogById(blogId: string): Promise<SQLBlogViewDto | null> {
        console.log();
        const query = `
            SELECT id,
                   name,
                   description,
                   website_url,
                   created_at,
                   is_membership
            FROM public.blogs
            WHERE id = $1
              AND deleted_at IS NULL;
        `;

        const [blogRow] = await this.dataSource.query<RawBlogData[]>(query, [
            blogId,
        ]);

        if (!blogRow) {
            return null;
        }

        return SQLBlogViewDto.mapFromDbRaw(blogRow);
    }

    // async SQLifBlogExists(blogId: string): Promise<boolean> {
    //     const query = `
    //         SELECT EXISTS (
    //             SELECT 1
    //             FROM public.blogs
    //             WHERE id = $1 AND deleted_at IS NULL
    //         ) as exists;
    //     `;
    //
    //     const [resultRow] = await this.dataSource.query<{ exists: boolean }[]>(
    //         query,
    //         [blogId],
    //     );
    //
    //     // если вдруг по какой-то причине драйвер вернет пустой массив, тогда просто nest выдаст 500
    //     // Boolean(...): Гарантирует, что метод всегда вернет строго true или false (boolean), даже если СУБД вернет 1/0 или "true"/"false"
    //     return Boolean(resultRow?.exists);
    // }

    async SQLifBlogExists(blogId: string): Promise<boolean> {
        return await this.blogRepository.exists({
            where: { id: blogId, deleted_at: IsNull() },
        });
    }
}
