import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  courses: mongoose.Types.ObjectId[]; // Array of course IDs
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  { timestamps: true },
);

const CategoryModel: Model<ICategory> = mongoose.model(
  'Category',
  categorySchema,
);

export default CategoryModel;
