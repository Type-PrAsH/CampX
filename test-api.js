const fetch = require('node-fetch');

async function testApi() {
    const res = await fetch('https://campaignx.inxiteout.ai/api/v1/get_customer_cohort', {
        headers: { 'X-API-Key': 'e2TIIHcZCQIKG5JgJ2aW5fJLs3mfzV3smhEgBxoLn64' }
    });
    const data = await res.json();
    console.log(JSON.stringify(data).substring(0, 500));
}

testApi();
