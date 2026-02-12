import dotenv from "dotenv";
dotenv.config();

import pino, { type Logger } from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const createLogger = (serviceName: string): Logger => {
  const transport = isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
          messageFormat: `[${serviceName}] {msg}`,
        },
      }
    : undefined;

  return pino(
    {
      level: process.env.LOG_LEVEL || "info",
      base: { service: serviceName },
      ...(isDev && { transport }),
    },
    pino.destination(1)
  );
};

export type { Logger };