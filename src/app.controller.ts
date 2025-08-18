import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  UseInterceptors,
  Req,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { FastifyFileInterceptor } from 'lib/interceptors/fastify-file-interceptor';
import { editFileName, imageFileFilter } from 'lib/utils/file-upload-util';
import { diskStorage } from 'multer';
import { SingleFileDto } from './products/dto/single-file-dto';
import { fileMapper } from 'lib/utils/file-mappter';

@Controller()
export class AppController {
  constructor() {}

  @ApiConsumes('multipart/form-data')
  @Post('single-file')
  @UseInterceptors(
    FastifyFileInterceptor('photo_url', {
      storage: diskStorage({
        destination: './upload/single',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  single(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SingleFileDto,
  ) {
    return { ...body, photo_url: fileMapper({ file, req }) };
  }
}
