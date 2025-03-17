
// get quote from api
// Display the quote and author on the page.
// Add a "New Quote" button to fetch another quote.
// Implement a copy to clipboard button.
// Add a share on Twitter button.
// Bonus extra points
// Set a random background image behind the quote
// Add a "Export" button to save the quote image to user computer

const quoteText = document.getElementById('quote-text');
const authorText = document.getElementById('author');
const newQuoteBtn = document.getElementById('new-quote-btn');
const copyBtn = document.getElementById('copy-btn');
const twitterBtn = document.getElementById('twitter-btn');
const exportBtn = document.getElementById('export-btn');
const toast = document.getElementById('toast');
const quoteCard = document.getElementById('quote-card');

let QuoteURL = "https://api.freeapi.app/api/v1/public/quotes/quote/random"


// Show Toast Notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Get random Quote
async function getQuote() {
    try {
        let response = await fetch(QuoteURL);
        let quotes = await response.json();

        let quoteTextcontent = quotes.data.content;
        let author = quotes.data.author;
        
        authorText.textContent = author;
        quoteText.textContent = quoteTextcontent;
    } catch (error) {
        console.log("error",error);
    }
}


// Copy Quote to Clipboard
function copyQuote() {
    const quote = `"${quoteText.textContent}" - ${authorText.textContent}`;
    
    navigator.clipboard.writeText(quote).then(() => {
        showToast('Quote copied to clipboard!');
        console.log("copied successfully");
        
    }, (err) => {
        showToast('Failed to copy quote');
        console.error('Could not copy text: ', err);
    });
}

// Tweet Quote
function tweetQuote() {
    const quote = encodeURIComponent(`"${quoteText.textContent}" - ${authorText.textContent}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${quote}`;
    window.open(twitterUrl, '_blank');
} 


// Add background images
function backgroundImage() {
    const backgrounds = [
        'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg',
        'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
        'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg',
        'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
        'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
        'https://images.pexels.com/photos/1287075/pexels-photo-1287075.jpeg'
    ];
    // Select a random image
    const randomImage = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    
    // Apply as background
    document.body.style.backgroundImage = `url('${randomImage}')`;
}

// Download IMG Export Quote as Image
function exportQuote() {
    if (typeof html2canvas !== 'undefined') {
        html2canvas(quoteCard, {
            backgroundColor: null,
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `quote-${authorText.textContent.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.click();
            showToast('Quote image saved successfully!');
        }).catch(err => {
            showToast('Failed to export image');
            console.error('Export failed: ', err);
        });
    } else {
        showToast('Export functionality not available');
    }
}


// Change background on reload
window.onload = backgroundImage;

newQuoteBtn.addEventListener("click",()=>{
    getQuote(),
    backgroundImage()
})
copyBtn.addEventListener("click",copyQuote)
exportBtn.addEventListener('click', exportQuote);
twitterBtn.addEventListener('click', tweetQuote);

// On load
getQuote()