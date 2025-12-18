import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CsrfMiddleware } from '../common/middleware/csrf.middleware';
import { Public } from '../common/decorators';

@ApiTags('CSRF')
@Controller('csrf')
export class CsrfController {
  private csrfMiddleware: CsrfMiddleware;

  constructor() {
    this.csrfMiddleware = new CsrfMiddleware();
  }

  @Public()
  @Get('token')
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({
    status: 200,
    description: 'CSRF token generated successfully',
    schema: {
      type: 'object',
      properties: {
        csrfToken: { type: 'string' },
      },
    },
  })
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const csrfToken = this.csrfMiddleware.generateToken(req, res);
    return res.json({ csrfToken });
  }
}
