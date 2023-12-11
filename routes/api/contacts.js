const express = require('express');
const queries = require('../../controllers/contacts');
const { createBodyValidator, authenticate } = require('../../middleware/middleware');
const { joiSchema, addToFavorites } = require('../../models/joi');
const router = express.Router();
const isValidId = require('../../middleware/isValidId');

const CONTACTS_PATH = '/';
const CONTACT_ID_PATH = '/:contactId';
const FAVORITE_PATH = '/:contactId/favorite';

router.get(CONTACTS_PATH, authenticate, queries.listContacts);


router.get(CONTACT_ID_PATH, authenticate, isValidId, queries.getContactById);

router.post(
  CONTACTS_PATH,
  authenticate,
  createBodyValidator(joiSchema),
  queries.addContact
);

router.delete(CONTACT_ID_PATH, authenticate, isValidId, queries.removeContact);

router.put(
  CONTACT_ID_PATH,
  authenticate,
  createBodyValidator(joiSchema),
  isValidId,
  queries.updateContact
);

router.patch(
  FAVORITE_PATH,
  authenticate,
  createBodyValidator(addToFavorites),
  isValidId,
  queries.addToFavorites
);

module.exports = router;