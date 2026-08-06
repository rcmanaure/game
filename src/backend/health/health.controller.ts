import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

// Proves the Postgres connection actually works end-to-end (not just that
// the app booted) — the concrete thing T3/T4/T7 need before they can trust
// this scaffold.
@Controller("health")
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    try {
      await this.dataSource.query("SELECT 1");
      return { status: "ok", database: "connected" };
    } catch (err) {
      throw new ServiceUnavailableException({
        status: "error",
        database: "unreachable",
        message: (err as Error).message,
      });
    }
  }
}
