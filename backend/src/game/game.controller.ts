import { Controller, Get, Post, Query, Body } from "@nestjs/common";
import { GameService } from "./game.service";

@Controller("game")
export class GameController {
  // URL бэкенда на Railway
  private readonly BACKEND_URL = "https://successful-enchantment-production.up.railway.app";

  constructor(private readonly gameService: GameService) {}

  @Get("state")
  getState(@Query("userId") userId: string) {
    return this.gameService.getState(Number(userId));
  }

  @Post("click")
  click(@Query("userId") userId: string) {
    return this.gameService.click(Number(userId));
  }

  // ЭТОТ МЕТОД НУЖЕН ДЛЯ App.tsx
  @Post("sync")
  sync(
    @Query("userId") userId: string,
    @Body() body: { earnedCoins: number; earnedOil: number }
  ) {
    return this.gameService.sync(
      Number(userId),
      body.earnedCoins,
      body.earnedOil
    );
  }

  @Post("upgrade")
  upgrade(@Query("userId") userId: string, @Query("type") type: string) {
    return this.gameService.upgrade(Number(userId), type);
  }

  @Post("create-invoice")
  async createInvoice(
    @Query("userId") userId: string,
    @Query("itemId") itemId?: string
  ) {
    return this.gameService.createInvoiceLink(userId, itemId);
  }

  @Post("use-item")
  async useItem(
    @Query("userId") userId: string,
    @Query("itemId") itemId: string
  ) {
    return this.gameService.useItem(Number(userId), itemId);
  }

  @Post("activate-boost")
  activateBoost(@Query("userId") userId: string) {
    return this.gameService.activateBoost(Number(userId), 24);
  }

  @Get("leaderboard")
  getLeaderboard() {
    return this.gameService.getLeaderboard();
  }

  @Post("start-refining")
  async startRefining(
    @Query("userId") userId: string,
    @Query("type") type: string,
    @Query("amount") amount: string
  ) {
    return this.gameService.startRefining(
      Number(userId),
      type,
      parseInt(amount)
    );
  }

  // --- WEBHOOK ENDPOINTS ---

  @Post("webhook")
  async webhook(@Body() update: any) {
    return this.gameService.handleWebhook(update);
  }

  @Get("set-webhook")
  async setWebhook() {
    return this.gameService.setWebhook(this.BACKEND_URL);
  }
}
