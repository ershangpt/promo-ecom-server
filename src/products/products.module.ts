import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { GenderModule } from 'src/gender/gender.module';
import { Gender } from 'src/gender/entities/gender.entity';
import { BaseCategory } from 'src/base-categories/entities/base-category.entity';
import { BaseCategoriesModule } from 'src/base-categories/base-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Gender, BaseCategory]),
    CategoriesModule,
    GenderModule,
    BaseCategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
