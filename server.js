//require express.js
const express = require('express');
const req = require('express/lib/request');
const { type } = require('express/lib/response');
const res = require('express/lib/response');
const fs = require('fs');
const path = require('path');

const { animals } = require('./data/animals.json');

//set port
const PORT = process.env.PORT || 3001;
//listen for request
const app = express();

//parse incoming string or array data
app.use(express.urlencoded({ extended: true}));
//parse incoming JSON data
app.use(express.json());

//filter function
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    let filteredResults = animalsArray;
    
    if (query.personalityTraits) {
        //saves personalityTraits as array
        //if it is a string, place in new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }

        //loop thru each trait in personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

//funciton to find by id
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

//function to add animal
function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

//add route
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }        
});

//post
app.post('/api/animals', (req, res) => {
    //set id for each new animal added
    req.body.id = animals.length.toString();

    //if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    }else {
    //add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
    }
});



//method to make server listen and chain it to a method
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});