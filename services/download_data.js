const fs = require('fs');
const readXlsxFile = require('read-excel-file/node')
const XLSX = require('xlsx');


exports.insertData = (()=>{
//  Read the XLSX file
const workbook = XLSX.readFile('../Seats.xlsx');
// Replace with your XLSX file name

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
return formattedData;

}) 
