import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'FastX Courier API - Production Ready Backend for Bangladesh Courier Service';
  }
}
