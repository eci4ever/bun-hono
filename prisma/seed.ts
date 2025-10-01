import { auth } from "@/lib/auth"; // Your better-auth instance

async function seedUsersWithAuth() {
  console.log("🌱 Seeding users with Better Auth...");

  const users = [
    {
      email: "nmfairus@gmail.com",
      password: "P@ssw0rd",
      name: "Student User",
      role: "user",
    },
    {
      email: "teacher@example.com",
      password: "password123",
      name: "Teacher User",
      role: "manager",
    },
    {
      email: "admin@example.com",
      password: "password123",
      name: "Admin User",
      role: "admin",
    },
  ];

  try {
    for (const userData of users) {
      try {
        // Use better-auth's internal methods
        const result = await auth.api.signUpEmail({
          body: {
            email: userData.email,
            password: userData.password,
            name: userData.name,

            // Add custom fields if supported
          },
        });

        console.log(`✅ Created user: ${userData.email}`);
      } catch (error: any) {
        if (error.message?.includes("already exists")) {
          console.log(`⏭️  User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating ${userData.email}:`, error);
        }
      }
    }

    console.log("✅ Seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

seedUsersWithAuth()
  .then(() => {
    console.log("🎉 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed script failed:", error);
    process.exit(1);
  });
