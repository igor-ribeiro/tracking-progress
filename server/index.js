const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.post('/tracking', (req, res) => {
  const issues = [];
  const issuesFile = fs.createReadStream('./issues.json', { autoClose: true });

  issuesFile.on('data', (data) => issues.push(data.toString()));
  issuesFile.on('end', () => res.json(JSON.parse(issues.join(''))));

  return;

  const { username, password } = req.body;

  const query = {
    jql: 'project=GFG AND component=Tracking',
    maxResults: 100,
  };

  const options = {
    url: 'https://dafiti.jira.com/rest/api/2/search',
    method: 'POST',
    json: query,
    auth: {
      user: username,
      pass: password,
    },
  };

  request(options, (error, response, body) => {
    res.status(response.statusCode).send(body);
  });
});

app.listen(3333, () => console.log('Listening...'));