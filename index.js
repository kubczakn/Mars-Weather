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

async function makePostRequest() {
    for (i = 0; i < 7; ++i) {
        var solData = [];
        var res = await axios.post(url);
        var sol = res.data.sol_keys[i];
        var temp = res.data[sol].AT.av;
        var windSpeed = res.data[sol].HWS.av;
        var pressure = res.data[sol].PRE.av;
        var windDirection = res.data[sol].WD[2].compass_point;
        solData.push(temp);
        solData.push(windSpeed);
        solData.push(pressure);
        solData.push(windDirection);
        sols.push(solData);
        return 0;
    }
}
makePostRequest();

app.get('/', (req, res) => {
    res.render('main', {
        intro : null,
        marsTemp : null,
        marsWind : null,
        marsPressure : null, 
    });
})

app.post('/', (req, res) => {
    let chosenSol = req.body.sol;
    let introText = "Here's the weather on Mars's equator for this sol:"
    let tempText  = `It is ${sols[chosenSol][0]} degrees Fahrenheit.`;
    let windText = `The wind is blowing at a speed of ${sols[chosenSol][1]} m/s due ${sols[chosenSol][3]}.`;
    let pressureText = `Air pressure is roughly ${sols[chosenSol][2]} Pascals.`
    res.render('main', {
        intro : introText,
        marsTemp : tempText,
        marsWind : windText,
        marsPressure : pressureText,
    });
})

// POST Environment Varaible
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));