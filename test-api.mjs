async function testApi() {
    try {
        const res = await fetch('https://campaignx.inxiteout.ai/api/v1/get_customer_cohort', {
            headers: { 'X-API-Key': 'e2TIIHcZCQIKG5JgJ2aW5fJLs3mfzV3smhEgBxoLn64' }
        });
        const data = await res.json();
        console.log("KEYS:", Object.keys(data));
        console.log("data.customers array check:", Array.isArray(data.customers));
        console.log("SNIPPET:", JSON.stringify(data).substring(0, 500));
    } catch (err) {
        console.error(err);
    }
}

testApi();
