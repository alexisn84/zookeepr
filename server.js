//require express.js
const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');

//set port
const PORT = process.env.PORT || 3001;
//listen for request
const app = express();

const { animals } = require('./data/animals.json');

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
};

//funciton to find by id
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
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

//method to make server listen and chain it to a method
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});