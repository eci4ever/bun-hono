import createApp from "../lib/create-app";
import postRoute from "../routes/posts";

const app = createApp();

const routes = [postRoute] as const;

// Root endpoint
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export default app;
