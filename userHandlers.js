const argon2 = require("argon2");
const database = require("./database");

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 15 * 2 ** 20,
  timeCost: 2,
  parallelism: 1,
};

const getUsers = (req, res) => {
  let sql = "select id, firstname, lastname, email, city, language from users";
  const language = req.query.language;
  const city = req.query.city;
  if (language) {
    sql += ` where language = '${language}'`;
  }
  if (city) {
    sql += `${language ? " and" : " where"} city = '${city}'`;
  }
  database
    .query(sql)
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query(
      "select id, firstname, lastname, email, city, language from users where id = ?",
      [id]
    )
    .then(([users]) => {
      if (users[0] != null) {
        res.json(users[0]);
      } else {
        res.status(404).send("Not Found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const postUser = async (req, res) => {
  try {
    const { firstname, lastname, email, city, language, password } = req.body;
    const hashedPassword = await argon2.hash(password, hashingOptions);

    await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language, password) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language, hashedPassword]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving the user");
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { firstname, lastname, email, city, language, password } = req.body;
    const hashedPassword = await argon2.hash(password, hashingOptions);

    const result = await database.query(
      "update Users set firstname = ?, lastname = ?, email = ?, city = ?, language = ?, password = ? where id = ?",
      [firstname, lastname, email, city, language, hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).send("Not Found");
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing the User");
  }
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("delete from users where id = ?", [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send("Not Found");
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting the user");
    });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
};
