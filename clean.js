const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ridi_source.html', 'utf-8');
const $ = cheerio.load(html);

// 1. Remove all script tags (this removes __NEXT_DATA__ which is huge)
$('script').remove();

// 2. Remove all template tags
$('template').remove();

// 3. Remove all hidden divs or elements with 'hidden' attribute
$('[hidden]').remove();

// 4. Optionally remove noscript tags
$('noscript').remove();

// 5. Remove any elements that are specifically for other tabs if we can identify them (like hidden swiper slides, etc.)
// Usually, other tabs in Ridibooks are either in a hidden div or not rendered until clicked. 
// If they are rendered, they might have specific attributes like aria-hidden="true"
$('[aria-hidden="true"]').each(function() {
    // Only remove if it's a large container, but just to be safe, let's just stick to hidden attribute for now
});

// Remove huge empty inline styles that might be generated
$('style:empty').remove();

// Remove the iframe used for tracking etc
$('iframe').remove();

fs.writeFileSync('ridi_source.html', $.html());
console.log('Cleaned up HTML successfully!');
