export type RabbitMQConfig = {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  vhost?: string;
  queue?: string;
  exchange?: string;
  routingKey?: string;
};
