const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const Jimp = require('jimp');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const HttpError = require('../httpErrors/errors');
const { User } = require('../models/userSchema');
const sendEmail = require('../middleware/helper');

const secret = process.env.SECRET_KEY;

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw HttpError(400, 'Email and password are required!');
    }

    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, 'Email in use!');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    const verificationToken = crypto.randomUUID();

    await sendEmail({
      to: email,
      subject: 'Welcome to your Contact Book!',
      html: `To confirm your registration please click on the link`,
      text: `To confirm your registration please open the link`,
    });

    await User.create({
      ...req.body,
      verificationToken,
      password: hashPassword,
      avatarURL,
    });

    res
      .status(201)
      .send({ message: 'Registration successfully', verificationToken });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw HttpError(400, 'Email and password are required!');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(401, 'Email or password is wrong!');
    }

    const compareResult = await bcrypt.compare(password, user.password);

    if (!compareResult) {
      throw HttpError(401, 'Email or password is wrong!');
    }

    if (user.verify !== true) {
      return res.status(401).send({ message: 'Your account is not verified!' });
    }

    const id = user._id;

    const token = jwt.sign({ id }, secret, { expiresIn: '20h' });

    await User.findByIdAndUpdate(id, { token });
    res.status(201).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const { _id } = req.user;

    await User.findByIdAndUpdate(_id, { token: '' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function current(req, res, next) {
  try {
    const { email, subscription } = req.user || {};

    if (!email || !subscription) {
      throw new HttpError(401, 'Unauthorized.');
    }

    res.json({
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateAvatar(req, res, next) {
  try {
    const { _id } = req.user;

    const avatarDir = path.join(__dirname, '../public/avatars');

    if (!req.file) {
      const defaultImage = path.join(
        __dirname,
        '../public/avatars/deafault-avatar.jpg'
      );
      const filename = `deafault-avatar.jpg`;
      await fs.copyFile(defaultImage, path.join(avatarDir, filename));
      const avatarURL = path.join('avatars', filename);
      await User.findByIdAndUpdate(_id, { avatarURL });
      return res.json({
        avatarURL,
      });
    }

    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;

    const resultUpload = path.join(avatarDir, originalname);

    const loadedImage = await Jimp.read(tempUpload);
    await loadedImage.resize(250, 250).write(resultUpload);

    await fs.unlink(tempUpload);

    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({
      verificationToken: verificationToken,
    }).exec();

    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.send({ message: 'Verification successful!' });
  } catch (error) {
    next(error);
  }
}

async function sendVerify(req, res, next) {
  const { email } = req.body;
  try {
    if (!email) {
      throw HttpError(400, 'Email is required!');
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(400).send({ message: 'Missing required field email!' });
    }

    if (user.verify) {
      return res
        .status(400)
        .send({ message: 'Verification has already been passed!' });
    }

    await sendEmail({
      to: email,
      subject: 'Welcome to your Contact Book!',
      html: `To confirm your registration please click on the link`,
      text: `To confirm your registration please open the link`,
    });

    res.status(200).json({
      message: 'Verification email sent.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  current,
  updateAvatar,
  verify,
  sendVerify,
};
