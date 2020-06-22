const Joi = require('@hapi/joi');
const express = require('express');
const app = express();
const axios = require('axios').default;
const bodyParser = require('body-parser');

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
                date = months[current_month - 1] + ' ' (31 + (current_day - j));
            }
            else {
                date = months[current_month - 1] + ' ' (30 + (current_day - j));
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
        var windDirection = res.data[sol].WD[2].compass_point;
        solData.push(Math.round(high_temp));
        solData.push(Math.round(low_temp));
        solData.push(Math.round(average_temp));
        solData.push(Math.round(windSpeed));
        solData.push(Math.round(pressure));
        solData.push(Math.round(windDirection));
        solData.push(Math.round(average_temp));
        sols.push(solData);
        
    }
    
}
makePostRequest();
addDates();

app.get('/', (req, res) => {
    res.render('main', {
        intro : null,
        marsTemp : null,
        marsWind : null,
        marsPressure : null,
        tempData : null, 
        week : week
    });
})

app.post('/', (req, res) => {
    var tempData = [];
    for (i = 0; i != sols.length; ++i) {
        tempData.push(sols[i][2]);
    }
    let chosenSol = req.body.sol;
    let introText = `Here's the weather on Mars's equator for Sol ${sol_keys[chosenSol]} or ${week[req.body.sol]}`;
    let tempText  = `High of ${sols[chosenSol][0]} degrees Fahrenheit.\n Low of ${sols[chosenSol][1]} degrees Fahrenheit.\n Avg of ${sols[chosenSol][6]} degrees Fahrenheit. `;
    let windText = `The wind is blowing on average at a speed of ${sols[chosenSol][3]} m/s due ${sols[chosenSol][5]}.`;
    let pressureText = `Air pressure is on average ${sols[chosenSol][4]} Pascals.`;
    res.render('main', {
        intro : introText,
        marsTemp : tempText,
        marsWind : windText,
        marsPressure : pressureText,
        tempData : tempData,
        week : week
    });
})

// POST Environment Varaible
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));