const fs = require('fs/promises');
const path = require('path');
const short = require('short-uuid');

const translator = short();

const contactsPath = path.join(__dirname, 'contacts.json');

const generateShortId = () => {
  return translator.new();
};

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, { encoding: 'utf-8' });
    const contacts = JSON.parse(data);
    return contacts;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contactById = contacts.find((contact) => contact.id === contactId);
    return contactById;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contactById = await getContactById(contactId);
    const newContacts = contacts.filter((contact) => contact.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(newContacts), null, 2);
    return contactById;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const addContact = async (body) => {
  try {
    const contacts = await listContacts();
    const { name, email, phone } = body;
    const newContact = { id: generateShortId(), name, email, phone };
    const newContactsList = [...contacts, newContact];
    await fs.writeFile(contactsPath, JSON.stringify(newContactsList, null, 2), {
      encoding: 'utf-8',
    });
    return newContact;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contacts = await listContacts();
    const contactById = await getContactById(contactId);
    if (contactById) {
      const updatedContacts = contacts.map((contact) =>
        contact.id === contactId ? { ...contact, ...body } : contact
      );
      await fs.writeFile(
        contactsPath,
        JSON.stringify(updatedContacts, null, 2),
        { encoding: 'utf-8' }
      );
      return updatedContacts;
    }
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
};
