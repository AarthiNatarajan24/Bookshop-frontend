// script.js

let books = [];
let filteredBooks = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
const booksPerPage = 10;
let currentPage = 1;

// QR Code Configuration
const qrCodeBasePath = 'http://localhost:5000/images/';
const qrCodeFileName = 'qrcode.png'; // Update to your actual filename
const googlePayQrCodeUrl = qrCodeBasePath + qrCodeFileName;

// Update navbar based on user login status
function updateNavbar() {
  const signInBtn = document.getElementById('signInBtn');
  const signUpBtn = document.getElementById('signUpBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  if (currentUser) {
    signInBtn.classList.add('hidden');
    signUpBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  }
}

// Load Books
async function loadBooks() {
  try {
    const response = await fetch('http://localhost:5000/api/books');
    books = await response.json();
    filterBooks();
    displayCart();
    if (currentUser) {
      loadWishlist();
    }
  } catch (err) {
    console.error('Error loading books:', err);
  }
}

// Filter and Sort Books
function filterBooks() {
  const searchQuery = document.getElementById('searchBar').value.toLowerCase();
  const selectedGenre = document.getElementById('genreFilter').value;
  const sortOption = document.getElementById('sortFilter').value;

  filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery) || book.author.toLowerCase().includes(searchQuery);
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  if (sortOption === 'price-asc') {
    filteredBooks.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    filteredBooks.sort((a, b) => b.price - b.price);
  } else if (sortOption === 'rating-desc') {
    filteredBooks.sort((a, b) => b.rating - a.rating);
  } else if (sortOption === 'rating-asc') {
    filteredBooks.sort((a, b) => a.rating - b.rating);
  }

  currentPage = 1;
  displayBooksByGenre();
  updatePagination();
}

// Group and Display Books by Genre
async function displayBooksByGenre() {
  const genresContainer = document.getElementById('genresContainer');
  genresContainer.innerHTML = '';

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const booksByGenre = {};
  paginatedBooks.forEach(book => {
    if (!booksByGenre[book.genre]) {
      booksByGenre[book.genre] = [];
    }
    booksByGenre[book.genre].push(book);
  });

  for (const genre in booksByGenre) {
    const genreSection = document.createElement('div');
    genreSection.className = 'genre-section';
    genreSection.innerHTML = `<h2>${genre}</h2>`;
    const booksContainer = document.createElement('div');
    booksContainer.className = 'books-container';

    for (const book of booksByGenre[genre]) {
      const response = await fetch(`http://localhost:5000/api/reviews/${book.id}`);
      const reviews = await response.json();

      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <img src="${book.image_url}" alt="${book.name}">
        <h3>${book.name}</h3>
        <p>Author: ${book.author}</p>
        <p class="genre">Genre: ${book.genre}</p>
        <p class="price">Price: ₹${book.price}</p>
        <p>Description: ${book.description}</p>
        <p class="reviews">Average Rating: ${book.rating} ★</p>
        <button onclick="addToCart(${book.id})">Add to Cart 🛒</button>
        <button class="wishlist-btn" onclick="addToWishlist(${book.id})">Add to Wishlist ❤️</button>
        <div class="review-form">
          <select id="rating-${book.id}">
            <option value="1">1 ★</option>
            <option value="2">2 ★</option>
            <option value="3">3 ★</option>
            <option value="4">4 ★</option>
            <option value="5">5 ★</option>
          </select>
          <textarea id="comment-${book.id}" placeholder="Write your review..." rows="2"></textarea>
          <button onclick="submitReview(${book.id})">Submit Review</button>
        </div>
        <div class="review-list">
          ${reviews.map(r => `<p>${r.rating} ★: ${r.comment || 'No comment'}</p>`).join('')}
        </div>
      `;
      booksContainer.appendChild(card);
    }

    genreSection.appendChild(booksContainer);
    genresContainer.appendChild(genreSection);
  }
}

// Update Pagination Controls
function updatePagination() {
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Change Page
function changePage(direction) {
  currentPage += direction;
  displayBooksByGenre();
  updatePagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add to Cart
async function addToCart(bookId) {
  if (!currentUser) {
    alert('Please sign in to add items to your cart.');
    window.location.href = 'index.html';
    return;
  }

  try {
    await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: currentUser.email_id, item_id: bookId, amount: 1 })
    });

    const book = books.find(b => b.id === bookId);
    const cartItem = cart.find(item => item.id === bookId);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cart.push({ id: bookId, name: book.name, price: book.price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('Error adding to cart.');
  }
}

// Update Quantity
function updateQuantity(bookId, change) {
  const cartItem = cart.find(item => item.id === bookId);
  if (cartItem) {
    cartItem.quantity += change;
    if (cartItem.quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();

    fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: currentUser.email_id, item_id: bookId, amount: cartItem.quantity })
    }).catch(err => console.error('Error updating cart:', err));
  }
}

// Remove from Cart
function removeFromCart(bookId) {
  cart = cart.filter(item => item.id !== bookId);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();

  fetch('http://localhost:5000/api/cart', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: currentUser.email_id, item_id: bookId })
  }).catch(err => console.error('Error removing from cart:', err));
}

// Display Cart
function displayCart() {
  const cartSection = document.getElementById('cartSection');
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalDiv = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartSection.style.display = 'none';
    return;
  }

  cartSection.style.display = 'block';
  cartItemsDiv.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <span>${item.name}</span>
      <div class="quantity-controls">
        <button onclick="updateQuantity(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
      <span>₹${itemTotal}</span>
      <button onclick="removeFromCart(${item.id})">Remove</button>
    `;
    cartItemsDiv.appendChild(cartItem);
  });

  cartTotalDiv.textContent = `Total: ₹${total}`;
  cartTotalDiv.dataset.total = total;
}

// QR Code Display Logic
function toggleQrCodeDisplay() {
  console.log('toggleQrCodeDisplay called');
  console.log('Payment method:', document.getElementById('paymentMethod').value);
  console.log('QR Code URL:', googlePayQrCodeUrl);

  const paymentMethod = document.getElementById('paymentMethod').value;
  const qrCodeContainer = document.getElementById('qrCodeContainer');
  const cardDetails = document.getElementById('cardDetails');
  const checkoutResult = document.getElementById('checkoutResult');

  qrCodeContainer.style.display = 'none';
  cardDetails.style.display = 'none';
  checkoutResult.style.display = 'none';
  qrCodeContainer.innerHTML = '';

  if (paymentMethod === 'Google Pay') {
    qrCodeContainer.style.display = 'block';
    qrCodeContainer.innerHTML = `
      <h4>Scan to Pay with Google Pay</h4>
      <img src="${googlePayQrCodeUrl}" alt="Payment QR Code" style="width: 200px; height: 200px;" onerror="console.error('Failed to load QR code image'); this.parentElement.innerHTML += '<p>Error loading QR code. Please check the image path.</p>';">
    `;
  } else {
    cardDetails.style.display = 'block';
  }
}

// Handle Checkout
async function handleCheckout() {
  if (!currentUser) {
    alert('Please sign in to proceed with checkout.');
    window.location.href = 'index.html';
    return;
  }

  const paymentMethod = document.getElementById('paymentMethod').value;
  const cardNo = document.getElementById('cardNo').value;
  const billAddress = document.getElementById('billAddress').value;
  const cartTotal = document.getElementById('cartTotal').dataset.total;

  if (!billAddress) {
    alert('Please enter a billing address.');
    return;
  }

  const checkoutResult = document.getElementById('checkoutResult');
  const receiptDetails = document.getElementById('receiptDetails');
  const errorMessage = document.getElementById('errorMessage');

  checkoutResult.style.display = 'none';
  receiptDetails.innerHTML = '';
  errorMessage.innerHTML = '';

  try {
    const response = await fetch('http://localhost:5000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: currentUser.email_id,
        amount: parseFloat(cartTotal),
        payment_method: paymentMethod,
        card_no: paymentMethod === 'Google Pay' ? null : cardNo,
        bill_address: billAddress
      })
    });

    const data = await response.json();
    console.log('Checkout response:', data);

    checkoutResult.style.display = 'block';

    if (response.ok) {
      const receipt = data.receipt;
      receiptDetails.innerHTML = `
        <p>Receipt ID: ${receipt.receipt_id}</p>
        <p>Transaction ID: ${receipt.transaction_id}</p>
        <p>Amount: ₹${receipt.amount}</p>
        <p>Payment Method: ${receipt.payment_method}</p>
        <p>Payment Status: ${receipt.payment_status}</p>
        ${receipt.payment_status === 'failed' ? `<p>Failure Reason: ${receipt.failure_reason}</p>` : ''}
      `;

      if (receipt.payment_status === 'success') {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
      }
    } else {
      const receipt = data.receipt || {};
      receiptDetails.innerHTML = receipt.receipt_id ? `
        <p>Receipt ID: ${receipt.receipt_id}</p>
        <p>Transaction ID: ${receipt.transaction_id}</p>
        <p>Amount: ₹${receipt.amount || 0}</p>
        <p>Payment Method: ${receipt.payment_method || 'Unknown'}</p>
        <p>Payment Status: ${receipt.payment_status || 'failed'}</p>
        <p>Failure Reason: ${receipt.failure_reason || 'Unknown error'}</p>
      ` : '';
      errorMessage.textContent = data.message || 'Checkout failed.';
    }
  } catch (err) {
    console.error('Error during checkout:', err);
    checkoutResult.style.display = 'block';
    errorMessage.textContent = 'Error during checkout: ' + err.message;
  }
}

// Submit Review
async function submitReview(bookId) {
  if (!currentUser) {
    alert('Please sign in to submit a review.');
    window.location.href = 'index.html';
    return;
  }

  const rating = document.getElementById(`rating-${bookId}`).value;
  const reviewComment = document.getElementById(`comment-${bookId}`).value;

  try {
    await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: currentUser.email_id,
        book_id: bookId,
        rating: parseInt(rating),
        comment: reviewComment || null
      })
    });

    loadBooks();
  } catch (err) {
    console.error('Error submitting review:', err);
    alert('Error submitting review.');
  }
}

// Load Wishlist
async function loadWishlist() {
  try {
    const response = await fetch(`http://localhost:5000/api/wishlist/${currentUser.email_id}`);
    wishlist = await response.json();
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist();
  } catch (err) {
    console.error('Error loading wishlist:', err);
  }
}

// Add to Wishlist
async function addToWishlist(bookId) {
  if (!currentUser) {
    alert('Please sign in to add items to your wishlist.');
    window.location.href = 'index.html';
    return;
  }

  try {
    await fetch('http://localhost:5000/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: currentUser.email_id, book_id: bookId })
    });

    loadWishlist();
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    alert('Error adding to wishlist.');
  }
}

// Remove from Wishlist
async function removeFromWishlist(bookId) {
  try {
    await fetch('http://localhost:5000/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: currentUser.email_id, book_id: bookId })
    });

    wishlist = wishlist.filter(item => item.book_id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist();
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    alert('Error removing from wishlist.');
  }
}

// Display Wishlist
function displayWishlist() {
  const wishlistSection = document.getElementById('wishlistSection');
  const wishlistItemsDiv = document.getElementById('wishlistItems');

  if (wishlist.length === 0) {
    wishlistSection.style.display = 'none';
    return;
  }

  wishlistSection.style.display = 'block';
  wishlistItemsDiv.innerHTML = '';

  wishlist.forEach(item => {
    const wishlistItem = document.createElement('div');
    wishlistItem.className = 'wishlist-item';
    wishlistItem.innerHTML = `
      <img src="${item.image_url}" alt="${item.name}">
      <span>${item.name}</span>
      <span>₹${item.price}</span>
      <button onclick="removeFromWishlist(${item.book_id})">Remove</button>
    `;
    wishlistItemsDiv.appendChild(wishlistItem);
  });
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
  localStorage.removeItem('wishlist');
  cart = [];
  wishlist = [];
  currentUser = null;
  const signInBtn = document.getElementById('signInBtn');
  const signUpBtn = document.getElementById('signUpBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  signInBtn.classList.remove('hidden');
  signUpBtn.classList.remove('hidden');
  logoutBtn.classList.add('hidden');
  window.location.href = 'index.html';
}

// Initialize the page
function init() {
  console.log('init called');
  updateNavbar();
  loadBooks();
  document.getElementById('paymentMethod').addEventListener('change', toggleQrCodeDisplay);
  document.getElementById('searchBar').addEventListener('keyup', filterBooks);
  document.getElementById('genreFilter').addEventListener('change', filterBooks);
  document.getElementById('sortFilter').addEventListener('change', filterBooks);
  toggleQrCodeDisplay();
}

document.addEventListener('DOMContentLoaded', init);
 
    



  
    
