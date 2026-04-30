import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [IncidentsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}