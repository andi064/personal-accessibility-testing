const axios = require('axios');
const readline = require('readline');

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const resultsPerPage = 10;

let query = '';
let page = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
  rl.question('\nSearch Google Books: ', (input) => {
    query = input.trim();
    if (!query) {
      console.log('Please enter a valid search term.');
      promptUser();
    } else {
      page = 0;
      fetchResults();
    }
  });
}

async function fetchResults() {
  const startIndex = page * resultsPerPage;
  const start = Date.now();

  try {
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: query,
        startIndex,
        maxResults: resultsPerPage
      }
    });

    const items = response.data.items || [];
    const totalItems = response.data.totalItems || 0;
    const responseTime = Date.now() - start;

    if (!items.length) {
      console.log('No results found.');
      return promptUser();
    }

    const authors = [];
    const dates = [];

    console.log(`\nPage ${page + 1}`);
    items.forEach((item, i) => {
      const info = item.volumeInfo;
      const authorList = info.authors || ['Unknown Author'];
      const title = info.title || 'No Title';
      authors.push(...authorList);
      if (info.publishedDate) dates.push(info.publishedDate);

      console.log(`${i + 1}. ${authorList.join(', ')} - ${title}`);
    });

    const authorCount = {};
    authors.forEach((a) => authorCount[a] = (authorCount[a] || 0) + 1);
    const topAuthor = Object.entries(authorCount).sort((a, b) => b[1] - a[1])[0][0];

    const validYears = dates
      .map(d => parseInt(d.slice(0, 4)))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b);

    console.log(`\nTotal Results: ${totalItems}`);
    console.log(`Top Author: ${topAuthor}`);
    console.log(`Oldest Publication: ${validYears[0] || 'Unknown'}`);
    console.log(`Newest Publication: ${validYears[validYears.length - 1] || 'Unknown'}`);
    console.log(`Server Response Time: ${responseTime}ms`);

    rl.question('\nEnter number to view description, n for next page, p for previous, q to quit: ', (input) => {
      if (input === 'q') {
        rl.close();
      } else if (input === 'n') {
        page++;
        fetchResults();
      } else if (input === 'p') {
        page = Math.max(0, page - 1);
        fetchResults();
      } else {
        const index = parseInt(input) - 1;
        if (index >= 0 && index < items.length) {
          const description = items[index].volumeInfo.description || 'No description available.';
          console.log(`\n${description}`);
        } else {
          console.log('Invalid selection.');
        }
        fetchResults();
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    rl.close();
  }
}

promptUser();
