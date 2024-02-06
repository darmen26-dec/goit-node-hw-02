const express = require('express');
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require('../../models/contacts');

const validate = require('../../utils/validation');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const contacts = await listContacts();
  res.status(200).json({ contacts });
});

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (contact) {
    return res.status(200).json({ contact });
  } else {
    return res.status(404).json({ message: 'Not found' });
  }
});

router.post('/', validate.contactValidator, async (req, res, next) => {
  const newContact = await addContact(req.body);
  res.json({ status: 'success', code: 201, data: { newContact } });
});

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await removeContact(contactId);
  if (contact) {
    return res.status(200).json({ message: 'contact deleted' });
  } else {
    return res.status(404).json({ message: 'Not found' });
  }
});

router.put(
  '/:contactId',
  validate.contactUpdateValidator,
  async (req, res, next) => {
    const { contactId } = req.params;
    const contactToEdit = await updateContact(contactId, req.body);
    if (contactToEdit) {
      return res.json({
        status: 'success',
        code: 200,
        data: { contactToEdit },
        message: 'Contact has been updated successfully',
      });
    } else {
      return res.json({ code: 404, message: 'Not found' });
    }
  }
);

module.exports = router;
