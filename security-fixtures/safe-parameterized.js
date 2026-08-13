export function findUser(db, username) {
  return db.query("SELECT * FROM users WHERE username = $1", [username]);
}
