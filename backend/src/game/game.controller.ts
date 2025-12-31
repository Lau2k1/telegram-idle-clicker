import { Controller, Get, Post, Query, ParseIntPipe } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('state')
  async getState(@Query('userId', ParseIntPipe) userId: number) {
    const state = await this.gameService.getState(userId);
    // Превращаем BigInt в строку или число для JSON, так как JSON не знает BigInt
    return {
        ...state,
        telegramId: state.telegramId.toString()
    };
  }

  @Post('click')
  async click(@Query('userId', ParseIntPipe) userId: number) {
    const result = await this.gameService.click(userId);
    return { success: true, coins: result.coins };
  }

  @Post('buy-click')
  async buyClick(@Query('userId', ParseIntPipe) userId: number) {
    const result = await this.gameService.buyClick(userId);
    
    if (!result) {
        return { success: false, message: 'Not enough coins' };
    }

    return { 
      success: true, 
      coins: result.coins,
      clickPower: result.clickPower 
    };
  }
}