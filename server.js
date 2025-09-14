// // server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 3000;
// const OPENAI_KEY = process.env.OPENAI_KEY;
// const SHOP = process.env.SHOP; // e.g. your-store.myshopify.com
// const STOREFRONT_TOKEN = process.env.STOREFRONT_TOKEN;

// // Optional: get product data from Shopify Storefront API
// async function shopifyQuery(query, variables = {}) {
//   if (!SHOP || !STOREFRONT_TOKEN) return null;
//   const res = await fetch(`https://${SHOP}/api/2025-01/graphql.json`, {

//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
//     },
//     body: JSON.stringify({ query, variables })
//   });
//   return res.json();
// }

// app.post("/chat", async (req, res) => {
//   try {
//     const { message, productHandle } = req.body;
//     if (!message) return res.status(400).json({ error: "message required" });

//     // Build small product snippet if product handle was provided
//     let productSnippet = "";
//     if (productHandle) {
//       const query = `
//         query getProduct($handle:String!){
//           productByHandle(handle:$handle){
//             title
//             description
//             variants(first:3){ edges{ node{ price } } }
//           }
//         }`;
//       const pd = await shopifyQuery(query, { handle: productHandle });
//       if (pd?.data?.productByHandle) {
//         const p = pd.data.productByHandle;
//         const desc = (p.description || "").slice(0, 300).replace(/\n/g, " ");
//         const prices = p.variants.edges.map(e => e.node.price).join(", ");
//         productSnippet = `PRODUCT: ${p.title}\n${desc}\nPrices: ${prices}\n`;
//       }
//     }

//     // Build prompt for OpenAI
//     const systemPrompt = `You are a friendly shopping assistant for ${SHOP || "this store"}. Use product info if provided. Keep replies short and helpful.`;
//     const userPrompt = productSnippet ? `${productSnippet}\nCustomer: ${message}` : message;

//     // Call OpenAI Chat Completions
//     const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${OPENAI_KEY}`
//       },
//       body: JSON.stringify({
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: userPrompt }
//         ],
//         max_tokens: 300,
//         temperature: 0.2
//       })
//     });

//     const openaiJson = await openaiRes.json();
//     const reply = openaiJson?.choices?.[0]?.message?.content || "Sorry, I couldn't get a reply.";
//     res.json({ reply });

//   } catch (err) {
//     console.error("chat error:", err);
//     res.status(500).json({ error: "server error" });
//   }
// });

// app.listen(PORT, () => console.log(`Server listening on ${PORT}`));







// server.js
import fetch from "node-fetch";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_KEY = process.env.OPENAI_KEY;

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    // Build prompt for OpenAI
    const systemPrompt = `You are a friendly shopping assistant for an online store. Keep replies short and helpful.`;

    // Call OpenAI Chat Completions
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });

    const openaiJson = await openaiRes.json();
    const reply = openaiJson?.choices?.[0]?.message?.content || "Sorry, I couldn't get a reply.";
    res.json({ reply });

  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
