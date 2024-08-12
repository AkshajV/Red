const puppeteer = require('puppeteer');

async function searchGoogle(query){
    const googleBrowser = await puppeteer.launch({headless: "new"});        //launching a search on the backend (non-visible)
    const googlePage = await googleBrowser.newPage();
    googlePage.setDefaultNavigationTimeout(60000);
    await googlePage.goto(`https://www.google.com/search?q=${query}`);

    //Now wait for search results to load
    await googlePage.waitForSelector('#search');

    //now we extract the titles and the links 
    const googleResults = await googlePage.evaluate(() => {
        const resultElements = document.querySelectorAll('.g');
        const results = [];
        for (let element of resultElements){
            const titleElement = element.querySelector('h3');
            const linkElement = element.querySelector('a');

            const title = titleElement ? titleElement.innerText : '';
            const link = linkElement ? linkElement.href : '';
            results.push({title, link});
        }
        return results;
    });
    // wait for browser to close
    await googleBrowser.close();
    return googleResults;
}
module.exports = searchGoogle;