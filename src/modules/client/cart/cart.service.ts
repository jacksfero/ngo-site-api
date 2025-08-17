import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { User } from 'src/shared/entities/user.entity';
import { Product } from 'src/shared/entities/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
 
  constructor(
    @InjectRepository(Cart) 
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem) 
    private cartItemRepo: Repository<CartItem>,

    @InjectRepository(User) 
    private userRepo: Repository<User>,

    @InjectRepository(Product) 
    private productRepo: Repository<Product>,
  ) {}

 
  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId }, isCheckedOut: false },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      const user = await this.userRepo.findOneBy({ id: userId });
       
      cart = this.cartRepo.create({ 
        user: { id: userId }, // Just pass the ID instead of full user object
        items: [] 
      });
 
      cart = await this.cartRepo.save(cart);

       // Ensure we have the full cart with relations
    cart = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
    
    if (!cart) {
      throw new Error('Failed to create cart');
    }
    }

    return cart;
  }

  async addToCart(userId: number, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    if (!cart) throw new NotFoundException('Cart not found');
    
    const product = await this.productRepo.findOneBy({ id: dto.productId });
    if (!product) throw new NotFoundException('Product not found');

    let item = cart.items.find((i) => i.product.id === dto.productId);

    if (item) {
      item.quantity += dto.quantity;
      await this.cartItemRepo.save(item);
    } else {
      item = this.cartItemRepo.create({ 
        cart, 
        product, 
        quantity: dto.quantity 
      });
      await this.cartItemRepo.save(item);
      cart.items.push(item);
    }

    // Add null check for the returned cart
    const updatedCart = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    if (!updatedCart) {
      throw new NotFoundException('Cart not found after update');
    }

    return updatedCart;
}

  async updateItem(userId: number, dto: UpdateCartItemDto): Promise<Cart> {
   // Get or create cart (with proper null checking)
    const cart = await this.getOrCreateCart(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
     // Find the item to update
    const item = cart.items.find((i) => i.id === dto.itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

     // Update and save the item
    item.quantity = dto.quantity;
    await this.cartItemRepo.save(item);

  const  updatedCart = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    if (!updatedCart) {
      throw new NotFoundException('updatedCart not found after update');
    }

    return updatedCart;
  }

  async removeItem(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartItemRepo.remove(item);

   const updatedCart = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });

    if (!updatedCart) {
      throw new NotFoundException('Cart not found after update');
    }

    return updatedCart;
  }

  async checkout(userId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    cart.isCheckedOut = true;
    return this.cartRepo.save(cart);
  }
 
/*
  
  async updateCartItem(userId: number, itemId: number, quantity: number) {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user'],
    });
    if (!item || item.cart.user.id !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    item.quantity = quantity;
    return this.cartItemRepo.save(item);
  }
  
  async removeCartItem(userId: number, itemId: number) {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user'],
    });
    if (!item || item.cart.user.id !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    return this.cartItemRepo.remove(item);
  }
  
  async getCart(userId: number) {
    return this.cartRepo.findOne({
      where: { user: { id: userId }, isCheckedOut: false },
      relations: ['items', 'items.product'],
    });
  }



*/

}
