const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const booksPath = 'src/main/resources/data/books.json';
const imagesDir = 'frontend/public/images/books';

const betterUrls = {
    "The Martian Chronicles": "https://upload.wikimedia.org/wikipedia/commons/e/e6/The_Martian_Chronicles_%281950%29_front_cover%2C_first_edition.jpg",
    "Neuromancer": "https://upload.wikimedia.org/wikipedia/en/4/4b/Neuromancer_%28Book%29.jpg",
    "The Left Hand of Darkness": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347076413i/18423.jpg"
};

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        protocol.get(url, options, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Failed to load image, status code: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function main() {
    try {
        const data = fs.readFileSync(booksPath, 'utf8');
        const books = JSON.parse(data);

        for (const book of books) {
            let url = betterUrls[book.title];
            if (!url) {
                if (book.imageUrl && book.imageUrl.startsWith('http')) {
                    url = book.imageUrl;
                } else {
                    url = `https://placehold.co/400x600?text=${encodeURIComponent(book.title)}`;
                }
            }

            const slug = slugify(book.title);
            const filename = `${slug}.jpg`;
            const filepath = path.join(imagesDir, filename);

            // Fix double slash issue if exists in path joining (mostly fine in node)
            // Save to frontend/public/images/books/filename.jpg

            console.log(`Downloading ${book.title} from ${url}...`);
            try {
                await downloadImage(url, filepath);
                book.imageUrl = `/images/books/${filename}`;
            } catch (err) {
                console.error(`Failed to download ${book.title}: ${err.message}`);
                // Keep original or set to placeholder if failed?
                // If it failed, maybe we setup a default fallback locally?
                // Let's just point to a valid placeholder even if download failed? 
                // Or try generic placeholder.
                if (book.imageUrl == null || !book.imageUrl.startsWith('/images/')) {
                    book.imageUrl = `https://placehold.co/400x600?text=${encodeURIComponent(book.title)}`;
                }
            }
        }

        fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));
        console.log('Done!');

    } catch (err) {
        console.error(err);
    }
}

main();
