// Firebase config
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// author password
const AUTHOR_PASSWORD = "123abc";

// Load article when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadArticle();
    setupSidebarFunctionality();
});

// Setup sidebar functionality (same as index.js)
function setupSidebarFunctionality() {
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const addArticleLink = document.getElementById('add-article-link');
    const modal = document.getElementById('article-modal');
    const closeBtn = document.querySelector('.close');
    const articleForm = document.getElementById('article-form');

    hamburger.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // Open modal when ADD ARTICLE is clicked
    addArticleLink.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        articleForm.reset();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            articleForm.reset();
        }
    });

    // Handle form submission
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

        // Password verification
        if (password !== AUTHOR_PASSWORD) {
            showMessage('Incorrect password. Only verified authors can submit articles.', 'error');
            return;
        }

        try {
            // Add article to Firestore
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
            
            // Close modal after delay
            setTimeout(() => {
                modal.style.display = 'none';
            }, 2000);

        } catch (error) {
            console.error('Error submitting article:', error);
            showMessage('Error submitting article. Please try again.', 'error');
        }
    });

    // Setup category filter links to go back to index.html
    const categoryButtons = document.querySelectorAll('.category-filter');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category) {
                window.location.href = `index.html?category=${category}`;
            } else {
                window.location.href = 'index.html';
            }
        });
    });
}

// Load article from URL parameter
async function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
        showError('No article ID provided');
        return;
    }

    try {
        const articleDoc = await db.collection('articles').doc(articleId).get();
        
        if (!articleDoc.exists) {
            showError('Article not found');
            return;
        }

        const article = articleDoc.data();
        displayArticle(article);
        
    } catch (error) {
        console.error('Error loading article:', error);
        showError('Error loading article');
    }
}

// Display article content
function displayArticle(article) {
    document.getElementById('article-title').textContent = article.headline;
    document.getElementById('article-author').textContent = `By ${article.authorName}`;
    document.getElementById('article-date').textContent = formatDate(article.date);
    document.getElementById('article-category').textContent = article.category;
    document.getElementById('article-description').textContent = article.description;
    document.getElementById('article-image').src = article.imageUrl;
    document.getElementById('article-image').alt = article.headline;
    
    // Format and display article content
    const contentDiv = document.getElementById('article-content');
    const formattedContent = article.content.replace(/\n/g, '</p><p>');
    contentDiv.innerHTML = `<p>${formattedContent}</p>`;
    
    // Update page title
    document.title = `${article.headline} - The Dialect`;
}

// Show error message
function showError(message) {
    document.getElementById('article-title').textContent = 'Error';
    document.getElementById('article-author').textContent = '';
    document.getElementById('article-date').textContent = '';
    document.getElementById('article-category').textContent = '';
    document.getElementById('article-description').textContent = message;
    document.getElementById('article-image').style.display = 'none';
    document.getElementById('article-content').textContent = '';
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Date not available';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Show success/error messages
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
