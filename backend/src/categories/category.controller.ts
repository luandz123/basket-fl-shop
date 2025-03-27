import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('categories')
  getCategories() {
    return this.categoryService.findAll();
  }

  @Post('admin/categories')
  // @UseGuards(AdminGuard) // Uncomment when admin guard is implemented
  createCategory(@Body() categoryData: Partial<any>) {
    return this.categoryService.create(categoryData);
  }

  @Patch('admin/categories/:id')
  // @UseGuards(AdminGuard)
  updateCategory(@Param('id') id: string, @Body() categoryData: Partial<any>) {
    return this.categoryService.update(Number(id), categoryData);
  }

  @Delete('admin/categories/:id')
  // @UseGuards(AdminGuard)
  removeCategory(@Param('id') id: string) {
    return this.categoryService.remove(Number(id));
  }
}
