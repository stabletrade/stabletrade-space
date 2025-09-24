import { Column, Entity } from 'typeorm';
import { DefaultEntity } from 'src/utils/entities/default.entity';
@Entity('reward')
export class RewardEntity extends DefaultEntity {
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column({ name: 'point' })
  point: number;

  @Column({ name: 'timestamp' })
  timestamp: number;

  @Column({ name: 'total_reward' })
  totalReward: number;

  @Column({ name: 'reward' })
  reward: number;

  @Column({ name: 'tx_hash' })
  txHash: string;

  @Column({ name: 'reward_type' })
  rewardType: number;

  @Column({ name: 'status' })
  status: number;

  @Column({ name: 'network_type' })
  networkType: number;
}
