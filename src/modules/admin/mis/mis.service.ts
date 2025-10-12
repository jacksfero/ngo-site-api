import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DateRangeDto } from './dtos/date-range.dto';
import { Product } from 'src/shared/entities/product.entity';
import { User } from 'src/shared/entities/user.entity';
import { ContactUs } from 'src/shared/entities/contactus.entity';
import { Order } from 'src/shared/entities/order.entity';
import { CacheService } from 'src/core/cache/cache.service';
 

@Injectable()
export class MisService {
  constructor(
    private readonly cacheService: CacheService,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(ContactUs)
    private readonly contactRepo: Repository<ContactUs>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}
 

async getSummary(dateRange: DateRangeDto) {
  const { startDate, endDate } = dateRange;
  const cacheKey = `Admin:mis:summary:${startDate || 'all'}:${endDate || 'all'}`;

  // ✅ Check cache
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached;

  // ✅ Convert strings to Date (if provided)
  let whereCondition: any = {};
  if (startDate && endDate) {
    whereCondition = { createdAt: Between(new Date(startDate), new Date(endDate)) };
  }

  // ✅ Query counts
  const [totalProducts, totalUsers, totalContacts, totalOrders] = await Promise.all([
    this.productRepo.count({ where: whereCondition }),
    this.userRepo.count({ where: whereCondition }),
    this.contactRepo.count({ where: whereCondition }),
    this.orderRepo.count({ where: whereCondition }),
  ]);

  // ✅ Query total sales
  const totalSales = await this.orderRepo
    .createQueryBuilder('order')
    .select('SUM(order.totalAmount)', 'total')
    .where(startDate && endDate ? 'order.createdAt BETWEEN :start AND :end' : '1=1', {
      start: startDate ? new Date(startDate) : undefined,
      end: endDate ? new Date(endDate) : undefined,
    })
    .getRawOne();

  const result = {
    totalProducts,
    totalUsers,
    totalContacts,
    totalOrders,
    totalSales: totalSales?.total || 0,
    dateRange: { startDate, endDate },
  };

  // ✅ Cache for 15 min
  await this.cacheService.set(cacheKey, result, { ttl: 900 });

  return result;
}




  async getProductStats() {
    const topProducts = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select(['category.name AS category', 'COUNT(product.id) AS total'])
      .groupBy('category.name')
      .orderBy('total', 'DESC')
      .getRawMany();

    return { topProducts };
  }
}
