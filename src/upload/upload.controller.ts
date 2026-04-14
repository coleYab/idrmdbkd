import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { UploadService } from './upload.service';

type UploadResponse = {
  fileName: string;
  url: string;
};

const uploadsPath = join(process.cwd(), 'uploads');

if (!existsSync(uploadsPath)) {
  mkdirSync(uploadsPath, { recursive: true });
}

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Mobile usage: send multipart/form-data to POST /api/v1/uploads with key "file" (e.g. React Native: formData.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any)).
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: uploadsPath,
    }),
  )
  public uploadFile(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() request: Request,
  ): UploadResponse {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Use form-data with key "file".',
      );
    }

    return {
      fileName: file.filename,
      url: this.uploadService.buildFileUrl(request, file.filename),
    };
  }
}
