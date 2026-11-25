import { CreatePostDomainDto, SQLCreatePostDomainDto } from './dto/create-post.domain.dto';
import { SQLUpdatePostInputDto, UpdatePostInputDto } from '../dto/create-post-input.dto';

export class SQLPost {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    likesCount: number;
    dislikesCount: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    /**
     * Создание нового поста (счетчики лайков стартуют с 0)
     */
    static createInstance(dto: SQLCreatePostDomainDto): SQLPost {
        const newPost = new SQLPost();

        newPost.title = dto.title;
        newPost.shortDescription = dto.shortDescription;
        newPost.content = dto.content;
        newPost.blogId = dto.blogId;
        newPost.likesCount = 0;
        newPost.dislikesCount = 0;
        newPost.createdAt = new Date();
        newPost.updatedAt = new Date();
        newPost.deletedAt = null; // Строго null

        return newPost;
    }

    /**
     * Восстановление доменного объекта из сырой строки PostgreSQL
     */
    static reconstructInstance(raw: any): SQLPost {
        const post = new SQLPost();

        post.id = raw.id;
        post.title = raw.title;
        post.shortDescription = raw.shortDescription ?? raw.short_description;
        post.content = raw.content;
        post.blogId = raw.blogId ?? raw.blog_id;

        post.likesCount = Number(raw.likesCount ?? raw.likes_count ?? 0);
        post.dislikesCount = Number(raw.dislikesCount ?? raw.dislikes_count ?? 0);

        // Безопасно вытаскиваем даты из обоих форматов
        const rawCreatedAt = raw.createdAt ?? raw.created_at;
        const rawUpdatedAt = raw.updatedAt ?? raw.updated_at;
        const rawDeletedAt = raw.deletedAt ?? raw.deleted_at;

        post.createdAt = rawCreatedAt ? new Date(rawCreatedAt) : new Date();
        post.updatedAt = rawUpdatedAt ? new Date(rawUpdatedAt) : new Date();
        post.deletedAt = rawDeletedAt ? new Date(rawDeletedAt) : null;

        return post;
    }

    makeDeleted(): void {
        if (this.deletedAt !== null) {
            return;
        }
        this.deletedAt = new Date();
        this.updatedAt = new Date();
    }

    updatePost(dto: SQLUpdatePostInputDto): void {
        let isChanged = false;

        if (dto.title !== undefined && dto.title !== this.title) {
            this.title = dto.title;
            isChanged = true;
        }
        if (dto.shortDescription !== undefined && dto.shortDescription !== this.shortDescription) {
            this.shortDescription = dto.shortDescription;
            isChanged = true;
        }
        if (dto.content !== undefined && dto.content !== this.content) {
            this.content = dto.content;
            isChanged = true;
        }

        if (isChanged) {
            this.updatedAt = new Date();
        }
    }
}