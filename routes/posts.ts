import { createRouter } from "../lib/create-app";
import prisma from "../lib/db";
import { auth } from "../lib/auth";
import { user, moderator, admin } from "../lib/permissions";

const postRoute = createRouter();

// Helper function to get role permissions
function getRolePermissions(role: string) {
  const roleMap = {
    user: user.statements,
    moderator: moderator.statements,
    admin: admin.statements,
  };

  return roleMap[role as keyof typeof roleMap] || user.statements;
}

// Helper function to get user from session
async function getUserFromSession(c: any) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.header(),
    });
    return session?.user;
  } catch (error) {
    return null;
  }
}

// Helper function to check permissions
async function checkPermission(c: any, resource: string, action: string) {
  const userData = await getUserFromSession(c);
  if (!userData) return false;

  const role = (userData as any).role || "user";

  const userRolePermissions = getRolePermissions(role);

  const resourcePermissions =
    userRolePermissions[resource as keyof typeof userRolePermissions];
  if (!resourcePermissions) return false;

  // Convert to array and check if action is included
  const permissionsArray = Array.isArray(resourcePermissions)
    ? resourcePermissions
    : [];
  return permissionsArray.includes(action as any);
}

// Middleware for permission checking
const requirePermission = (resource: string, action: string) => {
  return async (c: any, next: any) => {
    const hasPermission = await checkPermission(c, resource, action);
    if (!hasPermission) {
      return c.json({ error: "Insufficient permissions" }, 403);
    }
    await next();
  };
};

// GET /posts - Get all posts (requires project read permission)
postRoute.get("/posts", requirePermission("post", "read"), async (c) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json(posts);
  } catch (error) {
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// GET /posts/:id - Get a specific post (requires project read permission)
postRoute.get("/posts/:id", requirePermission("post", "read"), async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({ error: "Invalid post ID" }, 400);
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json(post);
  } catch (error) {
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// POST /posts - Create a new post (requires project create permission)
postRoute.post("/posts", requirePermission("post", "create"), async (c) => {
  try {
    const body = await c.req.json();
    const { title, desc } = body;

    if (!title) {
      return c.json({ error: "Title is required" }, 400);
    }

    const post = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        title,
        desc: desc || null,
      },
    });

    return c.json(post, 201);
  } catch (error) {
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// PUT /posts/:id - Update a post (requires project update permission)
postRoute.put("/posts/:id", requirePermission("post", "update"), async (c) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({ error: "Invalid post ID" }, 400);
    }

    const body = await c.req.json();
    const { title, desc } = body;

    if (!title) {
      return c.json({ error: "Title is required" }, 400);
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        desc: desc || null,
      },
    });

    return c.json(post);
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json({ error: "Post not found" }, 404);
    }
    return c.json({ error: "Failed to update post" }, 500);
  }
});

// DELETE /posts/:id - Delete a post (requires project delete permission)
postRoute.delete(
  "/posts/:id",
  requirePermission("post", "delete"),
  async (c) => {
    try {
      const id = c.req.param("id");

      if (!id) {
        return c.json({ error: "Invalid post ID" }, 400);
      }

      await prisma.post.delete({
        where: { id },
      });

      return c.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return c.json({ error: "Post not found" }, 404);
      }
      return c.json({ error: "Failed to delete post" }, 500);
    }
  }
);

export default postRoute;
