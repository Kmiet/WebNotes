# WebNotes

Server application that implements REST API to perform CRUD operations on a set of notes stored in a database.



## Setup

To be able to run this server on your device, you have to have a Neo4j database. You may download their software from [here](<https://neo4j.com>) or use one of the online providers like [GrapheneDB]. [NodeJS] runtime with [npm] or [yarn] package manager are also required.

Clone the repository from the master branch using:

```sh
$ cd /project/directory/on/your/computer
$ git clone
```

Then simply install all the dependencies with:

```js
$ npm install
// or
$ yarn install
```

Afterwards edit the __.env__ file:

```sh
SERVER_PORT = JUST_PICK_A_NUMBER_FROM_1024_TO_65535
DB_URI = bolt://YOUR_DB_URI:YOUR_DB_PORT/
DB_USER = YOUR_DB_USERNAME
DB_PASS = YOUR_DB_USER_PASSWORD
```

And finally run the server with:

```js
$ npm run start
// or
$ yarn start
```

## Tests

To run tests simply type:
```js
$ npm run test
// or
$ yarn test
```


## API

Let's assume the server is running on your own computer on port __3000__ and the OS is __Unix__ based one.

### GET /notes
Reuquest all notes from the database. Example:

```sh 
$ curl -v -X GET http://localhost:3000/notes
```
Possible responses:

+ #### 200 OK
  Returns a list of notes in a JSON format:
  ```js
  [
    {
      "note_id": "0",
      // DateTime of object initialization
      "created_at": "2019-01-18T19:52:28.274Z",
      // DateTime of last modification (when initialized it equals to created_at)
      "modified_at": "2019-01-18T19:52:28.274Z",
      "title": "My First Note",
      "content": "The best note i've ever written"
    },
    {
      "note_id": "1",
      "created_at": "2019-01-18T20:43:58.564Z",
      "modified_at": "2019-01-18T20:44:00.595Z",
      "title": "Second note",
      "content": "Not as good as the first one :C"
    }
  ]
  ```
+ #### 404 Not Found
  When there are no notes in DB.
  ```js
  {
    "code": 404,
    "msg": "Resource not found"
  }
  ```



### POST /notes
Creates new note with given __{ title, content }__. Example:

```sh 
$ curl -v -H "Content-Type: application/json" \
      -d "{ \"title\": \"My First Note\" , \"content\": \"The best note i've ever written\" }" \
      -X POST http://localhost:3000/notes
```

Possible responses:

+ #### 201 Created
  Returns note's data in JSON format:
  ```js
  {
    "note_id": "0",
    "created_at": "2019-01-18T19:52:28.274Z",
    "modified_at": "2019-01-18T19:52:28.274Z",
    "title": "My First Note",
    "content": "The best note i've ever written"
  }
  ```
+ #### 400 Bad Request
  When there was no __ title __ or __ content __ in request body.
  ```js
  {
    "code": 400,
    "msg": "Title or content field is missing"
  }
  ```



### GET /notes/:id
Returns a note with given __ID__. Example:

```sh 
$ curl -v -X GET http://localhost:3000/notes/0
```
Possible responses:

+ #### 200 OK
  Returns a list of notes in a JSON format:
  ```js
  {
    "note_id": "0",
    "created_at": "2019-01-18T19:52:28.274Z",
    "modified_at": "2019-01-18T19:52:28.274Z",
    "title": "My First Note",
    "content": "The best note i've ever written"
  }
  ```
+ #### 404 Not Found
  When there is no entity with the __note_id__ = __0__.
  ```js
  {
    "code": 404,
    "msg": "Resource not found"
  }
  ```



### PUT /notes/:id
Updates a note with new __{ title, content }__. The __title__ and the __content__, both of them are required in JSON request body. Example:

```sh 
$ curl -v -H "Content-Type: application/json" \
      -d "{ \"title\": \"Second note\" , \"content\": \"Not as good as the first one :C\" }" \
      -X POST http://localhost:3000/notes/1
```
Possible responses:

+ #### 201 Created
  Returns an updated note in a JSON format:
  ```js
  {
    "note_id": "1",
    "created_at": "2019-01-18T20:43:58.564Z",
    "modified_at": "2019-01-18T20:44:00.595Z",
    "title": "Second note",
    "content": "Not as good as the first one :C"
  }
  ```
+ #### 400 Bad Request
  When there was no __ title __ or __ content __ in request body.
  ```js
  {
    "code": 400,
    "msg": "Title or content field is missing"
  }
  ```
+ #### 404 Not Found
  When there is no entity with the __note_id__ = __1__.
  ```js
  {
    "code": 404,
    "msg": "Resource not found"
  }
  ```



### DELETE /notes/:id
Removes note with given __ID__ from database. Example:

```sh 
$ curl -v -X DELETE http://localhost:3000/notes/n0nEx1st3nt
```
Possible responses:

+ #### 204 No Content
  When object was successfully deleted.

+ #### 404 Not Found
  When there is no entity with the __note_id__ = __n0nEx1st3nt__.
  ```js
  {
    "code": 404,
    "msg": "Resource not found"
  }
  ```

### GET /notes/:id/history
Returns all previous versions of the note with given __ID__, ordered by their modification time.

Optional query parameters:

+ ```order```: Either ascending ```ASC``` (from first to the latest version) or descending ```DESC```. Option is not case sensitive. Defaults to ```ASC```.

+ ```limit```: Accepts only ```:number > 0``` values, otherwise ignores the parameter. Limits result set to a subset of top ```$limit``` records. Example: 
  > There is 15 versions of given note stored in DB. Query ```?order=DESC&limit=10``` will return all of the last ten versions.

+ ```page```: Usable when ```$limit > 0```. Accepts only ```:number > 0``` values, otherwise ignores the parameter. Skips the top ```$limit * ($page - 1)``` records and then returns next ```$limit`` of them. Example:
  > There is 15 versions of given note stored in DB. Query ```?order=ASC&limit=10&page=2``` will skip the first ten versions and then return the 5 most recent ones.

Example:

```sh 
$ curl -v -X GET "http://localhost:3000/notes/21/history?order=DESC&limit=3&page=2"
```

Possible responses:

+ #### 200 OK
  Returns a list of note's versions in a JSON format:
  ```js
  {
    // Let's assume there are only 5 versions stored in DB
    "order": "DESC",
    "length": 2,
    "versions": [
      {
        "note_id": "21",
        "created_at": "2019-01-19T17:49:58.879Z",
        "title": "TODO Note",
        "modified_at": "2019-01-19T17:50:51.898Z",
        "content": "Take a nap",
        "version": 5
      },
      {
        "note_id": "21",
        "created_at": "2019-01-19T17:49:58.879Z",
        "title": "TODO Note",
        "modified_at": "2019-01-19T17:50:36.375Z",
        "content": "Have lunch",
        "version": 4
      }
    ]
  }
  ```
+ #### 400 Bad Request
  Let's assume there are only 3 versions stored in DB. When querying with __```?limit=3&page=2```__ we skip all of them and there are no records available to return.

  ```js
  {
    "code": 400,
    // Number of stored versions
    "max": 3,
    // Number of skipped records
    "offset": 3,
    "msg": "Skipped all of the entities"
  }
  ```

+ #### 404 Not Found
  When there is no entity with the __note_id__ = __21__.
  ```js
  {
    "code": 404,
    "msg": "Resource not found"
  }
  ```


## Tech
All of the technologies used in this project.

| Name | Link |
| - | - |
| ExpressJS | [Express] |
| JestJS | [Jest] |
| Supertest | [Supertest] |
| Neo4j DB | [Neo4j] |



## License

MIT

[NodeJS]: <https://nodejs.org>
[npm]: <https://www.npmjs.com>
[yarn]: <https://yarnpkg.com>
[Express]: <https://expressjs.com>
[Jest]: <https://jestjs.io>
[Supertest]: <https://github.com/visionmedia/supertest>
[Neo4j]: <https://neo4j.com>
[GrapheneDB]: <https://graphenedb.com>