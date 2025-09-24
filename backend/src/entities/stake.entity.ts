import { Column, Entity } from 'typeorm';
import { DefaultEntity } from 'src/utils/entities/default.entity';
@Entity('stake')
export class StakeEntity extends DefaultEntity {
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column({ name: 'timestamp' })
  timestamp: number;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'tx_hash' })
  txHash: string;

  @Column({ name: 'type' })
  type: number;

  @Column({ name: 'status' })
  status: number;

  @Column({ name: 'time_claim' })
  timeClaim: number;

  @Column({ name: 'network_type' })
  networkType: number;
}
