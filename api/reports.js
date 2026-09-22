import supabase from './db-client.js';

async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const id = req.query?.id;
      if (id) {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { title, original_text, report_type, simplified_summary, findings, language } = req.body || {};
      if (!original_text || !String(original_text).trim()) {
        return res.status(400).json({ error: 'original_text is required' });
      }
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title: title || 'Untitled report',
          original_text,
          report_type: report_type || 'report',
          simplified_summary: simplified_summary || '',
          findings: findings || {},
          language: language || 'en',
        })
        .select('*')
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, title } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase
        .from('reports')
        .update({ title })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
