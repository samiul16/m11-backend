import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: "Classic" | "Premium" | "Sport";
  images: string[];
  features: string[];
  sizes: string[];
  badge?: string;
  isActive: boolean;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Please provide product slug"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["Classic", "Premium", "Sport"],
    },
    images: {
      type: [String],
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    badge: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
ProductSchema.index({ name: "text", description: "text" });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
