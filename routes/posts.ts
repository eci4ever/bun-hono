// import { createRouter } from "../lib/create-app";
// import prisma from "../lib/db";

// const postRoute = createRouter();

// // GET /posts - Get all posts
// postRoute.get("/posts", async (c) => {
//   try {
//     const posts = await prisma.post.findMany({
//       orderBy: { createdAt: "desc" },
//     });
//     return c.json(posts);
//   } catch (error) {
//     return c.json({ error: "Failed to fetch posts" }, 500);
//   }
// });

// // GET /posts/:id - Get a specific post
// postRoute.get("/posts/:id", async (c) => {
//   try {
//     const id = parseInt(c.req.param("id"));

//     if (isNaN(id)) {
//       return c.json({ error: "Invalid post ID" }, 400);
//     }

//     const post = await prisma.post.findUnique({
//       where: { id },
//     });

//     if (!post) {
//       return c.json({ error: "Post not found" }, 404);
//     }

//     return c.json(post);
//   } catch (error) {
//     return c.json({ error: "Failed to fetch post" }, 500);
//   }
// });

// // POST /posts - Create a new post
// postRoute.post("/posts", async (c) => {
//   try {
//     const body = await c.req.json();
//     const { title, desc } = body;

//     if (!title) {
//       return c.json({ error: "Title is required" }, 400);
//     }

//     const post = await prisma.post.create({
//       data: {
//         title,
//         desc: desc || null,
//       },
//     });

//     return c.json(post, 201);
//   } catch (error) {
//     return c.json({ error: "Failed to create post" }, 500);
//   }
// });

// // PUT /posts/:id - Update a post
// postRoute.put("/posts/:id", async (c) => {
//   try {
//     const id = parseInt(c.req.param("id"));

//     if (isNaN(id)) {
//       return c.json({ error: "Invalid post ID" }, 400);
//     }

//     const body = await c.req.json();
//     const { title, desc } = body;

//     if (!title) {
//       return c.json({ error: "Title is required" }, 400);
//     }

//     const post = await prisma.post.update({
//       where: { id },
//       data: {
//         title,
//         desc: desc || null,
//       },
//     });

//     return c.json(post);
//   } catch (error: any) {
//     if (error.code === "P2025") {
//       return c.json({ error: "Post not found" }, 404);
//     }
//     return c.json({ error: "Failed to update post" }, 500);
//   }
// });

// // DELETE /posts/:id - Delete a post
// postRoute.delete("/posts/:id", async (c) => {
//   try {
//     const id = parseInt(c.req.param("id"));

//     if (isNaN(id)) {
//       return c.json({ error: "Invalid post ID" }, 400);
//     }

//     await prisma.post.delete({
//       where: { id },
//     });

//     return c.json({ message: "Post deleted successfully" });
//   } catch (error: any) {
//     if (error.code === "P2025") {
//       return c.json({ error: "Post not found" }, 404);
//     }
//     return c.json({ error: "Failed to delete post" }, 500);
//   }
// });

// export default postRoute;
