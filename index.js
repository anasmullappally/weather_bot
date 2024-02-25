import express from 'express';
import expHbs from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import adminRouter from './routes/admin.js';
import { connectDB } from './config/database.js';
import dotenv from "dotenv"
import { APINotFound } from './utils/api-not-found.js';

dotenv.config()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = process.env.port || 3000;

// Create an instance of express-handlebars
const hbs = expHbs.create({
    extname: '.hbs',
    defaultLayout: 'main',  // Assuming your main template is named 'main.hbs'
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
})

// Set up Handlebars as the view engine
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
// parsing incoming request data with extended options
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use("/", adminRouter)
app.use(APINotFound)
// Start the server
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    await connectDB()
});
