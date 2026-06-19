import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const projectId = '00000000-0000-0000-0000-000000000000';
  const adminEmail = 'admin@devforge.com';
  const devEmail = 'dev@devforge.com';

  // 1. Clean existing seed-related data
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    console.log('Cleared existing seeded project data.');
  } catch (error) {
    // Project might not exist yet, ignore error
  }

  try {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, devEmail] } },
    });
    console.log('Cleared existing seeded user data.');
  } catch (error) {
    // Users might not exist yet, ignore error
  }

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: adminPasswordHash,
      name: 'DevForge Admin',
      role: 'admin',
    },
  });

  const devPasswordHash = await bcrypt.hash('dev123', 10);
  const dev = await prisma.user.create({
    data: {
      email: devEmail,
      password: devPasswordHash,
      name: 'DevForge Developer',
      role: 'developer',
    },
  });

  console.log(`Seeded users: Admin (${admin.email}), Developer (${dev.email})`);

  // 3. Create Default Project linked to Admin
  const project = await prisma.project.create({
    data: {
      id: projectId,
      name: 'Default DevForge Project',
      framework: 'Next.js',
      userId: admin.id,
    },
  });

  console.log(`Seeded project: ${project.name} (${project.id}) linked to user ${admin.email}`);

  // 4. Seed environments
  const devEnv = await prisma.environment.create({
    data: {
      name: 'Development',
      variables: JSON.stringify({
        API_URL: 'http://localhost:4000',
        DB_PORT: '5433',
        NODE_ENV: 'development',
      }),
      projectId: project.id,
    },
  });

  const prodEnv = await prisma.environment.create({
    data: {
      name: 'Production',
      variables: JSON.stringify({
        API_URL: 'https://api.devforge.com',
        DB_PORT: '5432',
        NODE_ENV: 'production',
      }),
      projectId: project.id,
    },
  });

  console.log(`Seeded environments: ${devEnv.name}, ${prodEnv.name}`);

  // 5. Seed a default collection
  const collection = await prisma.collection.create({
    data: {
      name: 'JSONPlaceholder Demo',
      projectId: project.id,
    },
  });

  // 6. Seed some saved requests in the collection
  const request1 = await prisma.savedRequest.create({
    data: {
      name: 'Get All Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: JSON.stringify({
        Accept: 'application/json',
      }),
      collectionId: collection.id,
    },
  });

  const request2 = await prisma.savedRequest.create({
    data: {
      name: 'Create Test Post',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: JSON.stringify({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        title: 'DevForge Testing',
        body: 'Universal Developer OS API request works!',
        userId: 1,
      }),
      collectionId: collection.id,
    },
  });

  console.log(
    `Seeded collection "${collection.name}" with requests: "${request1.name}", "${request2.name}"`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
