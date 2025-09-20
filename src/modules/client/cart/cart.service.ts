import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
 
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Cart } from 'src/shared/entities/cart.entity';
import { CartItem } from 'src/shared/entities/cart-item.entity';
import { User } from 'src/shared/entities/user.entity';
import { Product } from 'src/shared/entities/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { Inventory } from 'src/shared/entities/inventory.entity';
 

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

    @InjectRepository(Inventory) 
    private inventRepo: Repository<Inventory>,
  ) {}

 
  
   // ✅ FIXED: Accept both string and number user IDs
   public async getOrCreateCart(userId?: string | number, guestId?: string): Promise<Cart> {
    if (userId) {
      return this.getUserCart(userId);
    }
    if (guestId) {
      return this.getGuestCart(guestId);
    }
    throw new NotFoundException('User or guest ID required');
  }
  // ✅ NEW: Get user cart (handles both string and number IDs)
  public async getUserCart(userId: string | number): Promise<Cart>  {
    // Convert to number if needed (assuming your DB uses numeric IDs)
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    if (isNaN(numericUserId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // let cart = await this.cartRepo.findOne({
    //   where: { user: { id: numericUserId }, isCheckedOut: false },
    //   relations: ['items', 'items.product', 'user']
    // });

 
    let cart = await this.cartRepo
  .createQueryBuilder('cart')
  .innerJoinAndSelect('cart.user', 'user')                // must exist
  .leftJoinAndSelect('cart.items', 'items')               // cart may be empty
  .innerJoinAndSelect('items.product', 'product')         // must exist if item exists
  .innerJoinAndSelect('product.productInventory', 'inventory')   // must exist (1:1)
  .where('cart.user_id = :userId', { userId: numericUserId })
  .andWhere('cart.isCheckedOut = false')
    .select([
      'cart.id',
      'cart.isCheckedOut',
      'items.id',
      'items.product_id',
      'items.quantity',      
      'product.id',
      'product.productTitle',
      'product.slug',
      'product.defaultImage',
      'inventory.id',
      'inventory.price',
      'inventory.discount',
      'inventory.gstSlot',
      'inventory.shippingSlot',
      'user.id',
      'user.username',
    ])
    .getOne();
    
    if (!cart) {
      const user = await this.userRepo.findOneBy({ id: numericUserId });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      cart = this.cartRepo.create({ user, items: [] });
      cart = await this.cartRepo.save(cart);
    }
   // ✅ Convert entity to DTO
   return cart;
  }

  // ✅ NEW: Get guest cart
    private async getGuestCart(guestId: string): Promise<Cart> {
      let cart = await this.cartRepo
    .createQueryBuilder('cart')
    .innerJoinAndSelect('cart.user', 'user')                // must exist
    .leftJoinAndSelect('cart.items', 'items')               // cart may be empty
    .innerJoinAndSelect('items.product', 'product')         // must exist if item exists
    .innerJoinAndSelect('product.productInventory', 'inventory')   // must exist (1:1)
    .where('cart.guestId = :guestId', { guestId: guestId })
    .andWhere('cart.isCheckedOut = false')
      .select([
        'cart.id',
        'cart.isCheckedOut',
        'items.id',
        'items.product_id',
        'items.quantity',      
        'product.id',
        'product.productTitle',
        'product.slug',
        'product.defaultImage',
        'inventory.id',
        'inventory.price',
        'inventory.discount',
        'inventory.gstSlot',
        'inventory.shippingSlot',
        'user.id',
        'user.username',
      ])
      .getOne();

      if (!cart) {
        cart = this.cartRepo.create({ guestId, items: [] });
        cart = await this.cartRepo.save(cart);
      }
     // ✅ Convert entity to DTO
     return cart;
    }

  async addToCart(
    dto: AddToCartDto,
    userId?: string | number, // ✅ Accept both string and number
    guestId?: string,
  ): Promise<Cart> {  
    const cart = await this.getOrCreateCart(userId, guestId);
      
    // ✅ Get product with inventory pricing and stock check
    const inventory = await this.inventRepo.findOne({
      where: { 
        product: { id: dto.productId },
        status: true,
         quantity: MoreThan(0) // ✅ Only available inventory
      },
      relations: ['product']
    });

    if (!inventory) {
      throw new NotFoundException('Product is not available in inventory');
    }

    // ✅ Check stock availability
   if (inventory.quantity < dto.quantity) {
      throw new BadRequestException(
        `Only ${inventory.quantity} items available in stock`
      );
    } 

    let item = cart.items.find((i) => i.product.id === dto.productId);
    
    if (item) {
      // Update existing item
      const newQuantity = item.quantity + dto.quantity;
      
      // ✅ Check if updated quantity exceeds stock
     if (newQuantity > inventory.quantity) {
        throw new BadRequestException(
          `Cannot add ${dto.quantity} items. Only ${inventory.quantity - item.quantity} more available`
        );
      } 

      item.quantity = newQuantity;
      item.updatePrices(inventory.price, inventory.discount);
      await this.cartItemRepo.save(item);
    } else {
      // Create new item
      item = this.cartItemRepo.create({
        cart,
        product: inventory.product,
        quantity: dto.quantity,
        inventoryId: inventory.id
      });
      item.updatePrices(inventory.price, inventory.discount);
      await this.cartItemRepo.save(item);
      cart.items.push(item);
    }

    await this.cartRepo.save(cart);

    // ✅ Return updated cart with relations
    const updatecart = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
    if(!updatecart){ throw new NotFoundException('cart not found')}
    return updatecart;
  }

   // ✅ FIXED: Update parameter types
   async updateItem(
    dto: UpdateCartItemDto,
    userId?: string | number,
    guestId?: string,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, guestId);
    
    const item = cart.items.find((i) => i.id === dto.itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // ✅ Get current inventory for validation
    const inventory = await this.inventRepo.findOne({
      where: { id: item.inventoryId }
    });

    if (inventory && dto.quantity > inventory.quantity) {
      throw new BadRequestException(
        `Only ${inventory.quantity} items available in stock`
      );
    } 

    item.quantity = dto.quantity;
    await this.cartItemRepo.save(item);

    const upcatecart = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
if(!upcatecart){ throw new BadRequestException('Cart Not Updated!')}
    return upcatecart;
  }

  // ✅ FIXED: Update parameter types
  async removeItem(
    itemId: number,
    userId?: string | number,
    guestId?: string,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, guestId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartItemRepo.remove(item);
    
    const carts = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
    if (!carts) throw new NotFoundException('Carts not  item not found');
    return carts;
  }
   // ✅ FIXED: Update parameter types
   async checkout(userId: string | number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // ✅ Validate stock before checkout
    for (const item of cart.items) {
      if (item.inventoryId) {
        const inventory = await this.inventRepo.findOne({
          where: { id: item.inventoryId }
        });
        
       if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${item.product.productTitle}`
          );
        } 
      }
    }

    cart.isCheckedOut = true;
    return this.cartRepo.save(cart);
  }

   // ✅ FIXED: Update parameter types
   async mergeCarts(userId: string | number, guestId: string): Promise<Cart> {
    const userCart = await this.getUserCart(userId);
    const guestCart = await this.getGuestCart(guestId);

    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(item => 
        item.product.id === guestItem.product.id
      );

      if (existingItem) {
        // ✅ Check inventory before merging quantities
        const inventory = await this.inventRepo.findOne({
          where: { id: existingItem.inventoryId }
        });

        if (inventory) {
          const newQuantity = existingItem.quantity + guestItem.quantity;
          if (newQuantity > inventory.quantity) {
            // Limit to available stock
            existingItem.quantity = inventory.quantity;
          } else {
            existingItem.quantity = newQuantity;
          }
            
          
        } else {
          existingItem.quantity += guestItem.quantity;
        }
        
        await this.cartItemRepo.save(existingItem);
      } else {
        guestItem.cart = userCart;
        userCart.items.push(guestItem);
      }
    }

    await this.cartRepo.save(userCart);
    await this.cartRepo.remove(guestCart);

    return userCart;
  }

}

