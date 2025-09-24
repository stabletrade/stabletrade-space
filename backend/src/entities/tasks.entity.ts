import { Column, Entity } from 'typeorm';
import { DefaultEntity } from 'src/utils/entities/default.entity';
@Entity('tasks')
export class TaskEntity extends DefaultEntity {
  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'subtype' })
  subtype: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'url' })
  url: string;

  @Column({ name: 'network_type' })
  networkType: number;
}
