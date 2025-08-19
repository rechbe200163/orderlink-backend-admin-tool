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
import { editFileName, imageFileFilter } from 'lib/utils/file-upload-util';
import { diskStorage } from 'multer';
import { SingleFileDto } from './products/dto/single-file-dto';
import { fileMapper } from 'lib/utils/file-mappter';

@Controller()
export class AppController {
  constructor() {}

  ping() {
    return 'pong';
  }
}
