import { DemoRequest } from "../models/DemoRequest.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,20}$/;

export async function createDemoRequest(req, res) {
  try {
    const { name, email, phone, service, preferredDate, message } = req.body;

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
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    if (!PHONE_RE.test(phone.trim())) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    const demo = await DemoRequest.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service: service || null,
      preferredDate: preferredDate || null,
      message: message || null,
    });

    res.status(201).json({ demo });
  } catch (err) {
    console.error("Create demo request error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllDemoRequests(req, res) {
  try {
    const { sort, read, date } = req.query;
    const filter = {};
    if (read !== undefined) filter.isRead = read === "true";
    if (date) filter.preferredDate = date;

    const sortOrder = sort === "asc" ? 1 : -1;
    const demos = await DemoRequest.find(filter).sort({ createdAt: sortOrder });
    const unreadCount = await DemoRequest.countDocuments({ isRead: false });
    const totalCount = await DemoRequest.countDocuments();

    res.json({ demos, unreadCount, totalCount });
  } catch (err) {
    console.error("Get demo requests error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markDemoRead(req, res) {
  try {
    const demo = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!demo) {
      return res.status(404).json({ error: "Demo request not found" });
    }
    res.json({ demo });
  } catch (err) {
    console.error("Mark demo read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateDemoCallStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["pending", "done", "missed"].includes(status)) {
      return res.status(400).json({ error: "Status must be one of: pending, done, missed" });
    }

    const demo = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      { callStatus: status, isRead: status === "done" ? true : undefined },
      { new: true }
    );
    if (!demo) {
      return res.status(404).json({ error: "Demo request not found" });
    }
    res.json({ demo });
  } catch (err) {
    console.error("Update demo call status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteDemoRequest(req, res) {
  try {
    const demo = await DemoRequest.findByIdAndDelete(req.params.id);
    if (!demo) {
      return res.status(404).json({ error: "Demo request not found" });
    }
    res.json({ message: "Demo request deleted successfully" });
  } catch (err) {
    console.error("Delete demo request error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
