import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Gender } from 'src/gender/entities/gender.entity';
import { FilterProductMappingDto } from './dto/filter-product-mapping.dto';
import { BaseCategory } from 'src/base-categories/entities/base-category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
    @InjectRepository(BaseCategory)
    private baseCategoryRepository: Repository<BaseCategory>,
  ) {}
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { title, alias, description, price, categoryIds, genderIds } =
      createProductDto;

    // Fetch categories by IDs
    const categories = await this.categoryRepository.findByIds(categoryIds);

    // Check if all requested categories exist
    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('One or more categories not found');
    }

    // Fetch categories by IDs
    const genders = await this.genderRepository.findByIds(genderIds);

    // Check if all requested categories exist
    if (genders.length !== genderIds.length) {
      throw new BadRequestException('One or more categories not found');
    }

    // Create product instance and assign categories
    const product = new Product();
    product.title = title;
    product.alias = alias;
    product.description = description;
    product.price = price;
    product.categories = categories;
    product.genders = genders;

    return await this.productRepository.save(product);
  }

  findAll() {
    return this.productRepository.find();
  }

  findOne(id: number) {
    return this.productRepository.findOneBy({ id });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const user = await this.productRepository.findOneBy({ id });
    return this.productRepository.save({ ...user, ...updateProductDto });
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.productRepository.remove(user);
  }

  async findByFilters(filter: FilterProductMappingDto): Promise<Product[]> {
    const { categoryId, genderId, baseCategoryId } = { ...filter };
    let baseCategoryArr = [];
    if (baseCategoryId) {
      // Retrieve the base category
      const baseCategory = await this.baseCategoryRepository.findOne({
        where: {
          id: baseCategoryId,
        },
        relations: ['categories'],
      });

      baseCategoryArr = baseCategory
        ? baseCategory.categories.map((cat) => cat.id)
        : [];
    }

    const queryBuilder: SelectQueryBuilder<Product> = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.genders', 'gender');

    if (baseCategoryArr.length) {
      queryBuilder.andWhereInIds(baseCategoryArr);
    } else if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (genderId) {
      queryBuilder.andWhere('gender.id = :genderId', { genderId });
    }

    return await queryBuilder.getMany();
  }
}
