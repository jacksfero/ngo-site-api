import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NgoSite } from './ngo-site.entity';
import { Feature } from './feature.entity';

@Entity('site_features')
export class SiteFeature {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => NgoSite)
  @JoinColumn({ name: 'site_id' })
  site: NgoSite;

  @ManyToOne(() => Feature)
  @JoinColumn({ name: 'feature_id' })
  feature: Feature;
}