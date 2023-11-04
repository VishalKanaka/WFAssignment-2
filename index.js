// Require necessary dependencies
var express = require('express');
var path = require('path');
var app = express();
const exphbs = require('express-handlebars');
const fs = require('fs');
const bodyParser = require('body-parser');
const handlebars= require('handlebars');
app.use(bodyParser.json());


app.use(bodyParser.urlencoded({ extended: true }));
exphbs.create().handlebars.registerHelper('getProperty', function(object, property) {
    return object[property];
  });

  exphbs.create().handlebars.registerHelper('gt', function(a,b, options) {
    return a > b;
  });
 
  exphbs.create().handlebars.registerHelper('replaceZero', function (rating, options) {
    if (rating === 0) {
      return new handlebars.SafeString('<span class="highlight">zero</span>');
    }
    return rating;
  });
 
exphbs.create().handlebars.registerHelper('eq', function(a,b) {
    return a == b;
  });
  

  app.engine('hbs',exphbs.engine);
  app.set('view engine', 'hbs');
  




// Define the port 
const port = process.env.PORT || 3000;

// Serve static files (CSS, images) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Express to use Handlebars as the view engine
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

// Define a route to render the home page i.e "index"
app.get('/', function(req, res) {
  res.render('index', { title: 'Contents' });
});

// Define a route for a resource that sends a simple response
app.get('/users', function(req, res) {
  res.send('respond with a resource');
});

let jsonData;

//reading JSON File
fs.readFile('ite5315-A1-Car_sales.json', 'utf8', (err, data) => {
    if (err) {
    console.error(err);
    return;
  }

  try {
    jsonData = JSON.parse(data);
    console.log('JSON data is loaded and ready!');
  } catch (parseError) {
    console.error('Error parsing JSON data:', parseError);
  }
});
// Step 6
app.get('/data', (req, res) => {
    if (jsonData) {
      res.status(200).render('data', { message:'JSON data is loaded and ready!' });
    } else {
      res.status(500).render('error', { title: 'Error', message: 'JSON data not loaded' });
    }
    
  });
  
  // Step 6
  app.get('/data/invoiceNo/:index', (req, res) => {
    const index = req.params.index;
  
    if (!jsonData) {
      res.status(500).render('error', { title: 'Error', message: 'JSON data not loaded' });
      return;
    }
  
    if (index < 0 || index >= jsonData.carSales.length) {
      res.status(404).render('error', { title: 'Error', message: 'Index out of range' });
      return;
    }
  
    const invoiceNo = jsonData.carSales[index]?.InvoiceNo;
    console.log(jsonData.carSales[index]?.InvoiceNo);
    res.status(200).render('invoice', { InvoiceNo: 'InvoiceNo: '+`${invoiceNo}` });
  });

  // Step 6 - Handle GET request
app.get('/search/invoiceNo', async (req, res) => {
    res.status(200).render('searchInvoice');
  });
  
// Step 6 - Handle POST request
app.post('/search/invoiceNo', (req, res) => {
    console.log(req.body.invoiceNo);
    const enteredInvoiceNo = req.body.invoiceNo;
    console.log(req.body.invoiceNo);
    if (!jsonData) {
      res.status(500).send('JSON data not loaded');
      return;
    }
  
    const carSalesInfo = jsonData.carSales.find((item) => item.InvoiceNo === enteredInvoiceNo);
  
    if (carSalesInfo) {
      res.status(200).render('SearchInvoiceResult', {
        InvoiceNo: enteredInvoiceNo,
        carSalesInfo: {
          InvoiceNo: carSalesInfo.InvoiceNo,
          Manufacturer: carSalesInfo.Manufacturer,
          Model: carSalesInfo.Model,
          Sales_in_thousands: carSalesInfo.Sales_in_thousands,
          Vehicle_type: carSalesInfo.Vehicle_type,
          Price_in_thousands: carSalesInfo.Price_in_thousands,
          Engine_size: carSalesInfo.Engine_size,
          Horsepower: carSalesInfo.Horsepower,
          Wheelbase: carSalesInfo.Wheelbase,
          Width: carSalesInfo.Width,
          Length: carSalesInfo.Length,
          Curb_weight: carSalesInfo.Curb_weight,
          Fuel_capacity: carSalesInfo.Fuel_capacity,
          Fuel_efficiency: carSalesInfo.Fuel_efficiency,
          Latest_Launch: carSalesInfo.Latest_Launch,
          Power_perf_factor: carSalesInfo.Power_perf_factor
        }
      });
    } else {
      res.status(404).send('InvoiceNo not found');
    }
  });
  
  
  // Step 6

app.get('/search/Manufacturer', (req, res) => {
    res.render('SearchManufacturerForm');
  });
app.post('/search/Manufacturer', (req, res) => {
    const enteredMan = req.body.Manufacturer;
  
    if (!jsonData || !jsonData.carSales) {
      res.status(500).send('JSON data not loaded');
      return;
    }
  
    const matchingCars = jsonData.carSales.filter((car) =>
      car.Manufacturer.toLowerCase().includes(enteredMan.toLowerCase())
    );
  
    if (matchingCars.length > 0) {
      res.render('searchManufacturerResult', { matchingCars, enteredMan });
    } else {
      res.status(404).send('No cars found for the manufacturer: ' + enteredMan);
    }
  });

  let jsonData2;
  fs.readFile('SuperSales.json', 'utf8', (err, data) => {
    if (err) {
    console.error(err);
    return;
  }

  try {
    jsonData2 = JSON.parse(data);
    console.log('JSON data is loaded and ready!');
  } catch (parseError) {
    console.error('Error parsing JSON data:', parseError);
  }
});
//  Step-7,8,9 the "/viewData" route
app.get('/viewData', (req, res) => {
    res.render('salesData', {
      salesData: jsonData2
      
    });
  });
  

// Catch-all route for handling undefined routes or errors
app.get('*', function(req, res) {
  res.render('error', { title: 'Error', message: 'Wrong Route' });
});

// Start the Express application and listen on the specified port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
