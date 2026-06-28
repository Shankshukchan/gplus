import { DemoRequest } from "../models/DemoRequest.js";

export function startCleanupJob() {
  const run = async () => {
    try {
      const result = await DemoRequest.deleteMany({ callStatus: "done" });
      if (result.deletedCount > 0) {
        console.log(`[Cleanup] Deleted ${result.deletedCount} done demo call(s)`);
      }
    } catch (err) {
      console.error("[Cleanup] Error:", err.message);
    }
  };

  run();

  setInterval(run, 60 * 60 * 1000);

  console.log("[Cleanup] Job started (runs every hour)");
}
