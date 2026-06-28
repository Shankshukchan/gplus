import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  category: { type: String, default: null },
  tags: { type: [String], default: [] },
  imageUrl: { type: String, default: null },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

projectSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Project = mongoose.model("Project", projectSchema);
