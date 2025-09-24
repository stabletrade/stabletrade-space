import { KafkaOptions, Transport } from '@nestjs/microservices';

export const microserviceConfig: KafkaOptions = {
  transport: Transport.KAFKA,

  options: {
    client: {
      clientId: 'crawler',
      brokers: [
        'broker1:9092',
        'broker2:9092',
        'broker3:9092',
      ],
    },
    consumer: {
      groupId: 'auth-consumer',
      allowAutoTopicCreation: true,
    },
  },
};
