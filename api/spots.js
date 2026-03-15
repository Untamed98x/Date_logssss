export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DB_ID;
  if (!token || !dbId) return res.status(500).json({ error: 'Missing env vars' });

  const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ page_size: 100 })
  });

  if (!r.ok) return res.status(r.status).json({ error: await r.text() });

  const { results } = await r.json();
  const spots = results.map(page => {
    const p = page.properties;
    const t = k => p[k]?.rich_text?.[0]?.plain_text || '';
    return {
      id: page.id,
      name: p['Nama Tempat']?.title?.[0]?.plain_text || '',
      date: p['Tanggal']?.date?.start || '',
      gmaps: p['GMaps Link']?.url || '',
      lat: t('Latitude'), lng: t('Longitude'),
      story: t('Story'), kota: t('Kota'),
      mood: p['Mood']?.select?.name || '',
      rating: p['Rating']?.select?.name || '',
      tags: p['Tags']?.multi_select?.map(o => o.name) || [],
      photos: t('Foto URLs').split(',').map(s => s.trim()).filter(Boolean)
    };
  }).filter(s => s.lat && s.lng);

  res.status(200).json({ spots });
}
