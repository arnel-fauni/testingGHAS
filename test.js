const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// VULNERABILITY 1: Reflected XSS (CodeQL detects unsanitized req.query/req.params in responses)
app.get('/search', (req, res) => {
  const query = req.query.q;  // User-controlled input, no sanitization
  res.send(`Search results for: <h1>${query}</h1>`);  // XSS via HTML injection
});

// VULNERABILITY 2: Path traversal (CodeQL flags unsafe path.join with user input)
app.get('/file', (req, res) => {
  const filename = req.query.file || 'example.txt';  // Attacker can use '../etc/passwd'
  const filePath = path.join(__dirname, filename);   // No basename() or validation
  const content = fs.readFileSync(filePath, 'utf8');
  res.send(content);
});

// VULNERABILITY 3: Prototype pollution (Common in lodash or direct Object.assign misuse)
app.post('/config', express.json(), (req, res) => {
  const userConfig = req.body;
  const defaults = { theme: 'light' };
  Object.assign(defaults, userConfig);  // Pollution via __proto__ = { admin: true }
  res.json(defaults);
});

// VULNERABILITY 4: NoSQL injection (MongoDB-like query construction)
app.get('/users', (req, res) => {
  const username = req.query.user;
  const query = { username: username };  // Direct injection: ?user={"$ne": null}
  // db.collection('users').find(query) - would return all users
  res.json({ query });  // Demo only
});

// VULNERABILITY 5: Hardcoded secret (CodeQL secret scanning)
const SECRET_KEY = 'sk_live_12345abcde';  // Exposed API key pattern

app.get('/', (req, res) => {
  res.send(`Vulnerable app running. Secret: ${SECRET_KEY}`);
});

app.listen(port, () => {
  console.log(`Vulnerable app on http://localhost:${port}`);
});
