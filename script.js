const books = [
    { title: "The Alchemist", author: "Paulo Coelho", price: 12.99 },
    { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: 15.50 },
    { title: "1984", author: "George Orwell", price: 10.75 },
  ];
  
  let cart = [];
  
  window.onload = () => {
    renderBooks(books); // Display all books initially
  
    const cartItems = document.getElementById("cart-items");
    if (cartItems) {
      displayCart(cartItems);
    }
  };
  
  // 👉 1. Renders books to the page
  function renderBooks(bookArray) {
    const bookList = document.getElementById("book-list");
    if (!bookList) return;
  
    bookList.innerHTML = "";
  
    bookArray.forEach((book, index) => {
      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <h3>${book.title}</h3>
        <p>by ${book.author}</p>
        <p>Price: $${book.price}</p>
        <button onclick="addToCart(${index})" class="btn">Add to Cart</button>
      `;
      bookList.appendChild(card);
    });
  }
  
  // 👉 2. Handles adding to cart
  function addToCart(index) {
    cart.push(books[index]);
    alert(`${books[index].title} added to cart!`);
  }
  
  // 👉 3. Search function (this is the one you asked about)
  function searchBooks() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
    renderBooks(filtered);
  }
  
  // 👉 4. Display cart items
  function displayCart(container) {
    if (cart.length === 0) {
      container.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      container.innerHTML = "";
      cart.forEach((item, i) => {
        const itemEl = document.createElement("div");
        itemEl.innerHTML = `<p>${item.title} - $${item.price}</p>`;
        container.appendChild(itemEl);
      });
    }
  }
  
  // 👉 5. Checkout button action
  function checkout() {
    alert("Proceeding to checkout...");
  }
  



  
    