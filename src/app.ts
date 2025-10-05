import createApp from "../lib/create-app";
import authRoute from "../routes/auth";
import postRoute from "../routes/posts";
import { cors } from "hono/cors";

const app = createApp();

const routes = [authRoute, postRoute] as const;

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173", // atau '*' kalau dev
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true, // jika hantar cookie/session
  })
);

// Root endpoint
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export default app;
