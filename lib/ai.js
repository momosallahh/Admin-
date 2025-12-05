function classifyIntent(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes("passport") &&
    (lower.includes("renew") || lower.includes("renewal") || lower.includes("new"))
  ) {
    return "passport_renewal";
  }
  return "general_question";
}

async function generateGoviResponse(userText) {
  const intent = classifyIntent(userText);

  if (intent === "passport_renewal") {
    return {
      reply: `It looks like you want to renew a passport.

To begin, please send:
1) Full name
2) Date of birth
3) Passport number (if you have it)
4) Passport expiry date
5) Your phone number

I will prepare your case for Immigration.`,
      intent,
      extracted: {
        service_type: "passport_renewal",
        fields_needed: [
          "full_name",
          "date_of_birth",
          "passport_number",
          "expiry_date",
          "phone"
        ]
      }
    };
  }

  return {
    reply:
      "Welcome to GOVI.AI. I can help with passport renewal, ID issues, certificates, land inquiries and more. How can I help you today?",
    intent,
    extracted: {}
  };
}

module.exports = { generateGoviResponse };
