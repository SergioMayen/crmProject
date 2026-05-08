import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interactions.dto';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  async create(@Body() createInteractionDto: CreateInteractionDto) {
    return this.interactionsService.create(createInteractionDto);
  }

  @Get('contact/:contactId')
  async findHistoryByContact(@Param('contactId') contactId: string) {
    return this.interactionsService.findHistoryByContact(contactId);
  }
}