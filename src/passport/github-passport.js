import { Strategy as GithubStrategy } from 'passport-github2'
import passport from 'passport'
import UserDao from '../daos/mongodb/users.dao.js'
const userDao = new UserDao()

const strategyOptions = {
  clientID: 'Iv1.b7df2f3e19b5486d',
  clientSecret: '8aa5195aa34016a8bce8ba3103b8953176dd1997',
  callbackURL: 'http://localhost:8080/users/profile-github',
  scope: ['user:email']
};

const registerOrLogin = async (accesToken, refresToken, profile, done) => {
  console.log('profile:::', profile);
  let email;

  if (profile.blog && profile.blog.includes('@')) {
    email = profile.blog;
  } else if (profile.email && profile.email.includes('@')) {
    email = profile.email;
  } else if (profile.emails && profile.emails.length > 0 && profile.emails[0].value.includes('@')) {
    email = profile.emails[0].value;
  } else {
    email = null;
  }
  const user = await userDao.getByEmail(email)
  if (user) return done(null, user)
  const newUser = await userDao.createUser({
    first_name: profile._json.name.split(' ')[0],
    last_name: profile._json.name.split(' ')[1],
    email,
    password: ' ',
    isGithub: true
  });
  return done(null, newUser)
}

passport.use('github', new GithubStrategy(strategyOptions, registerOrLogin))