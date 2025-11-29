const https = require('https');

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBykliY9_TVSZutc3ip-SSz03x7GO9lSgY';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Querying: ${url}`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`Error: ${res.statusCode}`);
            console.error(data);
            return;
        }

        try {
            const fs = require('fs');
            fs.writeFileSync('models.json', data);
            console.log('Saved raw response to models.json');

            const json = JSON.parse(data);
            console.log('Available Models:');
            if (json.models) {
                json.models.forEach(model => {
                    console.log(`- ${model.name}`);
                });
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log(data);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err);
});
