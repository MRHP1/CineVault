import https from 'https';

let TMDB_API_KEY = '';

export function setApiKey(key) {
  TMDB_API_KEY = key;
}

export function searchMovie(query) {
  return new Promise((resolve, reject) => {
    if (!TMDB_API_KEY) return reject(new Error('TMDB API Key not set'));
    
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

export function searchSeries(query) {
  return new Promise((resolve, reject) => {
    if (!TMDB_API_KEY) return reject(new Error('TMDB API Key not set'));
    
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}
