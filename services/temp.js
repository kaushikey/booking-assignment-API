// const fs = require('fs');
// const readXlsxFile = require('read-excel-file/node')
// readXlsxFile(fs.createReadStream('../Seats.xlsx')).then((rows) => {
//     const [id] = rows;
//     console.log(id);
//     console.log(rows[1]);
//   });

//   const XLSX = require('xlsx');

//   // Read the XLSX file
//   const workbook = XLSX.readFile('../Seats.xlsx'); // Replace with your XLSX file name
  
//   // Select the first sheet
//   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
//   // Convert the sheet data to JSON format
//   const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
//   console.log('monu',jsonData);
  
// // Database connection configuration
// // const connection = mysql.createConnection({
// //   host: 'localhost',
// //   user: 'your_username',
// //   password: 'your_password',
// //   database: 'your_database'
// // });



// // fs.createReadStream('./').pipe(csv()).on('data', (row) => {
// //     // const insertQuery = `
// //     //   INSERT INTO seats_list VALUES (?, ?, ?, ?)`; 

// //     // con.query(insertQuery, [row.id, row.seat_identifier, row.class_class, 0], (err) => {
// //     //   if (err) {
// //     //     console.error('Error inserting data:', err);
// //     //     return;
// //     //   }

// //     //   console.log('Data inserted:', row);
// //     // });
// //   })







// // // Connect to the database
// // // connection.connect((err) => {
// // //   if (err) {
// // //     console.error('Error connecting to the database:', err);
// // //     return;
// // //   }

// // //   console.log('Connected to the database');

// // //   // Create a table to store the data
// // //   const createTableQuery = `
// // //     CREATE TABLE IF NOT EXISTS your_table (
// // //       column1 VARCHAR(255),
// // //       column2 INT,
// // //       column3 FLOAT
// // //     )
// // //   `; // Replace with your table name and column definitions

// // //   connection.query(createTableQuery, (err) => {
// // //     if (err) {
// // //       console.error('Error creating table:', err);
// // //       return;
// // //     }

// // //     console.log('Table created');

// // //     // Read the CSV file and upload the data
// // //     fs.createReadStream('your_data.csv') // Replace with your CSV file name
// // //       .pipe(csv())
// // //       .on('data', (row) => {
// // //         // Insert the data into the table
// // //         const insertQuery = `
// // //           INSERT INTO your_table (column1, column2, column3)
// // //           VALUES (?, ?, ?)
// // //         `; // Assuming the CSV columns match the table columns

// // //         connection.query(insertQuery, [row.column1, row.column2, row.column3], (err) => {
// // //           if (err) {
// // //             console.error('Error inserting data:', err);
// // //             return;
// // //           }

// // //           console.log('Data inserted:', row);
// // //         });
// // //       })
// // //       .on('end', () => {
// // //         console.log('Data upload completed');

// // //         // Close the database connection
// // //         connection.end();
// // //       });
// // //   });
// // // });

const XLSX = require('xlsx');

// Read the XLSX file
const workbook = XLSX.readFile('../Seats.xlsx'); // Replace with your XLSX file name

// Select the first sheet
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert the sheet data to JSON format
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
// Get the header row
const headerRow = jsonData[0];

// Format the data based on the header
const formattedData = jsonData.slice(1).map((row) => {
  const formattedRow = {};

  for (let i = 0; i < headerRow.length; i++) {
    const header = headerRow[i];
    const value = row[i];

    formattedRow[header] = value;
  }

  return formattedRow;
});

console.log(formattedData);