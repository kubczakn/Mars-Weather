const Joi = require('@hapi/joi');
const express = require('express');
const app = express();
const axios = require('axios').default;

const apiKey = 'MbmiM3rQcY20x4HTBDEXzg6ecDMsjOULRMf8IKJS';

const url = 'https://api.nasa.gov/planetary/apod?api_key=MbmiM3rQcY20x4HTBDEXzg6ecDMsjOULRMf8IKJS';
/*
const params = {
    access_key: apiKey,
    query: '259'
}
*/
// Enables parsing of JSON objects in body of request
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

axios.get(url)
    .then(response => {
        const apiResponse = response.data;
        console.log(apiResponse);
    }).catch(error => {
        console.log(error);
    });

app.delete('/', (req, res) => {

});

app.put('/', (req,res) => {

});


app.post('/', (req, res) => {  
    
});

// POST Environment Varaible
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

function validate(item) {
    const schema = Joi.object({

    }).required();

    return schema.validate(item);
}