// Importera de paket vi behöver för att bygga servern
const express = require('express'); // För att skapa en server
const cors = require('cors'); // För att tillåta cross-origin-förfrågningar
const mongoose = require('mongoose'); // För att prata med MongoDB
const bodyParser = require('body-parser'); // För att hantera JSON-data i requests

const app = express();

// Använd port från miljövariabel eller 4680 om ingen är satt
const port = process.env.PORT || 4680;

// Setup för att hantera statiska filer och CORS
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/js'));
app.use(cors());
app.use(bodyParser.json());

// Anslut till MongoDB-databasen lokalt
mongoose.connect('mongodb://localhost:27017/work')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Could not connect to MongoDB:', err);

        // Avsluta om vi inte kan koppla upp
        process.exit();
    });

// Skapar ett schema för att spara arbetserfarenheter i databasen
const workExperienceSchema = new mongoose.Schema({
    companyname: String,
    jobtitle: String,
    location: String,
    startdate: Date,
    enddate: Date,
    description: String
});

// Modell baserat på schemat
const WorkExperience = mongoose.model('WorkExperience', workExperienceSchema);

//CRUD
// Lägg till
app.post('/api/workexperience', (req, res) => {
    // Skapa nytt dokument från request-data
    const workExperience = new WorkExperience(req.body);
    // Spara i databasen
    workExperience.save()
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Hämta
app.get('/api/workexperience', (req, res) => {
    WorkExperience.find()
        // Skicka tillbaka allt som JSON
        .then(results => res.json(results))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Uppdatera
app.put('/api/workexperience/:id', (req, res) => {
    const { id } = req.params; // Hämta id från URL

    WorkExperience.findByIdAndUpdate(id, req.body, { new: true })
        .then(result => res.json({ message: 'Work experience updated', result }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Radera
app.delete('/api/workexperience/:id', (req, res) => {

    // Hämta id från URL
    const { id } = req.params;
    // Ta bort från databasen
    WorkExperience.findByIdAndDelete(id)
        // Skicka bekräftelse på radering
        .then(() => res.json({ message: 'Work experience deleted' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Starta servern
app.listen(port, () => {
    // Meddela att servern körs
    console.log(`Server is running on port ${port}`);
});
