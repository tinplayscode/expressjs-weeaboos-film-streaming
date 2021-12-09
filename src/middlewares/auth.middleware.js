import jwt from "jsonwebtoken";
import createError from "http-errors";
import User from "../components/auth/userModel";

// declare auth middleware
export async function requireAuth(req, res, next) {
  // check if user token is valid
  try {
    const token = req.cookies.token;

    if (!token) throw new Error("User not logged in");

    const user = await jwt.verify(token, process.env.JWT_SECRET);

    // pass user to hbs
    res.locals.user = user;

    next();
  } catch (err) {
    next(createError(401, err.message));
  }
}

// middleware if user is login, add user to locals
export async function checkAuth(req, res, next) {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, process.env.JWT_SECRET, function (err, user) {
      if (err) {
        res.clearCookie("token");
        res.redirect("/login");
        return;
      }

      res.locals.user = user;

      // set last login time
      User.findOne({ _id: user.id }).then((user) => {
        user.setLastLogin();
      });

      next();
    });
  } else {
    next();
  }
}

export function requireAdmin(req, res, next) {
  try {
    // console.log(res.locals);
    if (res.locals?.user?.role !== "admin") {
      throw new Error("User not authorized");
    }

    next();
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/");
  }
}
