import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { basename, extname, join } from 'path';

import { AuditLogService } from '../audit-log/services/audit-log.service';
import { UploadService } from './upload.service';

type UploadResponse = {
  fileName: string;
  url: string;
};

type UploadedFileLike = {
  filename: string;
  originalname: string;
  mimetype: string;
};

const uploadsPath = join(process.cwd(), 'uploads');

if (!existsSync(uploadsPath)) {
  mkdirSync(uploadsPath, { recursive: true });
}

@Controller('uploads')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: uploadsPath,
    }),
  )
  public async uploadFile(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() request: Request,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Use form-data with key "file".',
      );
    }

    const result = {
      fileName: file.filename,
      url: this.uploadService.buildFileUrl(request, file.filename),
    };
    await this.auditLogService.create(
      'CREATE',
      'Upload',
      `File uploaded: ${file.filename}`,
      0,
    );
    return result;
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: uploadsPath,
    }),
  )
  public async uploadImage(
    @UploadedFile() file: UploadedFileLike | undefined,
    @Req() request: Request,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException(
        'No image uploaded. Use form-data with key "file".',
      );
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed.');
    }

    const extension = extname(file.originalname);
    const storedFileName = extension
      ? `${file.filename}${extension}`
      : `${file.filename}.jpg`;

    renameSync(
      join(uploadsPath, file.filename),
      join(uploadsPath, storedFileName),
    );

    const result = {
      fileName: storedFileName,
      url: this.uploadService.buildImageUrl(request, storedFileName),
    };
    await this.auditLogService.create(
      'CREATE',
      'Upload',
      `Image uploaded: ${storedFileName}`,
      0,
    );
    return result;
  }

  @Get('image/:fileName')
  public getImage(
    @Param('fileName') fileName: string,
    @Res() response: Response,
  ): void {
    if (basename(fileName) !== fileName) {
      throw new BadRequestException('Invalid file name.');
    }

    const filePath = join(uploadsPath, fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Image not found.');
    }

    response.setHeader('Content-Disposition', 'inline');
    response.sendFile(filePath);
  }
}
