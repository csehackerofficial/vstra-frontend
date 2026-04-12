/**
 * js/amazonData.js
 * Affiliate Partner: ngpians-21
 */

const MY_TAG = 'ngpians-21';
// IMPORTANT: पिछले मैसेज में बताए गए Google Script का URL यहाँ डालें
const SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE'; 

window.autoFetch = async (query) => {
    // Handling Special Pick Links
    if(query === 'featured_picks') {
        return [
            { title: "Premium Fashion Choice 01", price: "Check Offer", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400", url: "https://amzn.to/3QvPaoe" },
            { title: "Premium Fashion Choice 02", price: "Check Offer", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400", url: "https://amzn.to/41W1il0" }
        ];
    }

    // Automated Scraping via Google Bridge
    try {
        if(SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') return []; 
        
        const response = await fetch(`${SCRIPT_URL}?q=${encodeURIComponent(query)}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const items = doc.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
        
        let products = [];
        items.forEach((item, i) => {
            const titleNode = item.querySelector('h2');
            const imgNode = item.querySelector('img');
            const linkNode = item.querySelector('a');

            if (titleNode && imgNode && linkNode && products.length < 8) {
                let cleanLink = "https://www.amazon.in" + linkNode.getAttribute('href').split('?')[0];
                products.push({
                    title: window.cleanAI(titleNode.innerText),
                    price: "1,299+", // Standard starting price
                    image: imgNode.src,
                    url: `${cleanLink}?tag=${MY_TAG}`
                });
            }
        });
        return products;
    } catch (e) {
        console.error("Fetch Error:", e);
        return [];
    }
};