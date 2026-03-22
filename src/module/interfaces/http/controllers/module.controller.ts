import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { CreateModuleDto } from '../../../application/dto/create-module.dto';
import { CreateModuleUseCase } from '../../../application/use-cases/create-module/create-module.use-case';
import { Module } from '../../../domain/entities/module.entity';
import {
  MODULE_REPOSITORY,
  ModuleRepository,
} from '../../../domain/repositories/module.repository';

@Controller('modules')
export class ModuleController {
  constructor(
    private readonly createModuleUseCase: CreateModuleUseCase,
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepository: ModuleRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreateModuleDto): Promise<Module> {
    return this.createModuleUseCase.execute(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new Error('Module not found');
    }
    return module;
  }

  @Get()
  async findAll(): Promise<Module[]> {
    // TODO: Implement findAll use case
    throw new Error('Not implemented');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Module): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new Error('Module not found');
    }

    await this.moduleRepository.update(dto);
    return module;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.moduleRepository.delete(id);
  }
}
