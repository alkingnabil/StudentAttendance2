require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { ADMIN_ACCOUNTS } = require('./config/adminSeed');
const Admin = require('./models/AdminAccount');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(morgan('dev'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tadreebi';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=> console.log('MongoDB connected')).catch(err => { console.error('MongoDB connection error', err); process.exit(1); });

// seed admin accounts
async function seedAdmins(){
  try{
    for (const [email, a] of Object.entries(ADMIN_ACCOUNTS)){
      let ex = await Admin.findOne({ email });
      if (!ex){
        const hash = await bcrypt.hash(a.password, 10);
        await Admin.create({ email, name: a.name, passwordHash: hash, groups: a.groups || [], role: a.role || 'admin' });
        console.log('Seeded admin', email);
      }
    }
  } catch (e){ console.error('Seed admin failed', e); }
}
seedAdmins();

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/masterlists', require('./routes/masterlists'));

// serve frontend static from ../frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server listening on', PORT));
