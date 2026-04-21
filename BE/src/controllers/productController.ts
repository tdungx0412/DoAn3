import { Request, Response } from 'express';
import { ProductModel, IProduct } from '../models/Product';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const products = await ProductModel.findAll(req.query);
      res.json({ success: true, data: products, total: products.length });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const product = await ProductModel.findById(Number(req.params.id));
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const product: IProduct = req.body;
      const newProduct = await ProductModel.create(product);
      res.status(201).json({ success: true, data: newProduct, message: 'Product created' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const updated = await ProductModel.update(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, data: updated, message: 'Product updated' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const deleted = await ProductModel.delete(Number(req.params.id));
      if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
}