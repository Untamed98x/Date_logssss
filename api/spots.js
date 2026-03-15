module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token    = process.env.NOTION_TOKEN;
  const dbId     = process.env.NOTION_DB_ID;
  const stadiaKey = process.env.STADIA_API_KEY;

  if (!token || !dbId) return res.status(500).json({ error: 'Missing NOTION_TOKEN or NOTION_DB_ID' });

  const dbRes = await fetch('https://api.notion.com/v1/databases/' + dbId + '/query', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ page_size: 100 })
  });

  if (!dbRes.ok) return res.status(dbRes.status).json({ error: await dbRes.text() });
  const { results } = await dbRes.json();

  const spots = await Promise.all(results.map(async function(page) {
    const p = page.properties;
    function txt(x)  { return x && x.rich_text && x.rich_text[0] ? x.rich_text[0].plain_text : ''; }
    function ttl(x)  { return x && x.title && x.title[0] ? x.title[0].plain_text : ''; }
    function sel(x)  { return x && x.select ? x.select.name || '' : ''; }
    function msel(x) { return x && x.multi_select ? x.multi_select.map(function(o) { return o.name; }) : []; }
    function dt(x)   { return x && x.date ? x.date.start || '' : ''; }

    var photoRaw = txt(p['Foto URLs']);
    var photos = photoRaw ? photoRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];

    // Fetch page blocks to get uploaded images if no Foto URLs
    if (photos.length === 0) {
      try {
        var blocksRes = await fetch('https://api.notion.com/v1/blocks/' + page.id + '/children?page_size=50', {
          headers: { 'Authorization': 'Bearer ' + token, 'Notion-Version': '2022-06-28' }
        });
        if (blocksRes.ok) {
          var blocksData = await blocksRes.json();
          blocksData.results.forEach(function(block) {
            if (block.type === 'image') {
              var imgUrl = block.image.type === 'file'
                ? block.image.file.url
                : (block.image.type === 'external' ? block.image.external.url : '');
              if (imgUrl) photos.push(imgUrl);
            }
          });
          // Also grab page cover
          if (page.cover) {
            var coverUrl = page.cover.type === 'file'
              ? page.cover.file.url
              : (page.cover.type === 'external' ? page.cover.external.url : '');
            if (coverUrl && photos.indexOf(coverUrl) === -1) photos.unshift(coverUrl);
          }
        }
      } catch(e) { /* silently skip */ }
    }

    return {
      id:     page.id,
      name:   ttl(p['Nama Tempat']) || 'Unnamed',
      date:   dt(p['Tanggal']),
      gmaps:  p['GMaps Link'] && p['GMaps Link'].url ? p['GMaps Link'].url : '',
      lat:    txt(p['Latitude']),
      lng:    txt(p['Longitude']),
      story:  txt(p['Story']),
      mood:   sel(p['Mood']),
      rating: sel(p['Rating']),
      photos: photos,
      kota:   txt(p['Kota']),
      tags:   msel(p['Tags'])
    };
  }));

  return res.status(200).json({
    spots: spots.filter(function(s) { return s.lat && s.lng; }),
    stadiaKey: stadiaKey || null
  });
};
