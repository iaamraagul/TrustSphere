import { Request, Response } from "express";

export const getSystemHealth = (req: Request, res: Response) => {
  const randomLatency = Math.floor(Math.random() * 300) + 50;

  const randomCpu = Math.floor(Math.random() * 40) + 20;

  const randomMemory = Math.floor(Math.random() * 50) + 30;

  res.json({
    apiStatus: "HEALTHY",
    latency: `${randomLatency}ms`,
    cpuUsage: `${randomCpu}%`,
    memoryUsage: `${randomMemory}%`,
    timestamp: new Date(),
  });
};
