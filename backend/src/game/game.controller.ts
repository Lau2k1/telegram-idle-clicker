import { Controller, Get, Post, Query, Body } from '@nestjs/common';
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

  @Post('upgrade')
  upgrade(@Query('userId') userId: string, @Query('type') type: string) {
    return this.gameService.upgrade(Number(userId), type);
  }

  // Эндпоинт для получения ссылки на оплату
  @Post('create-boost-invoice')
  async createInvoice(@Query('userId') userId: string) {
    // ВАЖНО: Здесь должна быть логика вызова Telegram Bot API
    // Пример ссылки для теста (в реальности вызывается bot.createInvoiceLink)
    return { invoiceLink: "https://t.me/invoice/example_stars_link" };
  }

  // Эндпоинт подтверждения (в идеале вызывается вебхуком бота)
  @Post('activate-boost')
  activateBoost(@Query('userId') userId: string) {
    return this.gameService.activateBoost(Number(userId), 24);
  }
}