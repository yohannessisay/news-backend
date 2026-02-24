import { HealthResponseData } from "./health.type";

export class HealthService {
  getStatus(): HealthResponseData {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
    };
  }
}
