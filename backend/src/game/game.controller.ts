import { Controller, Get, Post, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('state')
  getState(@Query('userId') userId: string) {
    return this.gameService.getState(Number(userId));
  }

  @Post('click')
  click(@Query('userId') userId: string) {
    return this.gameService.click(Number(userId));
  }

  @Post('buy-click')
  buyClick(@Query('userId') userId: string) {
    return this.gameService.buyClick(Number(userId));
  }

  // НОВЫЙ ЭНДПОИНТ
  @Get('leaderboard')
  getLeaderboard() {
    return this.gameService.getLeaderboard();
  }
}