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
  constructor(private readonly uploadService: UploadService) {}

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

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: uploadsPath,
    }),
  )
  public uploadImage(
    @UploadedFile() file: UploadedFileLike | undefined,
    @Req() request: Request,
  ): UploadResponse {
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

    return {
      fileName: storedFileName,
      url: this.uploadService.buildImageUrl(request, storedFileName),
    };
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
