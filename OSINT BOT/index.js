const fs = require('fs');   //for working with file system
const util = require('util');       //utility functions
const writeFile = util.promisify(fs.writeFile);     //converts callback-based functions to promise-based functions.

const searchGoogle = require('./googleSearch'); 
const searchBing = require('./bingSearch');
const searchYahoo = require('./yahooSearch');
//const searchDDG = require('./ddgSearch');
const searchTerm = 'Akshaj Vidyarthy';

(async () => {
    try{
        const googleResults = await searchGoogle(searchTerm);
        const bingResults = await searchBing(searchTerm);
        const yahooResults = await searchYahoo(searchTerm);
        //const ddgResults = await searchDDG(searchTerm);

        console.log('Google Response: ');
        console.log('_____________');
        console.log('_____________');
        for (let result of googleResults){
            console.log('Title: ', result.title);
            console.log('Link: ', result.link);
        }

        console.log('_____________');
        console.log('_____________');
        console.log('_____________');
        console.log('_____________');
        console.log('_____________');

        await writeFile('google_peopleinfo.txt', JSON.stringify(googleResults));

        console.log('Bing Response:');
        console.log('_____________');
        console.log('_____________');

        for (let result of bingResults){
            console.log('Title: ', result.title );
            console.log('Link: ', result.link);
        }

        console.log('_____________');
        console.log('_____________');
        console.log('_____________');
        console.log('_____________');
        console.log('_____________');

        await writeFile('bing_peopleinfo.txt', JSON.stringify(bingResults));

        console.log('Yahoo Response: ');
        console.log('_____________');
        console.log('_____________');

        for (let result of yahooResults){
            console.log('Title: ', result.title);
            console.log('Link: ', result.link);
            console.log('_____________');
        }
        await writeFile('yahoo_peopleinfo.txt', JSON.stringify(yahooResults));

        // console.log('DuckDuckGo Response: ');
        // console.log('_____________');
        // console.log('_____________');
        // for (let result of ddgResults){
        //     console.log('Title: ', result.title);
        //     console.log('Link: ', result.link);
        // }

        // console.log('_____________');
        // console.log('_____________');
        // console.log('_____________');
        // console.log('_____________');
        // console.log('_____________');

        // await writeFile('ddg_peopleinfo.txt', JSON.stringify(ddgResults));
    } catch(error){
        console.error('wrong in : ', error);
        
    }
    
})();

