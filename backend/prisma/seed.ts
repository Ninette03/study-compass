import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.notification.deleteMany({});
  await prisma.flag.deleteMany({});
  await prisma.responseUpvote.deleteMany({});
  await prisma.response.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.advisorProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institution.deleteMany({});
  await prisma.tag.deleteMany({});

  // Create institutions
  const institution1 = await prisma.institution.create({
    data: {
      id: uuidv4(),
      name: 'University of Rwanda',
      country: 'Rwanda',
      website: 'https://ur.ac.rw',
      isClaimed: false,
    },
  });

  const institution2 = await prisma.institution.create({
    data: {
      id: uuidv4(),
      name: 'African Leadership University',
      country: 'Rwanda',
      website: 'https://alueducation.com',
      isClaimed: false,
    },
  });

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuidv4(),
        name: 'Computer Science',
        category: 'academic',
      },
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        name: 'Scholarships',
        category: 'admission',
      },
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        name: 'Admission Process',
        category: 'admission',
      },
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        name: 'Campus Life',
        category: 'lifestyle',
      },
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        name: 'Workload',
        category: 'academic',
      },
    }),
  ]);

  // Create sample users
  // Student user
  const student = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'student@example.com',
      password: '$2b$10$abc123...', // In real app, hash with bcryptjs
      fullName: 'Alice Student',
      role: 'STUDENT',
      emailVerified: true,
    },
  });

  await prisma.studentProfile.create({
    data: {
      id: uuidv4(),
      userId: student.id,
      educationLevel: 'undergraduate',
      countryOfResidence: 'Rwanda',
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[1].id }],
      },
    },
  });

  // Advisor user
  const advisor = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'advisor@example.com',
      password: '$2b$10$abc123...', // In real app, hash with bcryptjs
      fullName: 'Bob Advisor',
      role: 'ADVISOR',
      emailVerified: true,
    },
  });

  await prisma.advisorProfile.create({
    data: {
      id: uuidv4(),
      userId: advisor.id,
      programme: 'B.Sc Computer Science',
      yearOfEntry: 2020,
      yearOfGraduation: 2024,
      currentStatus: 'graduate',
      isVerified: true,
      credibilityScore: 100,
      totalUpvotes: 15,
      responseAcceptanceRate: 0.95,
      institutions: {
        connect: [{ id: institution1.id }],
      },
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  // Admin user
  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@example.com',
      password: '$2b$10$abc123...', // In real app, hash with bcryptjs
      fullName: 'Charlie Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Create sample question
  const question = await prisma.question.create({
    data: {
      id: uuidv4(),
      userId: student.id,
      title: 'Is Computer Science at University of Rwanda worth it?',
      body: 'I am considering studying CS at University of Rwanda. Can anyone who attended share their experience about the course difficulty, job prospects, and campus life?',
      institutionId: institution1.id,
      programme: 'B.Sc Computer Science',
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[3].id }],
      },
    },
  });

  // Create sample response
  const response = await prisma.response.create({
    data: {
      id: uuidv4(),
      questionId: question.id,
      userId: advisor.id,
      body: 'Great program! I graduated in 2024 and the curriculum is solid. The lecturers are knowledgeable and the campus infrastructure is improving.',
      yearAttended: 2024,
      programme: 'B.Sc Computer Science',
      whatWorkedWell: 'Strong CS fundamentals, good internship opportunities',
      whatCouldBeBetter: 'Some labs need better equipment updates',
      wouldRecommend: 'yes',
      sentiment: 'POSITIVE',
      sentimentConfidence: 0.95,
    },
  });

  // Create sample upvote
  await prisma.responseUpvote.create({
    data: {
      id: uuidv4(),
      responseId: response.id,
      userId: student.id,
    },
  });

  // Update response upvote count
  await prisma.response.update({
    where: { id: response.id },
    data: { upvoteCount: 1 },
  });

  // Create sample notification
  await prisma.notification.create({
    data: {
      id: uuidv4(),
      userId: advisor.id,
      type: 'MATCHED_QUESTION',
      title: 'New question matching your expertise',
      message: 'Someone asked: "Is Computer Science at University of Rwanda worth it?"',
      questionId: question.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log(`
Sample credentials:
- Student: student@example.com
- Advisor: advisor@example.com
- Admin: admin@example.com
(All with password: password123 - update in production!)
  `);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
