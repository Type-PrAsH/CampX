/**
 * personalizeEmail.js — Email Personalization Engine Utility
 *
 * Dynamically replaces placeholders like {name}, {city}, {age_group} 
 * with actual customer data. Fallbacks are provided if data is missing.
 */

export function personalizeEmail(template, customer) {
    if (!template || typeof template !== "string") return template;
    if (!customer || typeof customer !== "object") return template;

    // Safe data extraction with fallbacks
    const name = customer.name || customer.Full_name || "Valued Customer";
    const firstName = name !== "Valued Customer" ? name.split(" ")[0] : "Customer";
    const city = customer.city || customer.City || "your area";

    // Age logic
    const ageStr = customer.age || customer.Age;
    const age = ageStr ? parseInt(ageStr, 10) : null;

    let ageGroup = "valued customers";
    if (age) {
        if (age >= 50) ageGroup = "senior investors";
        else if (age >= 30) ageGroup = "experienced investors";
        else ageGroup = "young professionals";
    }

    // Gender logic
    const gender = customer.gender || customer.Gender || "";

    // Perform replacements
    return template
        .replace(/{name}/gi, name)
        .replace(/{first_name}/gi, firstName)
        .replace(/{city}/gi, city)
        .replace(/{age}/gi, age ? age.toString() : "")
        .replace(/{age_group}/gi, ageGroup)
        .replace(/{gender}/gi, gender);
}
