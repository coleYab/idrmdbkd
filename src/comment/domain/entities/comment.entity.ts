import { AggregateRoot } from '@nestjs/cqrs';

export class Comment extends AggregateRoot {
  private id: string;
  private disasterId: string;
  private authorId: string;
  private content: string;
  private attachments: string[];
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    disasterId: string,
    authorId: string,
    content: string,
    attachments: string[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.disasterId = disasterId;
    this.authorId = authorId;
    this.content = content;
    this.attachments = attachments;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getDisasterId(): string {
    return this.disasterId;
  }

  public getAuthorId(): string {
    return this.authorId;
  }

  public getContent(): string {
    return this.content;
  }

  public getAttachments(): string[] {
    return this.attachments;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public update(content: string, attachments: string[]): void {
    this.content = content;
    this.attachments = attachments;
    this.updatedAt = new Date();
  }

  public static create(
    id: string,
    disasterId: string,
    authorId: string,
    content: string,
    attachments: string[],
    createdAt: Date,
    updatedAt: Date,
  ): Comment {
    return new Comment(
      id,
      disasterId,
      authorId,
      content,
      attachments,
      createdAt,
      updatedAt,
    );
  }
}
