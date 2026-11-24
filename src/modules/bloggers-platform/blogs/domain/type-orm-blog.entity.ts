import { BaseDBEntity } from '../../../../core/postgres_db_entities/baseDBEntity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { Post } from '../../posts/domain/type-orm-post.entity';
import { SQLBlog } from './sql-blog.entity';

@Entity('blogs')
export class Blog extends BaseDBEntity {
    @Column({ type: 'varchar', length: 256, nullable: false })
    name: string | null = null;

    @Column({ type: 'text', nullable: false })
    description: string | null = null;

    @Column({ type: 'varchar', length: 512, nullable: false })
    website_url: string | null = null;

    @Column({ type: 'boolean', default: false, nullable: false })
    is_membership: boolean = false;

    @OneToMany(() => Post, post => post.blog)
    posts: Post[];

    static fromDomainToEntity(domainBlog: SQLBlog): Blog {
        const entity = new Blog();

        // Если у доменной модели уже есть сгенерированный ID (например, при обновлении)
        if (domainBlog.id) {
            entity.id = domainBlog.id;
        }

        entity.name = domainBlog.name;
        entity.description = domainBlog.description;
        entity.website_url = domainBlog.websiteUrl;
        entity.is_membership = domainBlog.isMembership ?? false;

        // Даты (если они уже заданы в домене)
        if (domainBlog.createdAt) entity.created_at = new Date(domainBlog.createdAt);
        if (domainBlog.updatedAt) entity.updated_at = new Date(domainBlog.updatedAt);
        if (domainBlog.deletedAt) entity.deleted_at = new Date(domainBlog.deletedAt);

        return entity;
    }

    toDomain(): SQLBlog {
        return SQLBlog.reconstructInstance({
            id: this.id,
            name: this.name,
            description: this.description,
            websiteUrl: this.website_url,
            isMembership: this.is_membership,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
        });
    }
}

// -- auto-generated definition
// create table blogs
// (
//     id            uuid                     default gen_random_uuid() not null
// primary key,
//     name          varchar(256)                                       not null,
//     description   text                                               not null,
//     website_url   varchar(512)                                       not null,
//     is_membership boolean                  default false             not null,
//     created_at    timestamp with time zone default now()             not null,
//     updated_at    timestamp with time zone default now()             not null,
//     deleted_at    timestamp with time zone
// );
//
// alter table blogs
// owner to neondb_owner;
//
// create index idx_blogs_deleted_at
// on blogs (deleted_at)
// where (deleted_at IS NULL);