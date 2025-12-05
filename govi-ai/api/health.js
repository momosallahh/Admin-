module.exports = (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "GOVI.AI Vercel backend running"
  });
};
