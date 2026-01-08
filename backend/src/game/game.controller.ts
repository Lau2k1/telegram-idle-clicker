import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  // Замените на токен вашего бота из @BotFather
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

  @Post('upgrade')
  upgrade(@Query('userId') userId: string, @Query('type') type: string) {
    return this.gameService.upgrade(Number(userId), type);
  }

  /**
   * 1. СОЗДАНИЕ СЧЕТА (ИНВОЙСА)
   * Вызывается фронтендом, когда игрок жмет кнопку "50 Stars"
   */
  @Post('create-boost-invoice')
  async createInvoice(@Query('userId') userId: string) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Буст x2 Золото",
          description: "Удвоение добычи и кликов на 24 часа",
          payload: `boost_24h_${userId}`, // Информация, которая вернется в вебхуке
          currency: "XTR", // Код валюты Telegram Stars
          prices: [{ label: "Буст 24ч", amount: 50 }] // Цена в Stars
        })
      });

      const data = await response.json();
      
      if (!data.ok) {
        console.error("Ошибка Telegram API:", data);
        return { error: "Не удалось создать счет" };
      }

      return { invoiceLink: data.result };
    } catch (error) {
      console.error("Invoice Error:", error);
      return { error: "Ошибка сервера при создании счета" };
    }
  }

  /**
   * 2. ВЕБХУК ДЛЯ ПРИЕМА ОПЛАТЫ
   * Сюда Telegram присылает данные, когда оплата прошла успешно
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() update: any) {
    // Проверяем наличие успешной оплаты в сообщении
    const successfulPayment = update.message?.successful_payment;

    if (successfulPayment) {
      const payload = successfulPayment.invoice_payload; // "boost_24h_12345"
      const parts = payload.split('_');
      
      if (parts[0] === 'boost') {
        const hours = Number(parts[1].replace('h', '')); // 24
        const userId = Number(parts[2]); // 12345

        // Активируем буст в базе данных через сервис
        await this.gameService.activateBoost(userId, hours);
        
        console.log(`[PAYMENT] Буст на ${hours}ч активирован для ${userId}`);
      }
    }

    // Всегда возвращаем 200 OK, чтобы Telegram не слал уведомление повторно
    return { ok: true };
  }

  // Эндпоинт для ручной проверки/теста (опционально)
  @Post('activate-boost-test')
  async testBoost(@Query('userId') userId: string) {
    return this.gameService.activateBoost(Number(userId), 24);
  }
}