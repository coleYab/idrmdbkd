import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class UploadService {
  public buildFileUrl(request: Request, fileName: string): string {
    return `${request.protocol}://${request.get('host')}/uploads/${fileName}`;
  }

  public buildImageUrl(request: Request, fileName: string): string {
    return `${request.protocol}://${request.get('host')}/api/v1/uploads/image/${fileName}`;
  }
}
