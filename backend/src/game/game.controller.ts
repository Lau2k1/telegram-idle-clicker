import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  private readonly BOT_TOKEN = "В8465844685:AAGnZ7rVhxpbrBiR2zW6abi7judVlyAt-oY";

  constructor(private readonly gameService: GameService) {}

  @Get('state')
  getState(@Query('userId') userId: string) {
    return this.gameService.getState(Number(userId));
  }

  @Post('click')
  click(@Query('userId') userId: string) {
    return this.gameService.click(Number(userId));
  }

  // ЭТОТ МЕТОД НУЖЕН ДЛЯ App.tsx
  @Post('sync')
  sync(@Query('userId') userId: string, @Body() body: { earnedCoins: number, earnedOil: number }) {
    return this.gameService.sync(Number(userId), body.earnedCoins, body.earnedOil);
  }

  @Post('upgrade')
  upgrade(@Query('userId') userId: string, @Query('type') type: string) {
    return this.gameService.upgrade(Number(userId), type);
  }

  @Post('create-boost-invoice')
  async createInvoice(@Query('userId') userId: string) {
    const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Буст x2",
        description: "Удвоение добычи на 24 часа",
        payload: `boost_24h_${userId}`,
        currency: "XTR",
        prices: [{ label: " Stars", amount: 50 }]
      })
    });
    const data = await response.json();
    return { invoiceLink: data.result };
  }

  @Post('activate-boost')
  activateBoost(@Query('userId') userId: string) {
    return this.gameService.activateBoost(Number(userId), 24);
  }
}