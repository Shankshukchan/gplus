import { Project } from "../models/Project.js";
import { uploadToCloudinary, destroyCloudinaryImage } from "../config/cloudinary.js";

export async function getAllProjects(req, res) {
  try {
    const { featured, category } = req.query;
    const filter = {};
    if (featured !== undefined) filter.featured = featured === "true";
    if (category) filter.category = category;

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ project });
  } catch (err) {
    console.error("Get project error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createProject(req, res) {
  try {
    const { title, description, category, tags, featured } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (title.trim().length < 2 || title.trim().length > 200) {
      return res.status(400).json({ error: "Title must be between 2 and 200 characters" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Description is required" });
    }
    if (description.length > 5000) {
      return res.status(400).json({ error: "Description must be under 5000 characters" });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Category is required" });
    }
    if (!tags) {
      return res.status(400).json({ error: "At least one tag is required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Project image is required" });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    const imageUrl = result.secure_url;

    const tagsArr = typeof tags === "string"
      ? tags.split(",").map(t => t.trim()).filter(Boolean)
      : tags;

    const project = await Project.create({
      title,
      description: description || null,
      category: category || null,
      tags: tagsArr,
      imageUrl,
      featured: featured === true || featured === "true",
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProject(req, res) {
  try {
    const existing = await Project.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { title, description, category, tags, featured } = req.body;
    const fields = {};

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ error: "Title is required" });
      if (title.trim().length < 2 || title.trim().length > 200) {
        return res.status(400).json({ error: "Title must be between 2 and 200 characters" });
      }
      fields.title = title;
    }
    if (description !== undefined) {
      if (!description.trim()) return res.status(400).json({ error: "Description is required" });
      if (description.length > 5000) return res.status(400).json({ error: "Description must be under 5000 characters" });
      fields.description = description;
    }
    if (category !== undefined) {
      if (!category.trim()) return res.status(400).json({ error: "Category is required" });
      fields.category = category;
    }
    if (tags !== undefined) {
      const parsed = typeof tags === "string"
        ? tags.split(",").map(t => t.trim()).filter(Boolean)
        : tags;
      if (parsed.length === 0) return res.status(400).json({ error: "At least one tag is required" });
      fields.tags = parsed;
    }
    if (featured !== undefined) fields.featured = featured === true || featured === "true";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      fields.imageUrl = result.secure_url;

      if (existing.imageUrl) {
        const publicId = extractPublicId(existing.imageUrl);
        if (publicId) {
          destroyCloudinaryImage(publicId).catch(() => {});
        }
      }
    }

    const project = await Project.findByIdAndUpdate(req.params.id, fields, { new: true });
    res.json({ project });
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.imageUrl) {
      const publicId = extractPublicId(project.imageUrl);
      if (publicId) {
        destroyCloudinaryImage(publicId).catch(() => {});
      }
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

function extractPublicId(url) {
  if (!url) return null;
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  return parts.slice(uploadIndex + 2).join("/").replace(/\.[^.]+$/, "");
}
