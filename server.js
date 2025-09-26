const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let leaderboard = [];

// GET leaderboard
app.get('/leaderboard', (req, res) => {
  res.json(leaderboard.sort((a, b) => b.score - a.score).slice(0, 10));
});

// POST score
app.post('/submit', (req, res) => {
  const { username, score } = req.body;

  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid submission' });
  }

  const existing = leaderboard.find(p => p.username === username);
  if (existing) {
    existing.score = Math.max(existing.score, score);
  } else {
    leaderboard.push({ username, score });
  }

  res.json({ message: 'Score submitted' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}

module.exports = app; // 👈 Add this
