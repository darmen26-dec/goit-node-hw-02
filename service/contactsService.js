const { Contact } = require('../schemas/contactsSchema');

const listContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

const getContactById = async (contactId) => {
  try {
    const foundContact = await Contact.findOne({ _id: contactId });
    return foundContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const removeContact = async (contactId) => {
  try {
    const removedContact = await Contact.findByIdAndDelete({ _id: contactId });
    return removedContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const addContact = async (body) => {
  try {
    const newContact = await Contact.create(body);
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

const updateStatusContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      { _id: contactId },
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
