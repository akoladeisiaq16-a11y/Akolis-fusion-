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

Analyze this business and identify realistic customer opportunities.

Business: ${business}
Offer: ${offer}
Location: ${location}
Ideal customers: ${customers}
Biggest challenge: ${challenge}

Create a concise, practical report.

Return ONLY valid JSON using exactly these fields:

{
  "score": 0,
  "customer": "",
  "opportunity": "",
  "marketing": "",
  "next": ""
}

Rules:
- score must be between 1 and 100.
- Make the recommendations specific to this business.
- Do not invent private customer information.
- Do not promise guaranteed sales.
- Focus on practical ways to find and attract customers.
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
      const error = await response.text();

      return res.status(500).json({
        error: "AI request failed",
        details: error
      });
    }

    const data = await response.json();

    const result = JSON.parse(data.output_text);

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong.",
      details: error.message
    });
  }
      }
