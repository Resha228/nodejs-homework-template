const express = require('express');
const queries = require('../../models/contacts');
const { bodyValidator } = require('../../middleware/middleware');
const { joiSchema, addToFavorites } = require('../../models/joi');
const isValidId = require('../../middleware/isValidId'); 

const router = express.Router();

const CONTACTS_PATH = '/';
const CONTACT_ID_PATH = '/:contactId';
const FAVORITE_PATH = '/:contactId/favorite';


router.get(CONTACTS_PATH, queries.listContacts);
router.get(CONTACT_ID_PATH, isValidId, queries.getContactById);
router.post(CONTACTS_PATH, bodyValidator(joiSchema), queries.addContact);
router.delete(CONTACT_ID_PATH, isValidId, queries.removeContact);
router.put(CONTACT_ID_PATH, bodyValidator(joiSchema), isValidId, queries.updateContact);
router.patch(FAVORITE_PATH, bodyValidator(addToFavorites), isValidId, queries.addToFavorites);

module.exports = router;

