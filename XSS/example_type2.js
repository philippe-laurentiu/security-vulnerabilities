// http://testaspnet.vulnweb.com/Comments.aspx?id=0

// Problem:
// The comment section allowes a Stored XSS (AKA Persistent or Type II) attack. 
// This securety breach allow mallicios code to be stored permanently on the website. 


// Exployed example:
// We simply add some JS code in the comment this code will run on all clients who read the comments.
// A good example is a loggin popup like follows

<script>
  let p = prompt("Enter password:", "");
  alert("TODO send password:" + p + "' to evil endpoint");
</script>

// or thrugh the html rendering
// <button onclick="console.log('do something evil')">Please hack me2</button>

// Fix:
// Since we are dealing with Stored XSS we have to sanitize the data we like to store: 

// 1
// The site http://testaspnet.vulnweb.com semes to use .net so the sanitizing will be something like 
// String Data = AntiXss.HtmlEncode(Request.QueryString["Data"]);

// 2
// For a node aplication you could install the sanitizer module 
// npm install sanitize or yarn add sanitizer 

let sanitizer = require('sanitize')();
let data = sanitizer.value(req.data, 'string');


// Notes: 
// Since the Stored XSS have the highest harm potential I used it as an example. 
// But you can find reflected XSS (AKA Non-Persistent or Type I) vulnarabilitys too

// Example: 

// http://testphp.vulnweb.com/comment.php?aid=1 in the artist name 
// http://testphp.vulnweb.com/search.php in the search field 
// todo




