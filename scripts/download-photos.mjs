#!/usr/bin/env node

/**
 * Batch download profile photos from Unsplash or generate with AI
 *
 * Usage:
 *   node scripts/download-photos.mjs --unsplash
 *   node scripts/download-photos.mjs --replicate
 *
 * Keys are stored in ~/.dating-assistant/config.json after first run
 *
 * For Unsplash: Get free API key at https://unsplash.com/oauth/applications
 * For Replicate: Get free API token at https://replicate.com/account
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import readline from 'readline';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR = path.join(os.homedir(), '.dating-assistant');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Archetype-based search terms (portrait-focused)
const searchTerms = {
  // Female profiles
  jade_Sugar_Baby: ['woman portrait headshot professional', 'woman headshot elegant', 'woman portrait confident smile', 'professional woman portrait', 'woman headshot luxury'],
  freya_ENM: ['woman portrait independent', 'woman headshot thoughtful', 'woman portrait modern', 'woman headshot diverse', 'woman portrait confident'],
  dominique_BDSM: ['woman portrait strong', 'woman headshot confident', 'woman portrait sophisticated', 'woman headshot elegant', 'woman portrait mysterious'],
  stella_Swinger: ['woman portrait beautiful smile', 'woman headshot happy', 'woman portrait sophisticated', 'woman headshot modern', 'couple portrait happy'],
  aria_Monogamish: ['woman portrait beautiful', 'woman headshot happy', 'woman portrait confident', 'woman headshot thoughtful', 'woman portrait modern'],

  // Male profiles
  victor_Sugar_Daddy: ['man portrait headshot professional', 'man headshot mature businessman', 'man portrait confident', 'man headshot elegant', 'man portrait successful'],
  kai_ENM: ['man portrait thoughtful', 'man headshot modern', 'man portrait compassionate', 'man headshot intelligent', 'man portrait confident'],
  dante_BDSM: ['man portrait strong', 'man headshot confident', 'man portrait sophisticated', 'man headshot masculine', 'man portrait mysterious'],
  owen_Swinger: ['man portrait happy', 'man headshot confident', 'man portrait attractive', 'man headshot modern', 'man portrait charismatic'],
  alex_Monogamish: ['man portrait thoughtful', 'man headshot intelligent', 'man portrait confident', 'man headshot modern', 'man portrait handsome'],
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

async function promptForKey(name) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(`Enter ${name} API key: `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function getApiKey(mode) {
  const config = loadConfig();
  const keyName = mode === '--unsplash' ? 'unsplashKey' : 'replicateKey';

  if (config[keyName]) {
    console.log(`✓ Using stored ${mode === '--unsplash' ? 'Unsplash' : 'Replicate'} key`);
    return config[keyName];
  }

  console.log(`No ${mode === '--unsplash' ? 'Unsplash' : 'Replicate'} key found. Saving for next time.`);
  const key = await promptForKey(mode === '--unsplash' ? 'Unsplash' : 'Replicate');
  config[keyName] = key;
  saveConfig(config);
  return key;
}

async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const makeRequest = url.startsWith('https') ? https : http;
    const req = makeRequest.request(url, { ...options }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const makeRequest = url.startsWith('https') ? https : http;
    makeRequest.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(filepath, () => {});
      reject(error);
    });
  });
}

function getSearchTerms(profile) {
  const idMatch = Object.keys(searchTerms).find((key) => (
    profile.id === key || profile.id.startsWith(`${key}_`)
  ));

  if (idMatch) {
    return searchTerms[idMatch];
  }

  return searchTerms[profile.name] || [`${profile.name} dating profile portrait`];
}

async function downloadFromUnsplash(apiKey, profileName, searchTerms, photoDir) {
  const photos = [];
  const termsToTry = Array.isArray(searchTerms) ? searchTerms : [searchTerms];

  for (const term of termsToTry) {
    if (photos.length >= 5) break;

    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=5&client_id=${apiKey}`;
      const data = await fetchJson(url);

      if (data.results && data.results.length > 0) {
        for (const result of data.results) {
          if (photos.length >= 5) break;
          const photoUrl = result.urls.regular;
          const filename = `${profileName}_${photos.length + 1}.jpg`;
          await downloadFile(photoUrl, path.join(photoDir, filename));
          photos.push(filename);
          console.log(`  ✓ Downloaded: ${filename}`);
        }
      }
    } catch (error) {
      console.log(`  ⚠ Failed to download for term "${term}": ${error.message}`);
    }
  }

  return photos.length;
}

async function generateWithReplicate(apiKey, profileName, searchTerms, photoDir) {
  const photos = [];
  const prompts = Array.isArray(searchTerms) ? searchTerms : [searchTerms];

  for (let i = 0; i < Math.min(5, prompts.length); i++) {
    try {
      const prompt = `Portrait of ${prompts[i]}, professional headshot, high quality, detailed, realistic, beautiful lighting, studio quality`;

      console.log(`  ⏳ Generating: ${prompt.substring(0, 50)}...`);

      const response = await fetchJson('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'ac732df83cea7fff18b51f390b87a8f09df4fabf3b3b1ac3db8e1c7b2d94cc26',
          input: {
            prompt,
            num_outputs: 1,
            num_inference_steps: 50,
          },
        }),
      });

      // Check for API errors
      if (response.detail || response.error) {
        throw new Error(`Replicate API error: ${response.detail || response.error}${response.retry_after ? ` (retry after ${response.retry_after}s)` : ''}`);
      }

      let prediction = response;
      let attempts = 0;

      while (prediction && prediction.status !== 'succeeded' && attempts < 120) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!prediction.urls || !prediction.urls.get) {
          throw new Error(`Invalid response structure. Has urls: ${!!prediction.urls}, has get: ${prediction.urls ? !!prediction.urls.get : 'N/A'}`);
        }
        prediction = await fetchJson(prediction.urls.get, {
          headers: { 'Authorization': `Token ${apiKey}` },
        });
        attempts++;
      }

      if (prediction.status === 'succeeded' && prediction.output && prediction.output.length > 0) {
        const imageUrl = prediction.output[0];
        const filename = `${profileName}_${i + 1}.jpg`;
        await downloadFile(imageUrl, path.join(photoDir, filename));
        photos.push(filename);
        console.log(`  ✓ Generated: ${filename}`);
      }
    } catch (error) {
      console.log(`  ⚠ Failed to generate image ${i + 1}: ${error.message}`);
    }
  }

  return photos.length;
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!mode || !['--unsplash', '--replicate'].includes(mode)) {
    console.log(`
Usage:
  node scripts/download-photos.mjs --unsplash
  node scripts/download-photos.mjs --replicate

Keys are stored in ~/.dating-assistant/config.json after first use

Get API keys:
  Unsplash: https://unsplash.com/oauth/applications (free)
  Replicate: https://replicate.com/account (free)
    `);
    process.exit(1);
  }

  let apiKey = args[1];
  if (!apiKey) {
    apiKey = await getApiKey(mode);
  }

  const femaleDir = path.join(PROJECT_ROOT, 'female_profiles');
  const maleDir = path.join(PROJECT_ROOT, 'male_profiles');

  const profiles = [];

  for (const dir of [femaleDir, maleDir]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const profilePath = path.join(dir, entry.name, 'profile.json');
        if (fs.existsSync(profilePath)) {
          const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
          profiles.push({
            id: profile.id,
            name: profile.name,
            archetype: profile.archetype,
            photoDir: path.join(dir, entry.name, 'photos'),
          });
        }
      }
    }
  }

  console.log(`\n📸 Downloading photos for ${profiles.length} profiles using ${mode === '--unsplash' ? 'Unsplash API' : 'Replicate AI'}...\n`);

  let totalDownloaded = 0;

  for (const profile of profiles) {
    const archetypeLabel = profile.archetype || 'Unknown';

    console.log(`📁 ${profile.name} (${archetypeLabel})`);
    fs.mkdirSync(profile.photoDir, { recursive: true });

    const terms = getSearchTerms(profile);
    let count = 0;
    if (mode === '--unsplash') {
      count = await downloadFromUnsplash(apiKey, profile.name, terms, profile.photoDir);
    } else if (mode === '--replicate') {
      count = await generateWithReplicate(apiKey, profile.name, terms, profile.photoDir);
    }

    totalDownloaded += count;
    console.log(`   → ${count}/5 photos\n`);
  }

  console.log(`✅ Done! Downloaded ${totalDownloaded} total photos.\n`);
}

main().catch(console.error);
