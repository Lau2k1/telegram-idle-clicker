import { Controller, Get } from "@nestjs/common";

@Controller("game")
export class GameController {
  @Get("ping")
  ping() {
    return { status: "ok" };
  }
}
