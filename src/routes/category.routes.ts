import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  addCategoryToCourse,
  getAllCategories,
} from '../controller/category.controller';

const router = Router();

router.post('/', createCategory);
router.delete('/:categoryId', deleteCategory);
router.post('/add-to-course', addCategoryToCourse);
router.get('/', getAllCategories);

export default router;
