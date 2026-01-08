import { Request, Response } from "express";
import Cart from "../models/Cart.js";

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: req.user?._id }).populate(
    "items.product"
  );

  if (cart) {
    res.json(cart);
  } else {
    res.json({ user: req.user?._id, items: [], totalPrice: 0 });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req: Request, res: Response) => {
  const { product, quantity, selectedSize, price } = req.body;

  let cart = await Cart.findOne({ user: req.user?._id });

  if (cart) {
    // Check if item already exists
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product, quantity, selectedSize, price });
    }
    await cart.save();
  } else {
    cart = await Cart.create({
      user: req.user?._id,
      items: [{ product, quantity, selectedSize, price }],
    });
  }

  res.status(201).json(cart);
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: req.user?._id });

  if (cart) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();
    res.json(cart);
  } else {
    res.status(404).json({ message: "Cart not found" });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req: Request, res: Response) => {
  const { quantity, selectedSize } = req.body;
  const cart = await Cart.findOne({ user: req.user?._id });

  if (cart) {
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === req.params.productId &&
        item.selectedSize === selectedSize
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } else {
    res.status(404).json({ message: "Cart not found" });
  }
};

// @desc    Sync guest cart to user cart
// @route   POST /api/cart/sync
// @access  Private
export const syncCartItems = async (req: Request, res: Response) => {
  const { items } = req.body; // Array of { product, quantity, selectedSize, price }
  const userId = req.user?._id;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Merging logic: Add guest items to user cart
  for (const item of items) {
    const existingIndex = cart.items.findIndex(
      (i) =>
        i.product.toString() === item.product &&
        i.selectedSize === item.selectedSize
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
  }

  await cart.save();
  const populatedCart = await cart.populate("items.product");
  res.json(populatedCart);
};
