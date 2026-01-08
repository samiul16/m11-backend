import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  syncCartItems,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(protect, getCart).post(protect, addToCart);
router.post("/sync", protect, syncCartItems);

router
  .route("/:productId")
  .delete(protect, removeFromCart)
  .put(protect, updateCartItem);

export default router;
