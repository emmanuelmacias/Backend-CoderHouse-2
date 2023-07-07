import UserDao from "../daos/mongodb/users.dao.js";
const userDao = new UserDao();

export const signupController = (req, res, next) => {
  try {
    res.json({
      msg: 'Register OK',
      session: req.session // passport.user = id de mongo
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const user = await userDao.getById(req.session.passport.user);
    const { first_name, last_name, email, age, role } = user;
    res.json({
      msg: 'Login OK',
      session: req.session,
      userData: {
        first_name,
        last_name,
        email,
        age,
        role
      }
    });
  } catch (error) {
    next(error);
  }
}

export const githubController = async (req, res, next) => {
  try {
    console.log(req.session);
    res.redirect('/views/profile');
  } catch (error) {
    res.redirect('/views/error-login');
  }
};

export const logoutUserController = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/views');
      };
    });
  } catch (error) {
    next(error)
  }
};
