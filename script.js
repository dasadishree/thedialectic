// firebase config
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// author password (tell sarah to change if she needsa)
const AUTHOR_PASSWORD = "123abc";

// Global variables for filtering
let allArticles = [];
let currentCategory = 'all';

// load articles
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    setupCategoryFilters();
});

// article filters
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-filter');
    const titleLink = document.querySelector('.title');
    
    //title shows all articles
    titleLink.addEventListener('click', function(e) {
        e.preventDefault();
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        currentCategory = 'all';
        filterAndDisplayArticles('all');
    });
    
    // filter links
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');      
            const category = this.getAttribute('data-category');
            currentCategory = category;
            filterAndDisplayArticles(category);
        });
    });
}

// Function to load articles from Firestore
async function loadArticles() {
    try {
        const articlesSnapshot = await db.collection('articles')
            .orderBy('timestamp', 'desc')
            .get();
        
        allArticles = [];
        articlesSnapshot.forEach(doc => {
            allArticles.push({ id: doc.id, ...doc.data() });
        });
        
        filterAndDisplayArticles(currentCategory);
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

// Function to filter and display articles by category
function filterAndDisplayArticles(category) {
    let filteredArticles;
    
    if (category === 'all') {
        filteredArticles = allArticles;
    } else {
        filteredArticles = allArticles.filter(article => article.category === category);
    }
    
    displayArticles(filteredArticles);
}

//  display articles by time
function displayArticles(articles) {
    const recentContainer = document.getElementById('recent-articles-container');
    const olderContainer = document.getElementById('older-articles-container');
    
    recentContainer.innerHTML = '';
    olderContainer.innerHTML = '';
    
    if (articles.length === 0) {
        recentContainer.innerHTML = `<p>No articles found in ${currentCategory === 'all' ? 'any category' : currentCategory} yet.</p>`;
        return;
    }
    
    // calculate big and small (prob dindt need to hardcode it but im lazy to fix it)
    let bigCount, smallCount;
    
    if (articles.length === 1) {
        bigCount = 1;
        smallCount = 0;
    } else if (articles.length === 2) {
        bigCount = 1;
        smallCount = 1;
    } else if (articles.length === 3) {
        bigCount = 2;
        smallCount = 1;
    } else if (articles.length === 4) {
        bigCount = 2;
        smallCount = 2;
    } else if (articles.length === 5) {
        bigCount = 3;
        smallCount = 2;
    } else if (articles.length === 6) {
        bigCount = 3;
        smallCount = 3;
    } else if (articles.length === 7) {
        bigCount = 4;
        smallCount = 3;
    } else {
        bigCount = Math.ceil(articles.length / 2);
        smallCount = Math.floor(articles.length / 2);
    }
    
    //  big articles
    const bigArticles = articles.slice(0, bigCount);
    bigArticles.forEach(article => {
        const articleElement = createRecentArticleElement(article);
        recentContainer.appendChild(articleElement);
    });
    
    //  small articles
    const smallArticles = articles.slice(bigCount);
    smallArticles.forEach((article, index) => {
        const articleElement = createSmallArticleElement(article);
        olderContainer.appendChild(articleElement);
        
        if (index < smallArticles.length - 1) {
            const hr = document.createElement('hr');
            olderContainer.appendChild(hr);
        }
    });
}

// large articles element (recent format)
function createRecentArticleElement(article) {
    const articleDiv = document.createElement('div');
    articleDiv.className = 'recentDiv';
    articleDiv.style.cursor = 'pointer';
    
    articleDiv.innerHTML = `
        <div class="recentText">
            <h2 class="recentHeading">${article.headline}</h2>
            <p class="recentDescription">${article.description}</p>
            <p class="recentAuthor">By ${article.authorName}</p>
            <p class="recentDate">${formatDate(article.date)}</p>
        </div>
        <div class="vertical-line"></div>
        <img src="${article.imageUrl}" alt="${article.headline}" onerror="this.src='img.jpg'">
        <div class="vertical-line"></div>
    `;
    
    // Make article clickable
    articleDiv.addEventListener('click', function() {
        window.location.href = `article.html?id=${article.id}`;
    });
    
    return articleDiv;
}

// small articles element (older format)
function createSmallArticleElement(article) {
    const articleDiv = document.createElement('div');
    articleDiv.className = 'smallDiv';
    articleDiv.style.cursor = 'pointer';
    
    articleDiv.innerHTML = `
        <div class="smallText">
            <h2 class="smallHeading">${article.headline}</h2>
            <p class="smallDescription">${article.description}</p>
            <p class="smallAuthor">By ${article.authorName}</p>
            <p class="smallDate">${formatDate(article.date)}</p>
        </div>
        <img src="${article.imageUrl}" alt="${article.headline}" onerror="this.src='img.jpg'">
    `;
    
    // Make article clickable
    articleDiv.addEventListener('click', function() {
        window.location.href = `article.html?id=${article.id}`;
    });
    
    return articleDiv;
}

// format date
function formatDate(dateString) {
    if (!dateString) return 'Date not available';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// hamburger menu
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const addArticleLink = document.getElementById('add-article-link');
    const modal = document.getElementById('article-modal');
    const closeBtn = document.querySelector('.close');
    const articleForm = document.getElementById('article-form');

    hamburger.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // modal open and close
    addArticleLink.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
    });
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        articleForm.reset();
    });
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            articleForm.reset();
        }
    });

    // form submission
    articleForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const authorName = document.getElementById('author-name').value;
        const date = document.getElementById('date').value;
        const category = document.getElementById('category').value;
        const headline = document.getElementById('headline').value;
        const description = document.getElementById('description').value;
        const content = document.getElementById('content').value;
        const imageUrl = document.getElementById('image-url').value;

        // password
        if (password !== AUTHOR_PASSWORD) {
            showMessage('Incorrect password. Only verified authors can submit articles.', 'error');
            return;
        }

        try {
            // add to firestore
            await db.collection('articles').add({
                authorName: authorName,
                date: date,
                category: category,
                headline: headline,
                description: description,
                content: content,
                imageUrl: imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            showMessage('Article submitted successfully!', 'success');
            articleForm.reset();
            
            // Reload articles to show the new one
            loadArticles();
            
            // close modal after delay
            setTimeout(() => {
                modal.style.display = 'none';
            }, 2000);

        } catch (error) {
            console.error('Error submitting article:', error);
            showMessage('Error submitting article. Please try again.', 'error');
        }
    });
});

// success/error messages
function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    const form = document.getElementById('article-form');
    form.appendChild(messageDiv);
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}