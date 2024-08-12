const puppeteer = require('puppeteer');

async function searchDDG(query){
    const ddgBrowser = await puppeteer.launch({headless: "new"});        //launching a search on the backend (non-visible)
    const ddgPage = await ddgBrowser.newPage();
    ddgPage.setDefaultNavigationTimeout(60000);
    await ddgPage.goto(`https://www.google.com/search?q=${query}`);

    //Now wait for search results to load
    await ddgPage.waitForSelector('#web-vertical');

    //now we extract the titles and the links 
    const ddgResults = await ddgPage.evaluate(() => {
        const resultElements = document.querySelectorAll('.wLL');
        const results = [];
        for (let element of resultElements){
            const titleElement = element.querySelector('span');
            const linkElement = element.querySelector('a');

            const title = titleElement ? titleElement.innerText : '';
            const link = linkElement ? linkElement.href : '';
            results.push({title, link});
        }
        return results;
    });
    // wait for browser to close
    await ddgBrowser.close();
    return ddgResults;
}
module.exports = searchDDG;