import createApp from "../lib/create-app";
import authRoute from "../routes/auth";
// import postRoute from "../routes/posts";

const app = createApp();

const routes = [authRoute] as const;

// Root endpoint
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

export default app;
