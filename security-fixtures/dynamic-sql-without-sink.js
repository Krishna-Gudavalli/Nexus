export function buildQuery(username) {
  return "SELECT * FROM users WHERE username = '" + username + "'";
}
