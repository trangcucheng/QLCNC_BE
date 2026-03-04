import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  TEXTAREA = 'textarea'
}

@Entity('OrganizationFieldSchema')
export class OrganizationFieldSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  fieldKey: string;

  @Column()
  fieldName: string;

  @Column({
    type: 'enum',
    enum: FieldType,
    default: FieldType.TEXT
  })
  fieldType: FieldType;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  fieldOptions: any;

  @Column({ nullable: true })
  defaultValue: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
