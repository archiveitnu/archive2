const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server:', err.stack);
    return;
  }

  console.log('Connected to MySQL server');

  connection.query(
    'CREATE DATABASE IF NOT EXISTS my_database',
    (err) => {
      if (err) {
        console.error('Error creating database:', err);
        connection.end();
        return;
      }

      console.log('Database created or already exists');

      connection.end((err) => {
        if (err) {
          console.error('Error closing initial connection:', err.stack);
          return;
        }

        const dbConnection = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          port: 3306,
          database: 'my_database'
        });

        dbConnection.connect((err) => {
          if (err) {
            console.error(
              'Error connecting to my_database:',
              err.stack
            );
            return;
          }

          console.log('Connected to my_database');

          dbConnection.query(
            `CREATE TABLE IF NOT EXISTS my_table (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255)
            )`,
            (err) => {
              if (err) {
                console.error('Error creating table:', err);
                dbConnection.end();
                return;
              }

              console.log('Table created or already exists');

              dbConnection.query(
                'INSERT INTO my_table (name) VALUES (?)',
                ['John Doe'],
                (err, results) => {
                  if (err) {
                    console.error('Error inserting record:', err);
                    dbConnection.end();
                    return;
                  }

                  console.log('Record inserted:', results);
                  
                  dbConnection.query(
                    'UPDATE my_table SET name = ? WHERE id = ?',
                    ['Devendra Vashi', 1],
                    (err, results) => {
                      if (err) {
                        console.error(
                          'Error updating record:',
                          err
                        );
                        dbConnection.end();
                        return;
                      }

                      console.log('Record updated:', results);

                      dbConnection.end((err) => {
                        if (err) {
                          console.error(
                            'Error closing connection:',
                            err.stack
                          );
                          return;
                        }

                        console.log('Connection closed');
                      });
                    }
                  );
                }
              );
            }
          );
        });
      });
    }
  );
});