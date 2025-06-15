
import {CategoriesOnProducts} from './categoriesOnProducts.entity'


export class Category {
  categoryId: string ;
name: string ;
imagePath: string  | null;
deleted: boolean ;
products?: CategoriesOnProducts[] ;
}
