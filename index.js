const Joi = require('@hapi/joi');
const express = require('express');
const app = express();
const axios = require('axios').default;
const bodyParser = require('body-parser');
const { request } = require('express');
const schedule = require('node-schedule');

const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Jghs121410",
   // database : "tempdb"
   database : "tempdb"
});






const apiKey = 'MbmiM3rQcY20x4HTBDEXzg6ecDMsjOULRMf8IKJS';

const url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;

app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const sols = [];
const week = [];
const sol_keys = [];

function addDates() {
    var current_date = new Date();
    var current_month = current_date.getMonth();
    var current_day = current_date.getDate();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"];
    var date;
    for (j = 0; j < 7; ++j) {
        if ((current_day - j) <= 0 ) {
            if ((current_month - 1) % 2 == 0) {
                date = months[current_month - 1] + ' ' + (31 + (current_day - j));
                week.push(date);
            }
            else {
                date = months[current_month - 1] + ' ' + (30 + (current_day - j));
                week.push(date);
            }
        }
        else {
            date = months[current_month] + ' ' + (current_day - j);
            week.push(date);
        }
       
    }
}

async function makePostRequest() {
    for (i = 6; i >= 0; --i) {
        var solData = [];
        var res = await axios.post(url);
        var sol = res.data.sol_keys[i];
        sol_keys.push(sol);
        var average_temp = res.data[sol].AT.av;
        var high_temp = res.data[sol].AT.mx;
        var low_temp = res.data[sol].AT.mn;
        var windSpeed = res.data[sol].HWS.av;
        var pressure = res.data[sol].PRE.av;
        var windDirection = res.data[sol].WD.most_common.compass_point;
        solData.push(Math.round(high_temp));
        solData.push(Math.round(low_temp));
        solData.push(Math.round(average_temp));
        solData.push(Math.round(windSpeed));
        solData.push(Math.round(pressure));
        solData.push((windDirection));
        solData.push(Math.round(average_temp));
        sols.push(solData);
        
    }
}




makePostRequest();
addDates();

app.get('/', (req, res) => {
    res.render('main', {
        intro : null,
        fahrenehit : null,
        celsius : null,
        marsTemp : null,
        marsWind : null,
        marsPressure : null,
        tempData : null, 
        week : week,
        yAxes : null
    });
})

/*
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
    con.query("SELECT * FROM temps_celsius", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});
*/

/*
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
    var sql = "DELETE FROM temps_celsius WHERE date = 'Jul 26'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log('Deleted');
    });
});
*/


app.post('/', (req, res) => {

    
    
    var marsTemp;
    var yAxes;
    const request = req.body;
    var tempData = [];
    
    let chosenSol = req.body.sol;
    
    var time = new Date().getHours();
    if (time >= 0 && time < 1 ) {
        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected");
            var sql = "INSERT INTO temps_celsius (date, temp) VALUES ?";
            var values = [
                [week[0], sols[0][2] - 32]
            ];
            con.query(sql, [values], function (err, result) {
                if (err) throw err;
                console.log('Inserted data')
            }); 
        });
    }
    
    let introText = `Here's the weather on Mars's equator for Sol ${sol_keys[chosenSol]} or ${week[req.body.sol]}`;
    if (request.f == 1) {
        marsTemp = `High of ${sols[chosenSol][0]} degrees Fahrenheit. Low of ${sols[chosenSol][1]} degrees Fahrenheit. Avg of ${sols[chosenSol][6]} degrees Fahrenheit. `;
        for (i = 0; i != sols.length; ++i) {
            tempData.push(sols[i][2]);
            yAxes = 'Degrees Fahrenheit'
        }
    }
    else {
        marsTemp = `High of ${sols[chosenSol][0] - 32} degrees Celsius. Low of ${sols[chosenSol][1] - 32} degrees Celsius. Avg of ${sols[chosenSol][6] - 32} degrees Celsius. `;
        for (i = 0; i != sols.length; ++i) {
            tempData.push(sols[i][2] - 32);
            yAxes = 'Degrees Celsius';
        }
    }
    let tempFahrenheit  = `High of ${sols[chosenSol][0]} degrees Fahrenheit. Low of ${sols[chosenSol][1]} degrees Fahrenheit. Avg of ${sols[chosenSol][6]} degrees Fahrenheit. `;
    let tempCelsius  = `High of ${sols[chosenSol][0] - 32} degrees Celsius. Low of ${sols[chosenSol][1] - 32} degrees Celsius. Avg of ${sols[chosenSol][6] - 32} degrees Celsius. `;
    let windText = `The wind is blowing on average at a speed of ${sols[chosenSol][3]} m/s due ${sols[chosenSol][5]}.`;
    let pressureText = `Air pressure is on average ${sols[chosenSol][4]} Pascals.`;
    res.render('main', {
        intro : introText,
        fahrenheit : tempFahrenheit,
        celsius : tempCelsius,
        marsTemp : marsTemp,
        marsWind : windText,
        marsPressure : pressureText,
        tempData : tempData,
        week : week,
        yAxes : yAxes
    });

    
})



// POST Environment Varaible
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));