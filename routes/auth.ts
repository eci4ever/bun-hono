import { auth } from "@/lib/auth";
import { createRouter } from "@/lib/create-app";

const authRoute = createRouter();

authRoute.on(["POST", "GET"], "/auth/**", (c) => {
  console.log("Auth endpoint hit:", c.req.method, c.req.path, c.req.raw);
  return auth.handler(c.req.raw);
});

export default authRoute;
