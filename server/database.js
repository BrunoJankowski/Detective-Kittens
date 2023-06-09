import mysql from 'mysql2'
import { pass } from './password_database.js';
import dotenv from 'dotenv'
dotenv.config()
//*In this file i make an API i guess for database to interact with backend which then interacts with frontend 
//*I make async functions and export them to be used in server.js 
//*This way server interacts only with Https and this file interacts only with database 


const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  }).promise()
 
  ///USERS FUNCTIONS
  export async function getUsers(){
    const [rows] = await pool.query(`
    SELECT * 
    FROM users`)
    return rows
  }

  export async function getUser(username){
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE name = ?
    `, [username])
    return rows[0]
  }

  export async function getUserNotes(user) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM notes
    WHERE user = ?`, [user])
    return rows
  }

  export async function createUser(name, password) {
    const [result] = await pool.query(`
    INSERT INTO users (name, password, friends, avatar)
    VALUES (?, ?, '[]', FLOOR(RAND()*10000))
    `, [name, password])
    return result.name
  }

  export async function updateUserAvatar(username) {
    const [result] = await pool.query(`
    UPDATE users 
    SET avatar = FLOOR(RAND()*1000)
    WHERE name = ?;
    `, [username])
    return result.name
  }
  
  ///FRIENDS ACTIONS
  export async function getUserFriends(username){
    const [rows] = await pool.query(`
    SELECT friends 
    FROM users
    WHERE name = ?
    `, [username])
    return rows[0]
  }

  export async function addUserFriends(username, userfriend){
    const [result] = await pool.query(`
    UPDATE users SET friends = JSON_ARRAY_APPEND(friends, '$', ?) WHERE name = ?;
    `, [userfriend, username])
    return result
  }

  export async function deleteUserFriend(username, userfriend){
    const [result] = await pool.query(`
    UPDATE users
    SET friends = JSON_REMOVE(friends, JSON_UNQUOTE(JSON_SEARCH(friends, 'one', ?, NULL, '$[*]')))
    WHERE name = ?;
    `, [userfriend, username])
    return result
  }

  //FRIEND REQUEST 

  export async function addRequestRecived(username, userfriend){
    const [result] = await pool.query(`
    UPDATE users SET req_recived = JSON_ARRAY_APPEND(req_recived, '$', ?) WHERE name = ?
    `, [userfriend, username])
    return result
  }

  export async function deleteRequestRecived(username, userfriend){
    const [result] = await pool.query(`
    UPDATE users
    SET req_recived = JSON_REMOVE(req_recived, JSON_UNQUOTE(JSON_SEARCH(req_recived, 'one', ?, NULL, '$[*]')))
    WHERE name = ?;
    `, [userfriend, username])
    return result
  }

  export async function addRequestSent(username, userfriend){
    const [result] = await pool.query(`
    UPDATE users SET req_sent = JSON_ARRAY_APPEND(req_sent, '$', ?) WHERE name = ?
    `, [userfriend, username])
    return result
  }
  
  export async function deleteRequestSent(username, userfriend){
    const [result] = await pool.query(`
    UPDATE users
    SET req_sent = JSON_REMOVE(req_sent, JSON_UNQUOTE(JSON_SEARCH(req_sent, 'one', ?, NULL, '$[*]')))
    WHERE name = ?;
    `, [userfriend, username])
    return result
  }
  
  export async function getRequests(username){
    const [result] = await pool.query(`
    SELECT req_recived 
    FROM users
    WHERE name = ?
    `, [username])
    return result[0]
  }

  export async function getRequestsSent(username){
    const [result] = await pool.query(`
    SELECT req_sent
    FROM users
    WHERE name = ?
    `, [username])
    return result[0]
  }


  ///NOTES
  export async function getNotes() {
    const [rows] = await pool.query(`
    SELECT * 
    FROM notes`)
    return rows
  }

  export async function getNote(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM notes
    WHERE id = ? 
    `, [id])
    return rows[0]
  }
  
  export async function deleteNote(id) {
    const [rows] = await pool.query(`
    DELETE FROM notes 
    WHERE id= ?
    `, [id])
    return rows[0]
  }

  export async function createNote(title, contents, user) {
    console.log(title, contents, user);
    const [result] = await pool.query(`
    INSERT INTO notes (title, contents, user)
    VALUES (?, ?, ?)
    `, [title, contents, user])
    const id = result.insertId
    return getNote(id)
  }

  ///PARTIES

  export async function createParty(user) {
    console.log(user);
    const [result] = await pool.query(`
    INSERT INTO parties (players, owner, partner, name)
    VALUES ('[]', ?, '', '')
    `, [user])
    await addUserToParty(user, user)
    return result
  }

  export async function createPartyWithName(user, name) {
    console.log(user);
    const [result] = await pool.query(`
    INSERT INTO parties (players, owner, partner, name)
    VALUES ('[]', ?, '', ?)
    `, [user, name])
    await addUserToParty(user, user)
    return result
  }

  //for multi parties
  export async function addUserToParty(currentUser , user) {
    const [result] = await pool.query(`
    UPDATE parties SET players = JSON_ARRAY_APPEND(players, '$', ?) WHERE owner = ?;
    `, [user, currentUser])
    return result
  }

  export async function addPartner(currentUser , user) {
    const [result] = await pool.query(`
    UPDATE parties SET partner = ? WHERE owner = ?;
    `, [user, currentUser])
    await addUserToParty(currentUser, user)
    return result
  }

  export async function getPartner(currentUser) {
    const [result] = await pool.query(`
    SELECT partner FROM parties WHERE owner= ?
    `, [currentUser])
    return result
  }

  export async function getParty(user) {
    const [rows] = await pool.query(`
    SELECT * FROM parties 
    WHERE JSON_SEARCH(players, 'one', ?) IS NOT NULL;
    `, [user])
    console.log(rows[0]);
    return rows[0]
  }

  export async function deleteParty(id) {
    const [rows] = await pool.query(`
    DELETE FROM parties 
    WHERE id = ?
    `, [id])
    return rows[0]
  }

  export async function leaveParty(id, user) {
    const [rows] = await pool.query(`
    UPDATE parties
    SET players = JSON_REMOVE(players, JSON_UNQUOTE(JSON_SEARCH(players, 'one', ?, NULL, '$[*]'))),
    partner = ''
    WHERE id = ?;
    `, [user, id])
    return rows[0]
  }




  