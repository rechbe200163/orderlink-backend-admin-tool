import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { OnboardingsService } from './onboardings.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Controller('onboardings')
export class OnboardingsController {
  constructor(private readonly onboardingsService: OnboardingsService) {}

  @Post()
  @ApiBody({ type: CreateOnboardingDto })
  create(@Body() createOnboardingDto: CreateOnboardingDto) {
    return this.onboardingsService.create(createOnboardingDto);
  }

  @Get()
  findAll() {
    return this.onboardingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onboardingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOnboardingDto: UpdateOnboardingDto) {
    return this.onboardingsService.update(+id, updateOnboardingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onboardingsService.remove(+id);
  }
}
