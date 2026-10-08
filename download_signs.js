/**
 * Sri Lanka Road Signs Downloader
 * 
 * Fetches authentic, high-definition vector SVG road signs directly
 * from the Wikimedia Commons API according to official Gazette & RDA standards.
 * 
 * Features:
 * - Wikimedia Commons MediaWiki API batch title resolution
 * - Compliant User-Agent header
 * - Automatic exponential backoff & cooldown on HTTP 429 rate limits
 * - Validation of SVG XML integrity
 * - Skipping of already verified vector files
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

      if (res.statusCode === 429) {
        const retryHeader = res.headers['retry-after'];
        const retryAfter = retryHeader ? parseInt(retryHeader, 10) : null;
        const err = new Error(`HTTP 429 (Too Many Requests)`);
        err.retryAfter = !isNaN(retryAfter) && retryAfter > 0 ? retryAfter : null;
        return reject(err);
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
      await sleep(300);
    } catch (err) {
      console.warn(`Warning during API batch query (${i}..${i + batch.length}):`, err.message);
    }
  }

  console.log(`Resolved direct URLs for ${directUrls.size} of ${fileNames.length} assets.\n`);

  // 3. Download each authentic vector SVG with retry and polite throttling
  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    const targetFile = path.join(TARGET_DIR, fileName);
    const signInfo = fileMap.get(fileName);
    const signTitle = signInfo ? signInfo.name : fileName;
    const progress = `[${String(i + 1).padStart(3, ' ')}/${fileNames.length}]`;

    // Check if the file is ALREADY a genuine vector SVG (starts with XML / <svg and is not PNG)
    if (fs.existsSync(targetFile)) {
      const existing = fs.readFileSync(targetFile);
      const isPng = existing.length > 4 && existing[0] === 0x89 && existing[1] === 0x50 && existing[2] === 0x4E;
      const head = existing.toString('utf8', 0, 150);
      const isRealSvg = !isPng && (head.includes('<svg') || head.includes('<?xml'));
      if (isRealSvg) {
        console.log(`${progress} ⏭️  Already Valid Vector SVG: ${fileName} (${existing.length} bytes) - "${signTitle}"`);
        skippedCount++;
        continue;
      }
    }

    const downloadUrl = directUrls.get(fileName);
    if (!downloadUrl) {
      console.warn(`${progress} ⚠️  No direct URL resolved for ${fileName}`);
      failedCount++;
      continue;
    }

    // Attempt download with automatic backoff retry on 429
    let downloaded = false;
    let attempt = 0;
    const maxAttempts = 4;

    while (attempt < maxAttempts && !downloaded) {
      attempt++;
      try {
        const data = await fetchUrl(downloadUrl);

        // Validate SVG structure
        const isPng = data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47;
        const dataText = data.toString('utf8', 0, 300);
        const isSvg = dataText.includes('<svg') || dataText.includes('<?xml');

        if (isPng || !isSvg) {
          throw new Error('Downloaded content is not valid SVG XML (PNG signature or missing <svg> tag)');
        }

        fs.writeFileSync(targetFile, data);
        console.log(`${progress} ✅ Pulled Vector SVG: ${fileName} (${data.length} bytes) - "${signTitle}"`);
        successCount++;
        downloaded = true;

        // Polite delay (1000ms) between successful requests to stay well within Wikimedia CDN limits
        await sleep(1000);
      } catch (err) {
        if (err.message && err.message.includes('429')) {
          // Calculate cooldown period
          const cooldownSec = err.retryAfter ? Math.max(err.retryAfter, 12) : (10 + (attempt * 5));
          console.warn(`${progress} ⏳ Wikimedia CDN Rate Limit (429). Pausing for ${cooldownSec}s before attempt ${attempt + 1}/${maxAttempts}...`);
          await sleep(cooldownSec * 1000);
        } else {
          console.error(`${progress} ❌ Error downloading ${fileName}: ${err.message}`);
          break; // Non-429 error, move to next file
        }
      }
    }

    if (!downloaded) {
      failedCount++;
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
