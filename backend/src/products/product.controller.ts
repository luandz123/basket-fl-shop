import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductService } from './product.service';
import { Public } from '../auth/public.decorator';
import { AdminGuard } from '../guards/admin.guard';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // GET /products with pagination support (query: page, limit)
  @Public()
  @Get('products')
  async getProducts(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    return this.productService.findAll(pageNum, limitNum);
  }

  // GET /products/:id
  @Public()
  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }

  // POST /admin/products (admin only) with file upload
  @UseGuards(AdminGuard)
  @Post('admin/products')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  createProduct(@UploadedFile() file: any, @Body() productData: Partial<any>) {
    if (file) {
      productData.image = `/upload/${file.filename}`; // URL saved into DB
    }
    return this.productService.create(productData);
  }

  // PATCH /admin/products/:id (admin only) with file upload option
  @UseGuards(AdminGuard)
  @Patch('admin/products/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './upload',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  updateProduct(@Param('id') id: string, @UploadedFile() file: any, @Body() productData: Partial<any>) {
    if (file) {
      productData.image = `/upload/${file.filename}`;
    }
    return this.productService.update(Number(id), productData);
  }

  // DELETE /admin/products/:id (admin only)
  @UseGuards(AdminGuard)
  @Delete('admin/products/:id')
  removeProduct(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }
}
