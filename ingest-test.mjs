import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'node:fs';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const adminSb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// 1. bucket
const buckets = await adminSb.storage.listBuckets();
if (!buckets.data?.some(b => b.name === 'resources')) {
  const { error } = await adminSb.storage.createBucket('resources', { public: true });
  console.log('bucket create:', error ? error.message : 'created');
} else console.log('bucket exists');

const inst = await prisma.institution.findFirst({ where: { slug: 'demo-university' } });
const subject = await prisma.subject.findFirst({ where: { institutionId: inst.id } });
const topic = await prisma.topicNode.findFirst({ where: { subjectId: subject.id }, orderBy: { order: 'asc' } });

// 2. upload a real PDF
const buf = readFileSync('/home/ubuntu/wa-read/pulled/synapse-proposal/main-page_2026-05-05.pdf');
const path = `${inst.id}/${topic.id}/proposal-${Date.now()}.pdf`;
const up = await adminSb.storage.from('resources').upload(path, buf, { contentType: 'application/pdf' });
console.log('upload:', up.error ? up.error.message : 'ok ' + path, buf.length, 'bytes');
const { data: pub } = adminSb.storage.from('resources').getPublicUrl(path);
console.log('public url:', pub.publicUrl.slice(0, 90) + '…');
console.log(JSON.stringify({ institution: inst.name, subject: subject.name, topic: topic.title }));
await prisma.$disconnect();
