import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';
import { createAdminToken, requireAdmin } from './auth.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const PAGE_SIZE = 10;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json());

function normalizeGraduate(graduate) {
  return {
    ...graduate,
    loan_amount: graduate.loan_amount ? Number(graduate.loan_amount) : 0,
    date_of_birth: graduate.date_of_birth ? graduate.date_of_birth.toISOString().slice(0, 10) : null,
    employment_date: graduate.employment_date ? graduate.employment_date.toISOString().slice(0, 10) : null,
    created_at: graduate.created_at?.toISOString?.() || graduate.created_at,
  };
}

function parseDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const normalized = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00.000Z`
    : value;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function generateGraduateId() {
  const year = new Date().getFullYear();
  const latestGraduate = await prisma.graduate.findFirst({
    where: {
      graduate_id: {
        startsWith: `GRD-${year}-`,
      },
    },
    orderBy: {
      graduate_id: 'desc',
    },
    select: {
      graduate_id: true,
    },
  });

  const nextNumber = latestGraduate?.graduate_id
    ? Number.parseInt(latestGraduate.graduate_id.split('-').pop() || '0', 10) + 1
    : 1;

  return `GRD-${year}-${String(nextNumber).padStart(3, '0')}`;
}

function buildGraduateData(payload) {
  return {
    first_name: payload.first_name?.trim() || '',
    last_name: payload.last_name?.trim() || '',
    email: payload.email?.trim().toLowerCase() || '',
    phone: payload.phone?.trim() || '',
    date_of_birth: parseDateInput(payload.date_of_birth),
    gender: payload.gender,
    primary_school: payload.primary_school || '',
    secondary_o_level_school: payload.secondary_o_level_school || '',
    secondary_a_level_school: payload.secondary_a_level_school || '',
    university_institution: payload.university_institution || '',
    university_program: payload.university_program || '',
    degree_level: payload.degree_level,
    university_start_year: payload.university_start_year ?? null,
    university_end_year: payload.university_end_year ?? null,
    completion_status: payload.completion_status,
    study_location: payload.study_location,
    study_country: payload.study_country || '',
    funding_type: payload.funding_type,
    sponsor_name: payload.sponsor_name || '',
    loan_amount: payload.loan_amount ?? 0,
    repayment_status: payload.repayment_status,
    employment_status: payload.employment_status,
    employer: payload.employer || '',
    job_role: payload.job_role || '',
    sector: payload.sector || '',
    work_location: payload.work_location || 'local',
    further_study_location: payload.further_study_location || 'local',
    further_study_country: payload.further_study_country || '',
    further_study_field: payload.further_study_field || '',
    further_study_graduation_year: payload.further_study_graduation_year ?? null,
    further_study_funding: payload.further_study_funding || 'self_funded',
    country_of_origin: payload.country_of_origin || '',
    country_of_residence: payload.country_of_residence || '',
    employment_date: parseDateInput(payload.employment_date),
    graduation_year: payload.graduation_year ?? null,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const matches = await bcrypt.compare(password, admin.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    res.json({
      token: createAdminToken(admin),
      user: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(503).json({ error: 'Service unavailable. Please try again.' });
  }
});

app.get('/api/auth/me', requireAdmin, async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.user.sub },
      select: { id: true, email: true, role: true },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }

    res.json({ user: admin });
  } catch (error) {
    console.error('Auth me error:', error.message);
    res.status(503).json({ error: 'Service unavailable. Please try again.' });
  }
});

app.get('/api/dashboard', requireAdmin, async (_req, res) => {
  try {
    const graduates = await prisma.graduate.findMany({ orderBy: { created_at: 'desc' } });
    res.json({ data: graduates.map(normalizeGraduate) });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(503).json({ error: 'Service unavailable. Please try again.' });
  }
});

app.get('/api/graduates', requireAdmin, async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const search = String(req.query.search || '').trim();
  const status = String(req.query.status || '').trim();
  const program = String(req.query.program || '').trim();

  const where = {
    ...(status ? { employment_status: status } : {}),
    ...(program ? { university_program: program } : {}),
    ...(search ? {
      OR: [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { graduate_id: { contains: search, mode: 'insensitive' } },
        { university_program: { contains: search, mode: 'insensitive' } },
        { employer: { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.graduate.count({ where }),
    prisma.graduate.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  res.json({
    data: rows.map(normalizeGraduate),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
});

app.get('/api/graduates/all', requireAdmin, async (_req, res) => {
  const rows = await prisma.graduate.findMany({ orderBy: { created_at: 'desc' } });
  res.json({ data: rows.map(normalizeGraduate) });
});

app.post('/api/graduates', requireAdmin, async (req, res) => {
  try {
    const data = buildGraduateData(req.body || {});
    let graduate = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        graduate = await prisma.graduate.create({
          data: {
            graduate_id: await generateGraduateId(),
            ...data,
          },
        });
        break;
      } catch (error) {
        if (error.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('graduate_id')) {
          continue;
        }
        throw error;
      }
    }

    if (!graduate) {
      return res.status(409).json({ error: 'Graduate ID conflict. Please retry.' });
    }

    res.status(201).json({ data: normalizeGraduate(graduate) });
  } catch (error) {
    console.error('Create graduate failed:', error);

    if (error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(',') : '';
      if (target.includes('email')) return res.status(409).json({ error: 'A graduate with this email address already exists.' });
      if (target.includes('phone')) return res.status(409).json({ error: 'A graduate with this phone number already exists.' });
      if (target.includes('graduate_id')) return res.status(409).json({ error: 'Graduate ID conflict. Please retry.' });
    }

    res.status(400).json({
      error: error.message || 'Failed to create graduate.',
      code: error.code || 'UNKNOWN_ERROR',
    });
  }
});

app.patch('/api/graduates/:id', requireAdmin, async (req, res) => {
  try {
    const graduate = await prisma.graduate.update({
      where: { id: req.params.id },
      data: buildGraduateData(req.body || {}),
    });

    res.json({ data: normalizeGraduate(graduate) });
  } catch (error) {
    console.error('Update graduate failed:', error);

    if (error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(',') : '';
      if (target.includes('email')) return res.status(409).json({ error: 'A graduate with this email address already exists.' });
      if (target.includes('phone')) return res.status(409).json({ error: 'A graduate with this phone number already exists.' });
    }

    res.status(400).json({
      error: error.message || 'Failed to update graduate.',
      code: error.code || 'UNKNOWN_ERROR',
    });
  }
});

app.delete('/api/graduates/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.graduate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: 'Failed to delete graduate.' });
  }
});

const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
