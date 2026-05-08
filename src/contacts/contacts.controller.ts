import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contacts.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: CreateContactDto,
  ) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Get()
  async search(@Query('search') search?: string) {
    return this.contactsService.search(search);
  }
}