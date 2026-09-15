export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      business,
      offer,
      location,
      customers,
      challenge
    } = req.body;

    if (!business || !offer || !location || !customers || !challenge) {
      return res.status(400).json({
        error: "Please complete all fields."
      });
    }

    const prompt = `
You are AKOLIS AI Customer Radar.

Your job is to help a business discover realistic customer opportunities.

Business name: ${business}
What they sell: ${offer}
Location: ${location}
Target customers: ${customers}
Biggest challenge: ${challenge}

Analyze this business and produce a practical customer opportunity report.

Return ONLY valid JSON in this exact structure:

{
  "score": 0,
  "customer": "",
  "opportunity": "",
  "marketing": "",
  "next": ""
}

Rules:
- score must be between 1 and 100.
- Be specific to the business.
- Do not invent guaranteed customers, sales, phone numbers or private information.
- Give practical marketing advice.
- Keep each answer concise and useful.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input: prompt
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(500).json({
        error: "AI request failed",
        details: errorText
      });
    }

    const data = await response.json();

    const text = data.output_text;

    const result = JSON.parse(text);

    return res.status(200).json(result);

  } catch (error) {

    return res.status(500).json({
      error: "Something went wrong.",
      details: error.message
    });

  }
      }
