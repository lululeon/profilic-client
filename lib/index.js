//Singleton http request service for profilic UIs, based on axios http client
import axios from 'axios';
const JWTDecode = require('jwt-decode');

export default class PrfHttpClient {
  constructor() {
    if (!PrfHttpClient.instance) {
      this.authedUser = null;
      this.basepath = 'http://' + process.env.HOST + ':' + process.env.PORT + '/api/v1/profiles';
      let token = localStorage.getItem('prf_authtoken');
      this.setAuthHeader(token);
      PrfHttpClient.instance = this;
    }
    return PrfHttpClient.instance;
  }


  setAuthHeader = (token) => {
    //determine whether or to set the bearer token for jwt.
    //It appears these are static-y/sticky properties affecting all *subsequent* axios calls...
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      this.authedUser = JWTDecode(token);
    } else if (axios.defaults.headers.common['Authorization']) {
      delete axios.defaults.headers.common['Authorization'];
      this.authedUser = null;
    }
  }

  authenticate = (callback) => {
    axios.post(this.basepath + '/auth')
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::authenticate - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  getAuthedUsername = () =>{
    if(this.authedUser) return this.authedUser.username;
    else return null;
  }

  getAuthedID = () =>{
    if(this.authedUser) return this.authedUser._id;
    else return null;
  }

  //** GET ALL */
  getProfiles = (callback) => {//TODO: gets everything; would need limiting function or paging in future.
    axios.get(this.basepath)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::getProfiles - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** GET LATEST n profiles */
  getLatestProfiles = (numberOfItems, callback) => {
    axios.get(this.basepath + '/latest/'+ numberOfItems)
    .then(function (response) {
      callback(response.data);
    })
    .catch(function () {
      callback(null);
    });
  }

  //** GET BY USERNAME  */
  getProfileByUsername = (username, callback) => {
    axios.get(this.basepath + '/' + username)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::getProfileByUsername - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** GET BY USERNAME LIST  */
  getProfilesByUsernameList = (usernameList, callback) => {
    axios.put(this.basepath + '/filter/username', usernameList)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::getProfilesByUsernameList - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** UPDATE one */
  updateProfile = (profileObj, callback) => {
    axios.put(this.basepath + '/update', profileObj)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::updateProfile - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** Micro update - like Update one but with smaller response payload of updated elements only */
  microUpdate = (profileObj, callback) => {
    axios.put(this.basepath + '/update/micro', profileObj)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::microUpdate - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** UPDATE multiple */
  updateProfileList = (profileObjList, callback) => {
    axios.put(this.basepath + '/updatelist', profileObjList)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::updateProfileList - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** DELETE */
  deleteProfile = (id, callback) => {
    axios.delete(this.basepath + '/' + id)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::deleteProfile - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** SIGNUP */
  signupNewProfile = (profileObj, callback) => {
    axios.post(this.basepath + '/signup', profileObj)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::signupNewProfile - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** LOGIN */
  login = (profileObj, callback) => {
    axios.put(this.basepath + '/login', profileObj)
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::login - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  //** LOGOUT - note: this call is synchronous*/
  logout = () => {
    localStorage.removeItem('prf_authtoken');
    this.setAuthHeader(false);
  }

  //** addFollowFrom */
  addFollowFrom = (fromProfileObj, toProfileObj, callback) => {
    axios.post(this.basepath + '/link', { linkfrom: fromProfileObj, linkto: toProfileObj })
      .then(function (response) {
        callback(response.data);
      })
      .catch(function (/* error */) {
        // console.log('PrfHttpClient::addFollowFrom - an error occurred');
        // console.log(error);
        callback(null);
      });
  }

  removeFollowFrom = (fromProfileObj, toProfileObj, callback) => {
    //axios.delete() shorthand doesn't take payloads (and for good reason). Revisit later.
    //axios.delete(this.basepath + '/link', { linkfrom: fromProfileObj, linkto: toProfileObj })
    axios.request({
      url: this.basepath + '/link',
      method: 'delete',
      data: { linkfrom: fromProfileObj, linkto: toProfileObj }
    }).then(function (response) {
      callback(response.data);
    }).catch(function (/* error */) {
      // console.log('PrfHttpClient::removeFollowFrom - an error occurred');
      // console.log(error);
      callback(null);
    });
  }
}

//for a stricter singleton
// const instance = new PrfHttpClient();
// Object.freeze(instance);
// export default instance;