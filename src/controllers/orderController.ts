import { Request, Response } from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req: Request, res: Response) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice: reqItemsPrice,
    taxPrice: reqTaxPrice,
    shippingPrice: reqShippingPrice,
    totalPrice: reqTotalPrice,
  } = req.body;

  try {
    let finalItems = items;
    let itemsPrice = reqItemsPrice;
    let shippingPrice = reqShippingPrice;
    let taxPrice = reqTaxPrice || 0;
    let totalPrice = reqTotalPrice;

    // If no items provided, get from User's Cart
    if (!finalItems || finalItems.length === 0) {
      const cart = await Cart.findOne({ user: req.user?._id }).populate(
        "items.product"
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }

      finalItems = cart.items.map((item: any) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        price: item.price,
        image: item.product.images?.[0] || "",
      }));

      itemsPrice = cart.totalPrice;
      shippingPrice = itemsPrice > 5000 ? 0 : 60; // Example shipping logic
      totalPrice = itemsPrice + shippingPrice + taxPrice;
    }

    if (!finalItems || finalItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: req.user?._id,
      items: finalItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user?._id },
      { items: [], totalPrice: 0 }
    );

    res.status(201).json(createdOrder);
  } catch (error: any) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user?._id });
  res.json(orders);
};
