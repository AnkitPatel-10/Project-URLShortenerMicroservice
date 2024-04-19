require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const URL = require('url').URL;
const dns = require('dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const originalUrls = [];
const shortUrls = [];

app.post("/api/shorturl/", (req, res) => {

  const url = req.body.url;
  const urlObject = new URL(url);

  dns.lookup(urlObject.hostname , (err, address, family) => {

    if (err) {
      return res.json({
        error: 'invalid url'
       });
      }

    else {

      const foundUrlIndex = originalUrls.indexOf(url);

      if (foundUrlIndex < 0) {
        originalUrls.push(url);
        shortUrls.push(shortUrls.length);

        return res.json(
          {
            original_url : url,
            short_url : shortUrls.length - 1
          });
      }

      return res.json({
        original_url : url,
        short_url : shortUrls[foundUrlIndex]
      });

    }

  });

});

app.get("/api/shorturl/:shorturl" , (req , res) => {

  const shorturl = parseInt(req.params.shorturl);
  
  const foundUrlIndex = shortUrls.indexOf(shorturl);

  if(foundUrlIndex < 0)
  {
    return res.json(
      {
        error: "No short URL found for the given input"

      });
  }

  else if(isNaN(shorturl))
  {
    return res.json(
      {
        error:"Wrong format"

      });
  }

  res.redirect(originalUrls[foundUrlIndex]);

});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
