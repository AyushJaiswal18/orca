import cron from "node-cron";

export const runJobScheduler = () => {
  cron.schedule("0 */6 * * *", async () => {
    try {
      return true;
      
    } catch (error) {
      return false;
    }
  });

  return true;
};
