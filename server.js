/* ==============================================
   IMPORTS & CONFIGURATION
   ============================================== */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');

const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  openWeatherMapApiKey: process.env.OPENWEATHERMAP_API_KEY || '',
  db: {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || 'database.sqlite'
  },
  superUser: {
    username: process.env.SUPERUSER_USERNAME || 'admin',
    password: process.env.SUPERUSER_PASSWORD || 'password'
  }
};

/* ==============================================
   DATABASE INITIALIZATION
   ============================================== */
const sequelize = new Sequelize({
  dialect: config.db.dialect,
  storage: config.db.storage,
  logging: console.log
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

/* ==============================================
   MODEL DEFINITIONS
   ============================================== */
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' }
});

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false },
  day: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  info: { type: DataTypes.TEXT },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
  files: { type: DataTypes.TEXT }
});

const Hotel = sequelize.define('Hotel', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  info: { type: DataTypes.TEXT },
  checkIn: { type: DataTypes.DATE, allowNull: false },
  checkOut: { type: DataTypes.DATE, allowNull: false },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
  files: { type: DataTypes.TEXT }
});

const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  category: { type: DataTypes.STRING },
  lat: { type: DataTypes.FLOAT },
  lng: { type: DataTypes.FLOAT }
});

const Todo = sequelize.define('Todo', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  dueDate: { type: DataTypes.DATE },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

/* ==============================================
   EXPRESS APP INITIALIZATION
   ============================================== */
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ==============================================
   MULTER CONFIGURATION FOR FILE UPLOADS
   ============================================== */
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: multerStorage });

/* ==============================================
   ACTIVITY ENDPOINTS
   ============================================== */
// GET Activities
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.findAll();
    res.json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Error fetching activities' });
  }
});

// POST Activity
app.post('/api/activities', upload.array('files'), async (req, res) => {
  console.log('POST /api/activities called');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  try {
    const { name, day, location, info, lat, lng } = req.body;
    const filesData = req.files && req.files.length > 0
      ? JSON.stringify(req.files.map(file => ({ filename: file.filename, originalname: file.originalname })))
      : null;
    const activity = await Activity.create({
      name,
      day,
      location,
      info,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      files: filesData
    });
    console.log('New activity created:', activity.toJSON());
    res.json(activity);
  } catch (err) {
    console.error('Error creating activity:', err);
    res.status(500).json({ error: 'Error creating activity' });
  }
});

// PUT Activity
app.put('/api/activities/:id', upload.array('files'), async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    const { day, location, info, lat, lng } = req.body;
    const filesData = req.files && req.files.length > 0
      ? JSON.stringify(req.files.map(file => ({ filename: file.filename, originalname: file.originalname })))
      : activity.files;
    activity.day = day;
    activity.location = location;
    activity.info = info;
    activity.lat = parseFloat(lat);
    activity.lng = parseFloat(lng);
    activity.files = filesData;
    await activity.save();
    console.log('Activity updated:', activity.toJSON());
    res.json(activity);
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ error: 'Error updating activity' });
  }
});

// DELETE Activity
app.delete('/api/activities/:id', async (req, res) => {
  try {
    await Activity.destroy({ where: { id: req.params.id } });
    console.log(`Activity ${req.params.id} deleted.`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ error: 'Error deleting activity' });
  }
});

/* ==============================================
   HOTEL ENDPOINTS
   ============================================== */
// GET Hotels
app.get('/api/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.findAll();
    res.json(hotels);
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.status(500).json({ error: 'Error fetching hotels' });
  }
});

// POST Hotels
app.post('/api/hotels', upload.array('files'), async (req, res) => {
  console.log('POST /api/hotels called');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  try {
    const { name, address, checkIn, checkOut, lat, lng } = req.body;
    const filesData = req.files && req.files.length > 0
      ? JSON.stringify(req.files.map(file => ({ filename: file.filename, originalname: file.originalname })))
      : null;
    const hotel = await Hotel.create({
      name,
      address,
      checkIn,
      checkOut,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      files: filesData
    });
    console.log('New hotel created:', hotel.toJSON());
    res.json(hotel);
  } catch (err) {
    console.error('Error creating hotel:', err);
    res.status(500).json({ error: 'Error creating hotel' });
  }
});

// PUT Hotel
app.put('/api/hotels/:id', upload.array('files'), async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    const { name, address, info, checkIn, checkOut, lat, lng } = req.body;
    const filesData = req.files && req.files.length > 0
      ? JSON.stringify(req.files.map(file => ({ filename: file.filename, originalname: file.originalname })))
      : hotel.files;
    hotel.name = name;
    hotel.address = address;
    hotel.info = info;
    hotel.checkIn = checkIn;
    hotel.checkOut = checkOut;
    hotel.lat = parseFloat(lat);
    hotel.lng = parseFloat(lng);
    hotel.files = filesData;
    await hotel.save();
    console.log('Hotel updated:', hotel.toJSON());
    res.json(hotel);
  } catch (err) {
    console.error('Error updating hotel:', err);
    res.status(500).json({ error: 'Error updating hotel' });
  }
});

// DELETE Hotel
app.delete('/api/hotels/:id', async (req, res) => {
  try {
    await Hotel.destroy({ where: { id: req.params.id } });
    console.log(`Hotel ${req.params.id} deleted.`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting hotel:', err);
    res.status(500).json({ error: 'Error deleting hotel' });
  }
});

/* ==============================================
   EXPENSE ENDPOINTS
   ============================================== */
// GET Expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
});

// POST Expense
app.post('/api/expenses', async (req, res) => {
  console.log('POST /api/expenses called');
  console.log('Request body:', req.body);
  try {
    const { description, amount, date, category, lat, lng } = req.body;
    const expense = await Expense.create({
      description,
      amount: parseFloat(amount),
      date,
      category,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null
    });
    console.log('New expense created:', expense.toJSON());
    res.json(expense);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ error: 'Error creating expense' });
  }
});

// PUT Expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    const { description, amount, date, category, lat, lng } = req.body;
    expense.description = description;
    expense.amount = parseFloat(amount);
    expense.date = date;
    expense.category = category;
    expense.lat = lat ? parseFloat(lat) : null;
    expense.lng = lng ? parseFloat(lng) : null;
    await expense.save();
    console.log('Expense updated:', expense.toJSON());
    res.json(expense);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Error updating expense' });
  }
});

// DELETE Expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.destroy({ where: { id: req.params.id } });
    console.log(`Expense ${req.params.id} deleted.`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Error deleting expense' });
  }
});

/* ==============================================
   WEATHER ENDPOINT
   ============================================== */
app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon query parameters required' });
  if (!config.openWeatherMapApiKey) return res.status(500).json({ error: 'Weather API key not configured' });
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${config.openWeatherMapApiKey}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

/* ==============================================
   STATIC FILE SERVING (PRODUCTION)
   ============================================== */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

/* ==============================================
   DATABASE SYNCHRONIZATION & SERVER START
   ============================================== */
sequelize.sync()
  .then(async () => {
    console.log('Database synchronized successfully.');
    const count = await User.count();
    if (count === 0) {
      const hashed = await bcrypt.hash(config.superUser.password, 10);
      await User.create({ username: config.superUser.username, password: hashed, role: 'super' });
      console.log(`Super user created with username: ${config.superUser.username} and password: ${config.superUser.password}`);
    } else {
      console.log(`User table already has ${count} record(s).`);
    }
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch(err => {
    console.error('Error during database synchronization:', err);
  });

