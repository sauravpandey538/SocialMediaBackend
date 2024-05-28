import express from 'express';
const app = express();
const port = 3000;

// Define a route handler for the default home page
app.get('/', (req, res) => {
    res.send('Hello, Express 3.0!');
});
app.get('/hello', (req, res) => {
    res.send('Hello,  3.0!');
});

// Start the server and listen on port 3000
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
