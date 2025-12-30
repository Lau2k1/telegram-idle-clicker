import { Controller, Get, Post, Headers } from "@nestjs/common";
import { GameService } from "./game.service";

/**
 * DEV + PROD safe userId extractor
 */
function getUserId(initData?: string): number {
  // 🟢 DEV режим — если открыто не из Telegram
  if (!initData || initData.trim().length === 0) {
    return 1;
  }

  try {
    const params = new URLSearchParams(initData);
    const userRaw = params.get("user");

    if (!userRaw) {
      return 1;
    }

    const user = JSON.parse(userRaw);

    if (!user || typeof user.id !== "number") {
      return 1;
    }

    return user.id;
  } catch (e) {
    console.error("initData parse error", e);
    return 1;
  }
}

@Controller("game")
export class GameController {
  constructor(private readonly game: GameService) {}

  @Get("state")
  getState(@Headers("x-telegram-initdata") initData?: string) {
    const userId = getUserId(initData);
    return this.game.getState(userId);
  }

  @Post("click")
  click(@Headers("x-telegram-initdata") initData?: string) {
    const userId = getUserId(initData);
    this.game.click(userId);
    return { ok: true };
  }

  @Post("buy-click")
  buy(@Headers("x-telegram-initdata") initData?: string) {
    const userId = getUserId(initData);
    this.game.buyClick(userId);
    return { ok: true };
  }
}
