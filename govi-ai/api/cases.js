const { store } = require("../lib/store");

module.exports = (req, res) => {
  if (req.method === "GET") {
    return res.status(200).json(store.cases);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const newCase = {
      id: store.nextId++,
      citizen_id: body.citizen_id || "unknown",
      service_type: body.service_type || "unknown",
      details: body.details || {},
      status: "new",
      created_at: new Date().toISOString()
    };
    store.cases.push(newCase);
    return res.status(201).json(newCase);
  }

  return res.status(405).json({ error: "Method not allowed" });
};
