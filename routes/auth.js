const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const supabase = require('../lib/supabase');
const path = require('path');

// GET /login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.redirect('/login?error=missing');
    }

    const { data: artist, error } = await supabase
      .from('artists')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !artist) {
      return res.redirect('/login?error=invalid');
    }

    const match = await bcrypt.compare(password, artist.password_hash);
    if (!match) {
      return res.redirect('/login?error=invalid');
    }

    req.session.artistId = artist.id;
    req.session.artistName = artist.name;

    const next = req.query.next || `/dashboard/${artist.id}`;
    res.redirect(next);
  } catch (err) {
    console.error(err);
    res.redirect('/login?error=server');
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// POST /api/artists/register — create artist account (protected: add your own access control)
router.post('/api/artists/register', async (req, res) => {
  try {
    const { name, email, password, wave_api_key } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('artists')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: hash,
        wave_api_key: wave_api_key || null
      })
      .select('id, name, email')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw error;
    }

    res.status(201).json({ artist: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
