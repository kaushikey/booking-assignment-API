const router = require('express').Router();
const mysql = require('mysql');
const fs = require('fs');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "kaushikey"
});

con.connect((err) =>{
    if (err) console.log(err);
    console.log("Connected fine!");});


const mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{ 
            user: process.env.EMAIL, // Used dummy email to send mails
            pass: process.env.PASS  // password 
        }
})

const get_data_from_csv_file = ((filename)=>{
   
    const workbook = XLSX.readFile(`./${filename}`); 
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert the sheet data to JSON format
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
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
 
const insert_into_seats_list = (()=>{
    seats_list_data = get_data_from_csv_file('Seats.xlsx');
    console.log("seats_list_data",seats_list_data);
    seats_list_data.map((item)=>{
        con.query("INSERT INTO seats_list VALUES (?,?,?,?)",[item.id,item.seat_identifier,item.seat_class,0],(err,result)=>{
            if(err)
            console.log(err);
            else
            console.log("data entered");
        })
    })
    
});


const insert_into_seats_price =  ( ()=>{
    
    seats_list_data = get_data_from_csv_file('SeatPricing.xlsx');
    
    con.query("SELECT seat_class, COUNT(seat_class) AS count FROM seats_list WHERE is_booked = 0 GROUP BY seat_class;",(err,results)=>{
        
        seats_list_data.map((item)=>{
            var count = 0;
            results.map((row)=>{ if(row.seat_class == item.seat_class) count = row.count;})
            con.query("INSERT INTO seats_price VALUES (?,?,?,?,?,?,?)",[item.id,item.seat_class,item.min_price,item.normal_price,item.max_price,count,0],(err,result)=>{
                if(err)
                console.log(err);
                else
                console.log("data entered");
            })
        })
});
    
});

const chooose_price = ((results, percentage)=>{
    var price = 0; 
    if(percentage < 40)
    {
        results[0].min_price ? price = results[0].min_price : price = results[0].normal_price;
    }
    else if(percentage < 60)
    {
        results[0].normal_price ? price = results[0].normal_price : results[0].max_price;
    }
    else{
        results[0].max_price ? price = results[0].max_price : results[0].normal_price_price;
    }
    console.log("price",price);
    return price;

})


router.get('/',(req,res)=>{
    res.send("Working fine ");
})

router.get('/do_it_to_insert_data',(req,res)=>{
    
        var seat_list_sql = "CREATE TABLE seats_list(Id INT, seat_identifier VARCHAR(200) PRIMARY KEY, seat_class VARCHAR(10), is_booked BOOLEAN DEFAULT false)";
        var seat_price_sql = "CREATE TABLE seats_price(Id INT, seat_class VARCHAR(200) PRIMARY KEY, min_price VARCHAR(200), normal_price VARCHAR(200), max_price VARCHAR(200), total_seats INT, seats_booked INT DEFAULT 0 )";

        var bookings_sql = "CREATE TABLE bookings(booking_id VARCHAR(200) PRIMARY KEY, seats VARCHAR(255))";
        
        con.query(seat_list_sql, function (err, result) {
            if (err) console.log(err);
            else
            console.log("Table created1");
        });
        insert_into_seats_list();
        con.query(seat_price_sql, function (err, result) {
            if (err) console.log(err);
            else
            console.log("Table created2");
        });

        insert_into_seats_price();
        con.query(bookings_sql, function (err, result) {
            if (err) console.log(err);
            else
            console.log("Table created3");
        });
         
        res.send("Tables created");
    
});

router.get('/seats',(req,res) => {

        con.query("SELECT * FROM seats_list ORDER BY seat_class; ", (err,results) => {
            if (err)
            {
                console.log(err);
                res.send(err);
            }
            else{
                console.log("Result Received!"); 
                results.map((item)=> {console.log(item);})
            }
            res.send(results);
        
        });
        
});

router.get('/seats/:id',(req,res) => {
    id = req.params.id;
    var price = 0;
    con.query("SELECT * FROM seats_price WHERE id= ?",[id], (err,results) => {
      if (err) {
        console.log(err);
        res.send(err);
    }
       console.log("Result Received!",results); 
    });

    const seat_price_cal = (()=> {
        
        con.query("SELECT * FROM seats_price WHERE seat_class IN(SELECT seat_class FROM seats_list WHERE id = ? ) ",[id],(err,results)=>{
            if(err)
            {
                console.log(err);
                res.send(err);
            }           
            else
            {
                var percent = (results[0].seats_booked/results[0].seats_booked)*100;
                price  = chooose_price(results, percent);
                res.send(`working ${price}`);

            }
            
        })
     })
     seat_price_cal();
    

});


router.post('/booking',(req,res)=>{
    const seats_array = req.body.array;
    var key = '';
    var is_mail = 0;
    const user_phone_number = req.body.phoneNumber;
    const user_email = req.body.email;
    var is_mail = 0;
    console.log("data",seats_array,user_phone_number,user_email);
    if(user_email)
        {key = user_email;
        is_mail = 1}
    else if(user_phone_number)
        key = user_phone_number 
    else
        res.send("Enter Phone Number or Email");

    seats_not_available = [];
      
        con.query("SELECT * FROM seats_list WHERE Id IN (?)",[seats_array],(err,result)=>{
                if(err)
                 console.log(err);
                else
                 console.log(result); 
                var obj = {};
                result.map((e)=>{if(e.is_booked != 0) seats_not_available.push(e.Id);else { obj[e.seat_class] = obj[e.seat_class] + 1 || 1; }})
                console.log("data_object",obj);

                
                console.log('seats_not_available',seats_not_available);
                if(seats_not_available.length != 0)
                    {
                        res.send(`Seats ${seats_not_available} not available` + 'Please choose different seats')
                }
                else {
                    con.query("SELECT * FROM bookings WHERE booking_id = ?",[key], (err,result)=>{
                        if(err)
                         console.log(err);
                        else
                         {
                            if(result.length!==0)
                             res.send("Booking Id is already present")
                            else{
                                
                                con.query("UPDATE seats_list SET is_booked = 1 WHERE Id IN (?);",[seats_array],(err,results)=>{ 
                                    const placeholders = seats_array.map((e) => `"${e}"`).join(", ");
                                    
                                    let seat_class_keys = Object.keys(obj);

                                    seat_class_keys.forEach((number) => 
                                    con.query("UPDATE seats_price SET total_seats = total_seats - ? , seats_booked = seats_booked + ? WHERE seat_class = ?",[obj[number],obj[number],number],(err,results)=>{
                                        if(err)
                                        console.log(err);
                                        else
                                        console.log("data updates successfully");
                                    } ))
                                    
                                    con.query("INSERT INTO bookings values (?,?);",[key,placeholders],(err,results)=>{
                                        console.log('Booking deatils data',results);
                                    if(is_mail)
                                    {
                                        const details = {
                                            form: "Booked sucessfully <mudit@gmail.com> ",  
                                            to: key,
                                            subject: "Seat Booked for You",
                                            text: `Seats booked ${seats_array} See you there :)`
                                        }
                                          mailTransporter.sendMail(details,err =>{
                                              if(err)
                                              {
                                               console.log("Error Found",err);
                                              }
                                              else
                                              console.log(`email has sent to ${key}`);
                                           });

                                    }
                                    else
                                    console.log('no email found');
                                        res.send(`Seats booked ${seats_array} with booking Id ${key}`);
                                    })
                                })
                                
                            }
                         }
                    })
                }

        })
    
         

})

router.get('/bookings',(req,res)=>{
    var userIdentifier = req.query.userIdentifier;
    console.log(userIdentifier);
    con.query("SELECT seats FROM bookings WHERE booking_id = ?",[userIdentifier],(err,results)=>{
       if(err)
       console.log(err);
       else
       {console.log("working");
       res.send(results);}
    })
    
})

module.exports = router
