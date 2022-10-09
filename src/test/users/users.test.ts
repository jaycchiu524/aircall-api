process.env.TS_NODE_PROJECT = './tsconfig.json'
process.env.TS_CONFIG_PATHS = 'true';
import 'ts-mocha'
import app from '@/app'
import supertest from 'supertest'
import { expect } from 'chai'
import shortid from 'shortid'
import mongoose from 'mongoose'

let firstUserIdTest = '' // used to store the id of the first user created for testing purposes

const requestBody = {
  email: `test${shortid.generate()}@test.com`,
  password: 'test123',
} 

let accessToken = '' // used to store the token of the first user created for testing purposes
let refreshToken = '' // used to store the refresh token of the first user created for testing purposes
const newFirstName = 'Sekiro'
const newFirstName2 = 'Geralt'
const newLastName2 = 'Kimura'

/**
 * The functions we’re passing to before() and after() get called before and after all the tests we’ll define by calling it() within the same describe() block. The function passed to after() takes a callback, done, which we ensure is only called once we’ve cleaned up both the app and its database connection.
 * Note: Without our after() tactic, Mocha will hang even after successful test completion. 
 * The advice is often to simply always call Mocha with --exit to avoid this, but there’s an (often unmentioned) caveat. 
 * If the test suite would hang for other reasons—like a misconstructed Promise in the test suite or 
 * the app itself—then with --exit, Mocha won’t wait and will report success anyway, adding a subtle complication to debugging.
 */

describe('users and auth endpoints', () => {
  let request: supertest.SuperTest<supertest.Test>
  before(function() {
    request = supertest.agent(app)
  })
  after(function(done) {
    app.close(() => {
      mongoose.connection.close(done)
    })
  })

  it('should create a new user by POST /users', async () => {
    const res = await request.post('/users').send(requestBody)

    expect(res.status).to.equal(201)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an('object')
    expect(res.body.id).to.be.a('string')
    firstUserIdTest = res.body.id
  })

  it('should login by POST /auth', async () => {
    const res = await request.post('/auth').send(requestBody)

    expect(res.status).to.equal(201)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an('object')
    expect(res.body.accessToken).to.be.a('string')
    expect(res.body.refreshToken).to.be.a('string')
    accessToken = res.body.accessToken
    refreshToken = res.body.refreshToken
  })

  it('should retrieve the user by GET /users/:userId', async () => {
    const res = await request.get(`/users/${firstUserIdTest}`).set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).to.equal(200)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an('object')
    expect(res.body._id).to.be.a('string')
    expect(res.body._id).to.equal(firstUserIdTest)
    expect(res.body.email).to.equal(requestBody.email)
  })

  describe('with a valid access token', () => {
    it('should disallow GET /users', async () => {
      const res = await request.get('/users').set('Authorization', `Bearer ${accessToken}`).send()

      expect(res.status).to.equal(403)
    })

    it('should disallow a PATCH to /users/:userId', async function () {
      const res = await request
          .patch(`/users/${firstUserIdTest}`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({
              firstName: newFirstName,
          });
      expect(res.status).to.equal(403);
  });

  it('should disallow a PUT to /users/:userId with an nonexistent ID', async function () {
      const res = await request
          .put(`/users/i-do-not-exist`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({
              email: requestBody.email,
              password: requestBody.password,
              firstName: 'Marcos',
              lastName: 'Silva',
              permissionFlags: 256,
          });
      expect(res.status).to.equal(404);
  });

  it('should disallow a PUT to /users/:userId trying to change the permission flags', async function () {
      const res = await request
          .put(`/users/${firstUserIdTest}`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({
              email: requestBody.email,
              password: requestBody.password,
              firstName: 'Marcos',
              lastName: 'Silva',
              permissionFlags: 256,
          });
      expect(res.status).to.equal(400);
      expect(res.body.errors).to.be.an('array');
      expect(res.body.errors).to.have.length(1);
      expect(res.body.errors[0]).to.equal(
          'User cannot change permission flags'
      );
  });

  it('should allow a PUT to /users/:userId/permissions/2 for testing', async function () {
      const res = await request
          .put(`/users/${firstUserIdTest}/permissions/2`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({});
      expect(res.status).to.equal(204);
  });

  describe('with a new set of permission flags', function () {
      it('should allow a POST to /auth/refresh-token', async function () {
          const res = await request
              .post('/auth/refresh-token')
              .set({ Authorization: `Bearer ${accessToken}` })
              .send({ refreshToken });
          expect(res.status).to.equal(201);
          expect(res.body).not.to.be.empty;
          expect(res.body).to.be.an('object');
          expect(res.body.accessToken).to.be.a('string');
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
      });

      it('should allow a PUT to /users/:userId to change first and last names', async function () {
          const res = await request
              .put(`/users/${firstUserIdTest}`)
              .set({ Authorization: `Bearer ${accessToken}` })
              .send({
                  email: requestBody.email,
                  password: requestBody.password,
                  firstName: newFirstName2,
                  lastName: newLastName2,
                  permissionFlags: 2,
              });
          expect(res.status).to.equal(204);
      });

      it('should allow a GET from /users/:userId and should have a new full name', async function () {
          const res = await request
              .get(`/users/${firstUserIdTest}`)
              .set({ Authorization: `Bearer ${accessToken}` })
              .send();
          expect(res.status).to.equal(200);
          expect(res.body).not.to.be.empty;
          expect(res.body).to.be.an('object');
          expect(res.body._id).to.be.a('string');
          expect(res.body.firstName).to.equal(newFirstName2);
          expect(res.body.lastName).to.equal(newLastName2);
          expect(res.body.email).to.equal(requestBody.email);
          expect(res.body._id).to.equal(firstUserIdTest);
      });

      it('should allow a DELETE from /users/:userId', async function () {
          const res = await request
              .delete(`/users/${firstUserIdTest}`)
              .set({ Authorization: `Bearer ${accessToken}` })
              .send();
          expect(res.status).to.equal(204);
      });
    })
  })
})