import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module'; // Добавьте импорт модуля

@Module({
  imports: [GameModule], // Импортируйте GameModule здесь
  controllers: [],       // Контроллеры теперь будут подтягиваться из GameModule
  providers: [],
})
export class AppModule {}