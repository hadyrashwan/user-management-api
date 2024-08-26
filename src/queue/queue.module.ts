import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as amqpConnectionManager from 'amqp-connection-manager';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RABBITMQ_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const rabbitMQUri = configService.get<string>('RABBITMQ_URI');
        const connection = amqpConnectionManager.connect([rabbitMQUri]);

        connection.on('connect', () => console.log('Connected to RabbitMQ'));
        connection.on('disconnect', (err) =>
          console.log('Disconnected from RabbitMQ', err),
        );

        return connection;
      },
      inject: [ConfigService],
    },
    {
      provide: 'RABBITMQ_CHANNEL',
      useFactory: async (
        connection: amqpConnectionManager.AmqpConnectionManager,
      ) => {
        const channelWrapper = connection.createChannel({
          json: true,
          setup: (channel) =>
            Promise.all([
              channel.assertExchange('exchange1', 'topic', { durable: true }),
              // Other setup tasks
            ]),
        });

        return channelWrapper;
      },
      inject: ['RABBITMQ_CONNECTION'],
    },
  ],
  exports: ['RABBITMQ_CONNECTION', 'RABBITMQ_CHANNEL'],
})
export class QueueModule {}
