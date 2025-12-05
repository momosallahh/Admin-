const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_LIST_ID = process.env.TRELLO_LIST_ID;

async function createCaseCard(caseObj) {
  if (!TRELLO_KEY || !TRELLO_TOKEN || !TRELLO_LIST_ID) {
    console.log("Trello not configured. Skipping card creation.");
    return;
  }

  const title = `Case #${caseObj.id} - ${caseObj.service_type}`;
  const desc = `
Citizen: ${caseObj.citizen_id}
Service: ${caseObj.service_type}
Details:
${JSON.stringify(caseObj.details, null, 2)}
`.trim();

  const url = `https://api.trello.com/1/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idList: TRELLO_LIST_ID,
        name: title,
        desc
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Trello error:", resp.status, text);
    }
  } catch (err) {
    console.error("Error creating Trello card:", err);
  }
}

module.exports = { createCaseCard };
