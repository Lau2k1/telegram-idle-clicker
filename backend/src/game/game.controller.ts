import { Controller, Get, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
  private coins = 0;
  private clickPower = 1;

  @Get('state')
  getState() {
    return {
      coins: this.coins,
      clickPower: this.clickPower,
      incomePerSec: 1,
      lastUpdate: Date.now(),
    };
  }

  @Post('click')
  click() {
    this.coins += this.clickPower;
    return { success: true };
  }

 @Post('buy-click')
buyClick() {
  // Вместо ручной проверки coins >= 10, используем сервис
  // Примечание: сейчас контроллер использует локальные переменные, 
  // но для работы с БД или сложной логикой нужно вызвать сервис.
  
  const price = this.clickPower * 10; // Динамический расчет цены
  if (this.coins >= price) {
    this.coins -= price;
    this.clickPower += 1;
    return { success: true, price };
  }
  return { success: false };
}
}
