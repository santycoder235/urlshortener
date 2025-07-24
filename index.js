require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let urls = [];

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  if (!/^https?:\/\//.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const hostname = urlParser.parse(originalUrl).hostname;

    dns.lookup(hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      const short_url = urls.length + 1;
      urls.push({ original_url: originalUrl, short_url });

      res.json({ original_url: originalUrl, short_url });
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const found = urls.find(entry => entry.short_url === id);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
