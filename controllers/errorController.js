module.exports = (err, req, res, next) => {
  console.log(err);
  if (err.name == "SequelizeUniqueConstraintError") {
    return res.status(400).json({ message: "User already exists" });
  }
  return res.status(500).json({ name: err.name, message: err.message });
};
