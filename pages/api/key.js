export default function handler(req, res) {
  const { key } = req.query;
  const valid = key === process.env.ACCESS_PASSWORD;
  res.status(200).json({ valid });
}
