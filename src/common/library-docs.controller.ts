import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

@ApiExcludeController()
@Controller('api/v1/docs/library')
export class LibraryDocsController {
  @Get()
  getLibraryDocs(@Res() res: Response) {
    res.sendStatus(404);
  }
}
