import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projectId = '00000000-0000-0000-0000-000000000000';

  // 1. Clean existing seed-related data to avoid duplicate key errors on multiple runs
  // Note: onDelete: Cascade will clean up dependent collections, saved requests, history, and environments.
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    console.log('Cleared existing seeded project data.');
  } catch (error) {
    // Project might not exist yet, ignore error
  }

  // 2. Upsert default project
  const project = await prisma.project.create({
    data: {
      id: projectId,
      name: 'Default DevForge Project',
      framework: 'Next.js',
    },
  });

  console.log(`Seeded project: ${project.name} (${project.id})`);

  // 3. Seed environments
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

  // 4. Seed a default collection
  const collection = await prisma.collection.create({
    data: {
      name: 'JSONPlaceholder Demo',
      projectId: project.id,
    },
  });

  // 5. Seed some saved requests in the collection
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
