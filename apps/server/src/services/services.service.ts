import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor( private readonly prisma: PrismaService){}

  async create(createServiceDto: CreateServiceDto) {
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
      console.error('Error fetching services:', error);
      throw error;
    }
    
  }

  async findAll(language: string) {
   
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
      console.error('Error fetching services:', error);
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
      console.error('Error fetching service:', error);
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
      console.error('Error fetching service:', error);
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
      console.error('Error fetching service:', error);
      throw error;
    }
  }
}
