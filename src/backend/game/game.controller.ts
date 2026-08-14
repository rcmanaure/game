import { Controller, Post, Body, Param } from "@nestjs/common";
import { GameService } from "./game.service";

@Controller("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post(":characterId/turn")
  async playTurn(
    @Param("characterId") characterId: string,
    @Body("action") action: string,
  ) {
    return this.gameService.playTurn(characterId, action);
  }
}
