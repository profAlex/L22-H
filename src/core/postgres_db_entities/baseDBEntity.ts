import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';

export abstract class BaseDBEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    // @CreateDateColumn({ type: 'timestamptz', nullable: false })
    // public created_at: Date = new Date(Date.now());

    // т.к. я использую доменную модель где создаю много полей вручную,
    // но при этом в репо использую метод save - мне в некоторых случаях
    // этот метод перезатирает поле created_at
    // ухожу от использования @CreateDateColumn
    @Column({ type: 'timestamptz', nullable: false, name: 'created_at' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: false })
    public updated_at: Date = new Date(Date.now());

    @DeleteDateColumn({type: 'timestamptz' , nullable: true})
    public deleted_at: Date | null = null;

    @VersionColumn({ type: 'int', default: 1 })
    public version: number = 1;
}