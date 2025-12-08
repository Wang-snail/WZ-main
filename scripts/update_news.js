import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(PROJECT_ROOT, 'public/data/platform_news_2025.json');

// Helper to log with timestamp
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// 1. Fetch News (Placeholder for Real API)
async function fetchLatestNews() {
    log('Fetching latest news...');
    // TODO: Replace this with actual API call to get real news
    // For now, we return an empty array to ensure the script runs without error
    return [];
}

// 2. Update JSON Data
function updateDataFile(newItems) {
    if (newItems.length === 0) {
        log('No new items to add.');
        return false;
    }

    log(`Reading data from ${DATA_FILE}`);
    let data = { news: [] };

    if (fs.existsSync(DATA_FILE)) {
        try {
            const content = fs.readFileSync(DATA_FILE, 'utf8');
            data = JSON.parse(content);
        } catch (error) {
            log('Error reading data file, starting with empty object.');
        }
    }

    // Filter out duplicates based on ID
    const existingIds = new Set(data.news.map(item => item.id));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));

    if (uniqueNewItems.length === 0) {
        log('All fetched items already exist in database.');
        return false;
    }

    // Prepend new items
    data.news = [...uniqueNewItems, ...data.news];

    // Write back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    log(`Added ${uniqueNewItems.length} new items to ${DATA_FILE}`);
    return true;
}

// 3. Git Operations
function pushToGit() {
    try {
        log('Executing Git operations...');
        // Change to project root by setting cwd in execSync or process.chdir
        // process.chdir(PROJECT_ROOT); // Changing global process cwd can be risky in some envs, but fine here

        const options = { stdio: 'inherit', cwd: PROJECT_ROOT };

        // Add file
        execSync(`git add "${DATA_FILE}"`, options);

        // Commit
        const dateStr = new Date().toISOString().split('T')[0];
        try {
            execSync(`git commit -m "chore: auto-update platform news ${dateStr}"`, options);
        } catch (e) {
            // git commit fails if there is nothing to mess, which is fine
            log('Nothing to commit or commit failed: ' + e.message);
            return;
        }

        // Push
        execSync('git push', options);
        log('Successfully pushed changes to remote repository.');
    } catch (error) {
        log('Git operation failed: ' + error.message);
    }
}

// Main Execution Flow
async function main() {
    try {
        log('Starting daily news update...');
        const newNews = await fetchLatestNews();
        const updated = updateDataFile(newNews);

        if (updated) {
            pushToGit();
        } else {
            log('No changes made, skipping git push.');
        }
        log('Daily update completed.');
    } catch (error) {
        console.error('Script execution failed:', error);
        process.exit(1);
    }
}

main();
