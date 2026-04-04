'use server';

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function syncUserAction(supabaseId: string, email: string, name: string | null, role: Role, joinCode?: string) {
  // Try to find the user first
  let user = await prisma.user.findUnique({
    where: { supabaseId }
  });

  if (!user) {
    // Determine institution (Since this is a multi-tenant demo, we just assign them to a default one)
    let institution = await prisma.institution.findFirst();
    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          name: 'Demo Institution',
          slug: 'demo-inst'
        }
      });
    }

    user = await prisma.user.create({
      data: {
        supabaseId,
        email,
        name,
        role,
        institutionId: institution.id
      }
    });

    if (role === 'STUDENT' && joinCode) {
      const batch = await prisma.batch.findUnique({
        where: { joinCode: joinCode.toUpperCase() }
      });
      if (batch) {
        await prisma.batchStudent.create({
          data: {
            batchId: batch.id,
            studentId: user.id
          }
        });
      }
    }
  }

  return user;
}
