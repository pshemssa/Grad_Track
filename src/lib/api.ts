import { Graduate } from './types';
import { supabase } from './supabase';

const PAGE_SIZE = 10;

export interface PaginatedResponse {
  data: Graduate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GraduateFilters {
  page?: number;
  search?: string;
  status?: string;
  program?: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, '').trim();
}

async function ensureUniqueContactDetails(
  payload: Pick<Graduate, 'email' | 'phone'>,
  excludeId?: string
) {
  const normalizedEmail = normalizeEmail(payload.email);
  const normalizedPhone = normalizePhone(payload.phone);

  const { data, error } = await supabase
    .from('graduates')
    .select('id, email, phone')
    .or(`email.ilike.${normalizedEmail},phone.eq.${normalizedPhone}`);

  if (error) throw new Error(error.message);

  const duplicate = (data || []).find((graduate) => {
    if (excludeId && graduate.id === excludeId) return false;
    const sameEmail = normalizeEmail(graduate.email || '') === normalizedEmail;
    const samePhone = normalizePhone(graduate.phone || '') === normalizedPhone;
    return sameEmail || samePhone;
  });

  if (!duplicate) return;

  if (normalizeEmail(duplicate.email || '') === normalizedEmail) {
    throw new Error('A graduate with this email address already exists.');
  }

  if (normalizePhone(duplicate.phone || '') === normalizedPhone) {
    throw new Error('A graduate with this phone number already exists.');
  }
}

function mapWriteError(error: { message: string; code?: string } | null) {
  if (!error) return null;

  if (error.code === '23505') {
    const message = error.message.toLowerCase();
    if (message.includes('email')) return new Error('A graduate with this email address already exists.');
    if (message.includes('phone')) return new Error('A graduate with this phone number already exists.');
    return new Error('This graduate conflicts with an existing record.');
  }

  return new Error(error.message);
}

export const api = {
  getGraduates: async (filters: GraduateFilters = {}): Promise<PaginatedResponse> => {
    const page = Math.max(1, filters.page || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from('graduates').select('*', { count: 'exact' });

    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,graduate_id.ilike.%${filters.search}%,university_program.ilike.%${filters.search}%,employer.ilike.%${filters.search}%`
      );
    }
    if (filters.status) query = query.eq('employment_status', filters.status);
    if (filters.program) query = query.eq('university_program', filters.program);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE)
    };
  },

  getAllGraduates: async (): Promise<Graduate[]> => {
    const { data, error } = await supabase.from('graduates').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  createGraduate: async (payload: Omit<Graduate, 'id' | 'graduate_id' | 'created_at'>): Promise<Graduate> => {
    await ensureUniqueContactDetails(payload);

    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('graduates')
      .select('*', { count: 'exact', head: true })
      .like('graduate_id', `GRD-${year}-%`);
    const seq = String((count || 0) + 1).padStart(3, '0');
    const graduate_id = `GRD-${year}-${seq}`;

    const { data, error } = await supabase
      .from('graduates')
      .insert({ ...payload, graduate_id })
      .select()
      .single();

    const writeError = mapWriteError(error);
    if (writeError) throw writeError;
    return data;
  },

  updateGraduate: async (id: string, payload: Partial<Graduate>): Promise<Graduate> => {
    const { graduate_id, created_at, id: _id, ...body } = payload;
    const hasEmail = typeof body.email === 'string';
    const hasPhone = typeof body.phone === 'string';

    if (hasEmail || hasPhone) {
      const { data: current, error: currentError } = await supabase
        .from('graduates')
        .select('email, phone')
        .eq('id', id)
        .single();

      if (currentError) throw new Error(currentError.message);

      await ensureUniqueContactDetails({
        email: hasEmail ? body.email as string : current.email,
        phone: hasPhone ? body.phone as string : current.phone,
      } as Pick<Graduate, 'email' | 'phone'>, id);
    }

    const { data, error } = await supabase
      .from('graduates')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    const writeError = mapWriteError(error);
    if (writeError) throw writeError;
    return data;
  },

  deleteGraduate: async (id: string): Promise<void> => {
    const { error } = await supabase.from('graduates').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
