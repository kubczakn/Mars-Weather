const Joi = require('@hapi/joi');
const express = require('express');
const app = express();
const axios = require('axios').default;
const bodyParser = require('body-parser');

const apiKey = 'MbmiM3rQcY20x4HTBDEXzg6ecDMsjOULRMf8IKJS';

const url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const solData = [];

async function makePostRequest() {
    let res = await axios.post(url);
    let sol = res.data.sol_keys[6];
    let temperature = res.data[sol].AT.av;
    let windSpeed = res.data[sol].HWS.av;
    let pressure = res.data[sol].PRE.av;
    let windDirection = res.data[sol].WD.av;
    let datum = {
        id: solData.length + 1,
        sol: sol,
        temperature: temperature,
        windSpeed: windSpeed,
        pressure: pressure,
        windDirection: windDirection
    }
    solData.push(datum);
}

app.get('/', (req, res) => {
    res.send(solData);
})

app.post('/', (req, res) => {
    makePostRequest();
    res.send(solData);
})

// POST Environment Varaible
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));