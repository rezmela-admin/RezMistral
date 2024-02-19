const axios = require('axios');
require('dotenv').config();

exports.handler = async function(event) {
  // Log the incoming HTTP method and body for debugging
  console.log("Received event:", event.httpMethod, "with body:", event.body);

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    console.log("Received non-POST request. Method:", event.httpMethod);
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Attempt to parse the JSON body
    const { model, messages } = JSON.parse(event.body);
    console.log("Parsed body:", { model, messages });
    const API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

    // Log the data being sent to the external API
    console.log("Sending request to API with model:", model, "and messages:", messages);

    // Perform the external API request
    const response = await axios.post(API_ENDPOINT, { model, messages }, {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      }
    });

    // Log the response from the external API
    console.log("Received response from API:", response.data);

    // Return the successful response from the external API
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error("Error occurred:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Bad Request: Invalid JSON" })
      };
    }

    // Handle errors from the external API request
    if (error.response) {
      return {
        statusCode: error.response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(error.response.data)
      };
    }

    // Handle generic errors (e.g., network errors)
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};

