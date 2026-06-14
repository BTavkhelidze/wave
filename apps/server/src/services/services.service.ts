import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { ServiceLanguage } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor( private readonly prisma: PrismaService){}

  async create(createServiceDto: CreateServiceDto) {

    if(!createServiceDto.title) throw new Error('Title is required');
    if(!createServiceDto.description) throw new Error('Description is required');
    if(!createServiceDto.language) throw new Error('Language is required');
    if(!createServiceDto.icon) throw new Error('Icon is required');
    if(!createServiceDto.iconColor) throw new Error('Icon color is required');
  const data = {
  title: createServiceDto.title,
  description: createServiceDto.description,
  language: createServiceDto.language,
  service: {
    create: {

    
      icon: createServiceDto.icon,
      iconColor: createServiceDto.iconColor
    }
  }
  }
   
    try{

const services = await this.prisma.serviceTranslation.create({
  data: data
});      
return services;
    }catch(error){
     
      throw error;
    }
    
  }

  async findAll(language: ServiceLanguage) {
   
    try{

const services = await this.prisma.serviceTranslation.findMany({
  include: {
    
    service: {'select': {
      icon: true,
      iconColor: true,
      
    }},
    },
  
  where: {
    language: language,
  }
 
});      
return services;
    }catch(error){
     
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const service = await this.prisma.serviceTranslation.findUnique({
       where: {
          id: id
       }
});

      return service;
    } catch (error) {

      throw error;
    }
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
        try {
      const service = await this.prisma.serviceTranslation.update({
       where: {
          id: id
       },
       data: updateServiceDto
});

      return service;
    } catch (error) {
     
      throw error;
    }
  }

  async remove(id: number) {
            try {
      const service = await this.prisma.serviceTranslation.delete({
       where: {
          id: id
       }

});

      return {service, message: 'Service deleted successfully'};
    } catch (error) {

      throw error;
    }
  }
}
