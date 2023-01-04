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

