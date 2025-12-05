const { generateGoviResponse } = require("../lib/ai");
const { createCaseCard } = require("../lib/trello");
const { store } = require("../lib/store");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { from_number, text, language = "en" } = req.body || {};

  if (!from_number || !text) {
    return res.status(400).json({ error: "from_number and text are required" });
  }

  const { reply, intent, extracted } = await generateGoviResponse(text, language);

  let created_case_id = null;

  if (intent === "passport_renewal") {
    const newCase = {
      id: store.nextId++,
      citizen_id: from_number,
      service_type: "passport_renewal",
      details: extracted,
      status: "new",
      created_at: new Date().toISOString()
    };

    store.cases.push(newCase);
    created_case_id = newCase.id;

    await createCaseCard(newCase);
  }

  return res.status(200).json({
    reply,
    intent,
    extracted,
    created_case_id
  });
};
