const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, 'Set a password for the user'],
      minLength: 8,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      maxLength: 100,
      lowercase: true,
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    avatarURL: String,
    token: String,
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verification token is required'],
    },
  },

  { versionKey: false, timestamps: true }
);

const schema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().required().min(8).max(50),
  subscription: Joi.string()
    .valid('starter', 'pro', 'business')
    .default('starter'),
});

const updateSchema = Joi.object({
  subscription: Joi.string().valid('starter', 'pro', 'business').allow(null),
});

const verifySchema = Joi.object({
  email: Joi.string().email().required(),
});

const schemas = {
  schema,
  updateSchema,
  verifySchema,
};

const User = mongoose.model('user', userSchema);

module.exports = {
  User,
  schemas,
};
