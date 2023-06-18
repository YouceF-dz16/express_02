const database = require("./database");

const getUsers = (req, res) => {
  let sql =
    "select id, firstname, lastname, email, city, language, hashedPassword from users";
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
    const { firstname, lastname, email, city, language, hashedPassword } =
      req.body;
    await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language, hashedPassword]
    );

    res.status(201).send("user add");
  } catch (err) {
    console.error(err);
    res.status(500).send("Oups, le server a un problème: " + err.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id !== req.payload.sub) {
      res.sendStatus(403);
      return;
    }

    const { firstname, lastname, email, city, language, hashedPassword } =
      req.body;

    const result = await database.query(
      "update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashedPassword = ? where id = ?",
      [firstname, lastname, email, city, language, hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).send("Not Found");
    } else {
      res.status(204).send("User updated");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing the User");
  }
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  if (id !== req.payload.sub) {
    res.sendStatus(403);
    return;
  }

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

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
  const { email } = req.body;

  database
    .query("select * from users where email = ?", [email])
    .then(([users]) => {
      if (users[0] != null) {
        req.user = users[0];

        next();
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
  getUserByEmailWithPasswordAndPassToNext,
};
