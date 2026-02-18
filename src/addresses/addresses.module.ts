import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './addresses.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository, PrismaService],
})
export class AddressesModule {}
