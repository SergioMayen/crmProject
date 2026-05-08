import { Module } from '@nestjs/common';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [InteractionsController],
  providers: [InteractionsService, DatabaseService],
})
export class InteractionsModule {}