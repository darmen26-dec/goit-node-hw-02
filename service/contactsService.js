const { Contact } = require('../schemas/contacts.schema');

const listContacts = async (ownerId) => {
  try {
    const contacts = await Contact.find({ owner: ownerId });
    return contacts;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

const getContactById = async (contactId, ownerId) => {
  try {
    const foundContact = await Contact.findOne({
      _id: contactId,
      owner: ownerId,
    });
    return foundContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const removeContact = async (contactId, ownerId) => {
  try {
    const removedContact = await Contact.findByIdAndDelete({
      _id: contactId,
      owner: ownerId,
    });
    return removedContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const addContact = async (body, ownerId) => {
  try {
    const newContact = await Contact.create(body, ownerId);
    return newContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      { _id: contactId },
      body,
      { new: true }
    );
    return updatedContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const updateStatusContact = async (contactId, body, ownerId) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      { _id: contactId, owner: ownerId },
      { favorite: body.favorite },
      { new: true }
    );
    return updatedContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
