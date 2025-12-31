import { Controller, Get, Post, Query, ParseIntPipe } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  // Внедряем GameService для работы с логикой и базой данных
  constructor(private readonly gameService: GameService) {}

  /**
   * Получение текущего состояния игрока.
   * Вызывается при загрузке приложения.
   * @param userId - Telegram ID пользователя
   */
  @Get('state')
  async getState(@Query('userId', ParseIntPipe) userId: number) {
    // Вызываем метод сервиса, который найдет или создаст пользователя в БД
    // и начислит пассивный доход (idle coins)
    return await this.gameService.getState(userId);
  }

  /**
   * Обработка клика по монете.
   * @param userId - Telegram ID пользователя
   */
  @Post('click')
  async click(@Query('userId', ParseIntPipe) userId: number) {
    // Сервер сам рассчитывает прибавку на основе clickPower из БД
    return await this.gameService.click(userId);
  }

  /**
   * Покупка улучшения силы клика.
   * @param userId - Telegram ID пользователя
   */
  @Post('buy-click')
  async buyClick(@Query('userId', ParseIntPipe) userId: number) {
    // Сервер проверяет баланс в БД и списывает актуальную цену (clickPower * 10)
    const result = await this.gameService.buyClick(userId);
    
    // Возвращаем результат покупки
    return { 
      success: !!result, 
      user: result 
    };
  }
}