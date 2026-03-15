export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DB_ID;

  if (!token || !dbId) {
    return res.status(500).json({ error: 'Missing NOTION_TOKEN or NOTION_DB_ID env vars' });
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ page_size: 100, sorts: [{ property: 'Tanggal', direction: 'descending' }] }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    // Parse Notion results into clean spot objects
    const spots = data.results.map((page) => {
      const p = page.properties;
      const getText  = (prop) => prop?.rich_text?.[0]?.plain_text || '';
      const getTitle = (prop) => prop?.title?.[0]?.plain_text || '';
      const getSel   = (prop) => prop?.select?.name || '';
      const getMulti = (prop) => prop?.multi_select?.map(o => o.name) || [];
      const getUrl   = (prop) => prop?.url || '';
      const getDate  = (prop) => prop?.date?.start || '';

      const photoRaw = getText(p['Foto URLs']);
      const photos = photoRaw
        ? photoRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      return {
        id:     page.id,
        name:   getTitle(p['Nama Tempat']) || 'Unnamed Spot',
        date:   getDate(p['Tanggal']),
        gmaps:  getUrl(p['GMaps Link']),
        lat:    getText(p['Latitude']),
        lng:    getText(p['Longitude']),
        story:  getText(p['Story']),
        mood:   getSel(p['Mood']),
        rating: getSel(p['Rating']),
        photos,
        kota:   getText(p['Kota']),
        tags:   getMulti(p['Tags']),
      };
    }).filter(s => s.lat && s.lng);

    return res.status(200).json({ spots });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
