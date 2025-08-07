Bookshop Automation System
Welcome to the Bookshop Automation System, a web-based application designed to manage a bookshop's operations, including user registration, book browsing, cart management, and checkout functionality. This project leverages Node.js, Express, MySQL, and a simple HTML frontend with Tailwind CSS for styling.
Features

User Management: Register new users and log in with email and password.
Book Catalog: Browse a collection of 50 preloaded books with details like name, author, genre, price, discount, rating, and description.
Search Functionality: Search books by name, author, or genre.
Cart Management: Add books to the cart, update quantities, and remove items.
Checkout Process: Support for Google Pay, Credit Card, and Debit Card payments with receipt generation.
Receipt Tracking: View transaction and payment status, including QR code generation for Google Pay.

Prerequisites

Node.js: Version 14.x or higher.
MySQL: Version 5.7 or higher.
npm: Comes with Node.js installation.
QRCode Library: For generating QR codes during Google Pay transactions.

Installation

Clone the Repository:
git clone https://github.com/your-username/bookshop-automation.git
cd bookshop-automation


Install Dependencies:
npm install express cors mysql2 qrcode


Set Up MySQL Database:

Install MySQL and start the server.
Create a database named bookshop:CREATE DATABASE bookshop;


Update the database connection details in server.js:
host: 127.0.0.1 (or your MySQL host).
port: 3306 (default MySQL port).
user: root (or your MySQL username).
password: Aarthi@data24 (or your MySQL password).
Ensure the database user has permissions to create tables.




Run the Application:
node server.js

The server will start on http://localhost:5000.


Usage

Access the Application:
Open index.html in a web browser or serve it via a local web server (e.g., using


