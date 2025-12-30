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
    if (this.coins >= 10) {
      this.coins -= 10;
      this.clickPower += 1;
      return { success: true };
    }
    return { success: false };
  }
}
