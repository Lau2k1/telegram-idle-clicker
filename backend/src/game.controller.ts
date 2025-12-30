// backend/src/game.controller.ts
import { Controller, Get, Post } from '@nestjs/common';

@Controller()
export class GameController {
  private state = {
    coins: 0,
    clickPower: 1,
    incomePerSec: 0,
  };

  @Get('state')
  getState() {
    return this.state;
  }

  @Post('click')
  click() {
    this.state.coins += this.state.clickPower;
    return this.state;
  }

  @Post('buy-click')
  buyClick() {
    if (this.state.coins >= 10) {
      this.state.coins -= 10;
      this.state.clickPower += 1;
    }
    return this.state;
  }
}
