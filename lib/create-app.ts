import { Hono } from "hono";

export function createRouter() {
  return new Hono({
    strict: false,
  });
}

export default function createApp() {
  const app = createRouter();

  return app;
}
