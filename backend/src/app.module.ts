import { Module } from '@nestjs/common';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService, PrismaService], // GameService ОБЯЗАТЕЛЬНО должен быть здесь
})
export class AppModule {}