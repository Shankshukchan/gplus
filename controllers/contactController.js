import { Contact } from "../models/Contact.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,20}$/;

export async function createContact(req, res) {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ error: "Name must be between 2 and 100 characters" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (phone && phone.trim() && !PHONE_RE.test(phone.trim())) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ error: "Message must be at least 10 characters" });
    }
    if (message.trim().length > 5000) {
      return res.status(400).json({ error: "Message must be under 5000 characters" });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      message: message.trim(),
    });
    res.status(201).json({ contact });
  } catch (err) {
    console.error("Create contact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllContacts(req, res) {
  try {
    const { sort, read } = req.query;
    const filter = {};
    if (read !== undefined) filter.isRead = read === "true";

    const sortOrder = sort === "asc" ? 1 : -1;
    const contacts = await Contact.find(filter).sort({ createdAt: sortOrder });
    const unreadCount = await Contact.countDocuments({ isRead: false });
    const totalCount = await Contact.countDocuments();

    res.json({ contacts, unreadCount, totalCount });
  } catch (err) {
    console.error("Get contacts error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getContact(req, res) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ contact });
  } catch (err) {
    console.error("Get contact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markContactRead(req, res) {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ contact });
  } catch (err) {
    console.error("Mark contact read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteContact(req, res) {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error("Delete contact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
