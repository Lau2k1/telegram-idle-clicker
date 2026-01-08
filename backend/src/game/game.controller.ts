import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  // Замените на ваш реальный токен из @BotFather
  private readonly BOT_TOKEN = "8465844685:AAGnZ7rVhxpbrBiR2zW6abi7judVlyAt-oY";

  constructor(private readonly gameService: GameService) {}

  @Get('state')
  getState(@Query('userId') userId: string) {
    return this.gameService.getState(Number(userId));
  }

  @Post('click')
  click(@Query('userId') userId: string) {
    return this.gameService.click(Number(userId));
  }

  /**
   * СИНХРОНИЗАЦИЯ РЕСУРСОВ
   * Принимает накопленные за 10 секунд ресурсы с фронтенда
   */
  @Post('sync')
  sync(
    @Query('userId') userId: string, 
    @Body() body: { earnedCoins: number, earnedOil: number }
  ) {
    return this.gameService.sync(Number(userId), body.earnedCoins, body.earnedOil);
  }

  @Post('upgrade')
  upgrade(@Query('userId') userId: string, @Query('type') type: string) {
    return this.gameService.upgrade(Number(userId), type);
  }

  /**
   * СОЗДАНИЕ СЧЕТА TELEGRAM STARS
   * Генерирует ссылку для оплаты
   */
  @Post('create-boost-invoice')
  async createInvoice(@Query('userId') userId: string) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Ускорение x2",
          description: "Удваивает добычу золота и силу клика на 24 часа",
          payload: `boost_24h_${userId}`,
          currency: "XTR", // Код для Telegram Stars
          prices: [{ label: "Активация", amount: 50 }] // 50 звезд
        })
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.description);

      return { invoiceLink: data.result };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * АКТИВАЦИЯ БУСТА (ТЕСТОВАЯ)
   * Можно вызвать вручную для проверки без оплаты
   */
  @Post('activate-boost')
  activateBoost(@Query('userId') userId: string) {
    return this.gameService.activateBoost(Number(userId), 24);
  }

  /**
   * ВЕБХУК ДЛЯ ПРИЕМА ОПЛАТЫ
   * Сюда Telegram постучится сам после успешной транзакции
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() update: any) {
    const payment = update.message?.successful_payment;

    if (payment) {
      const payload = payment.invoice_payload; // "boost_24h_12345"
      const userId = Number(payload.split('_')[2]);
      const hours = Number(payload.split('_')[1].replace('h', ''));

      await this.gameService.activateBoost(userId, hours);
    }

    return { ok: true };
  }
}