/**
 * Sri Lanka Road Signs Downloader
 * 
 * Fetches authentic, high-definition vector SVG road signs directly
 * from the Wikimedia Commons API according to official Gazette & RDA standards.
 * 
 * Uses Wikimedia-compliant User-Agent and batch title resolution to avoid
 * rate limiting (HTTP 429) or robot policy blocks (HTTP 403).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const USER_AGENT = 'SriLankaDrivingExamPrep/1.0 (https://github.com/thaha/license; study.contact@gmail.com)';
const SIGNS_JSON_PATH = path.join(__dirname, 'signs_wiki.json');
const TARGET_DIR = path.join(__dirname, 'assets', 'signs');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Helper: HTTP GET request with custom headers
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'image/svg+xml,text/xml,application/json,*/*'
      }
    };

    https.get(options, (res) => {
      // Follow redirects (301, 302, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).toString();
        }
        return resolve(fetchUrl(redirectUrl));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('===============================================================');
  console.log('🇱🇰  Sri Lanka Road Signs - Official Vector SVG Synchronizer');
  console.log('===============================================================');

  if (!fs.existsSync(SIGNS_JSON_PATH)) {
    console.error(`Error: Dataset file not found at ${SIGNS_JSON_PATH}`);
    process.exit(1);
  }

  const signsData = JSON.parse(fs.readFileSync(SIGNS_JSON_PATH, 'utf8'));
  console.log(`Loaded ${signsData.length} signs from signs_wiki.json.`);

  // 1. Gather all unique file names
  const fileMap = new Map();
  signsData.forEach(s => {
    if (s.fileName) {
      fileMap.set(s.fileName, s);
    }
  });

  const fileNames = Array.from(fileMap.keys());
  console.log(`Identified ${fileNames.length} unique SVG assets to verify and pull.\n`);

  // 2. Query Wikimedia Commons API in batches of 40 to resolve direct SVG URLs
  console.log('Resolving canonical vector source URLs via Wikimedia Commons API...');
  const directUrls = new Map();
  const batchSize = 40;

  for (let i = 0; i < fileNames.length; i += batchSize) {
    const batch = fileNames.slice(i, i + batchSize);
    const titlesParam = batch.map(fn => 'File:' + encodeURIComponent(fn)).join('|');
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${titlesParam}&prop=imageinfo&iiprop=url&format=json`;

    try {
      const respBuf = await fetchUrl(apiUrl);
      const respJson = JSON.parse(respBuf.toString('utf8'));
      const pages = respJson.query && respJson.query.pages ? respJson.query.pages : {};

      // Build normalization mapping if titles were normalized by MediaWiki
      const normMap = new Map();
      if (respJson.query && respJson.query.normalized) {
        respJson.query.normalized.forEach(n => normMap.set(n.to, n.from));
      }

      for (const pageId in pages) {
        const p = pages[pageId];
        let originalTitle = p.title || '';
        if (normMap.has(originalTitle)) {
          originalTitle = normMap.get(originalTitle);
        }
        const cleanName = originalTitle.replace(/^File:/i, '').trim();
        const underName = cleanName.replace(/ /g, '_');

        if (p.imageinfo && p.imageinfo.length > 0 && p.imageinfo[0].url) {
          const rawUrl = p.imageinfo[0].url;
          // Match to our batch items
          const matchedFile = batch.find(f => {
            const fLower = f.toLowerCase();
            return fLower === cleanName.toLowerCase() ||
                   fLower === underName.toLowerCase() ||
                   decodeURIComponent(cleanName).toLowerCase() === fLower ||
                   decodeURIComponent(underName).toLowerCase() === fLower;
          });
          if (matchedFile) {
            directUrls.set(matchedFile, rawUrl);
          } else {
            directUrls.set(underName, rawUrl);
            directUrls.set(cleanName, rawUrl);
          }
        }
      }
      await sleep(200);
    } catch (err) {
      console.warn(`Warning during API batch query (${i}..${i + batch.length}):`, err.message);
    }
  }

  console.log(`Resolved direct URLs for ${directUrls.size} of ${fileNames.length} assets.\n`);

  // Fallback for any unmapped file: derive standard Commons hash upload path
  // Standard format: https://upload.wikimedia.org/wikipedia/commons/<h1_h2>/<fileName>
  // We can construct it directly if needed.

  // 3. Download each authentic vector SVG
  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    const targetFile = path.join(TARGET_DIR, fileName);
    const signInfo = fileMap.get(fileName);
    const signTitle = signInfo ? signInfo.name : fileName;

    // Check if the file is already a genuine SVG (starts with XML / <svg)
    if (fs.existsSync(targetFile)) {
      const existing = fs.readFileSync(targetFile);
      const isRealSvg = existing.length > 50 && (existing[0] === 0x3C /* '<' */ || existing.toString('utf8', 0, 100).includes('<svg'));
      const isPng = existing[0] === 0x89 && existing[1] === 0x50; // PNG signature
      if (isRealSvg && !isPng) {
        console.log(`[${i + 1}/${fileNames.length}] ⏭️  Already Vector SVG: ${fileName} (${existing.length} bytes)`);
        skippedCount++;
        continue;
      }
    }

    const downloadUrl = directUrls.get(fileName);
    if (!downloadUrl) {
      console.warn(`[${i + 1}/${fileNames.length}] ⚠️  No direct URL resolved for ${fileName}`);
      failedCount++;
      continue;
    }

    try {
      const data = await fetchUrl(downloadUrl);

      // Validate SVG structure
      const isPng = data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47;
      const dataText = data.toString('utf8', 0, 300);
      const isSvg = dataText.includes('<svg') || dataText.includes('<?xml');

      if (isPng || !isSvg) {
        throw new Error(`Downloaded content is not valid SVG (PNG header or missing <svg> tag)`);
      }

      fs.writeFileSync(targetFile, data);
      console.log(`[${i + 1}/${fileNames.length}] ✅ Pulled Vector SVG: ${fileName} (${data.length} bytes) - "${signTitle}"`);
      successCount++;

      // Polite delay between downloads
      await sleep(150);
    } catch (err) {
      console.error(`[${i + 1}/${fileNames.length}] ❌ Failed to download ${fileName}: ${err.message}`);
      failedCount++;
      await sleep(300);
    }
  }

  console.log('\n===============================================================');
  console.log('Sync Complete:');
  console.log(`  - Successfully Downloaded: ${successCount}`);
  console.log(`  - Already Valid Vector SVG: ${skippedCount}`);
  console.log(`  - Failed: ${failedCount}`);
  console.log(`  - Total Files in ${TARGET_DIR}: ${fs.readdirSync(TARGET_DIR).length}`);
  console.log('===============================================================');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
