import { Controller, Get, Post, Query } from '@nestjs/common';
import { GameService } from './game.service'; // [cite: 21]

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {} // Внедряем сервис [cite: 21]

  @Get('state')
  async getState(@Query('userId') userId: string) {
    // В реальном приложении ID берется из зашифрованных данных Telegram, 
    // но для начала используем ID из запроса
    return this.gameService.getState(Number(userId)); // [cite: 24]
  }

  @Post('click')
  async click(@Query('userId') userId: string) {
    await this.gameService.click(Number(userId)); // [cite: 26]
    return { success: true };
  }

  @Post('buy-click')
  async buyClick(@Query('userId') userId: string) {
    await this.gameService.buyClick(Number(userId)); // [cite: 27]
    return { success: true };
  }
}