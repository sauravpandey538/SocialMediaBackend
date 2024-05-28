const express = require('express');
const app = express();
const port = 3000;

// Define a route handler for the default home page
app.get('/', (req, res) => {
    res.send('Hello, Express 2.0!');
});

// Start the server and listen on port 3000
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
