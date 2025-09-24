import { DefaultEntity } from 'src/utils/entities/default.entity';
import { Column, Entity } from 'typeorm';
@Entity('user_volume')
export class UserVolumeEntity extends DefaultEntity {
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column({ name: 'volume' })
  volume: string;

  @Column({ name: 'timestamp' })
  timestamp: number;

  @Column({ name: 'network_type' })
  networkType: number;
}
