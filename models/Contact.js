import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

contactSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.read = ret.isRead;
    delete ret._id;
    delete ret.__v;
    delete ret.isRead;
    return ret;
  },
});

export const Contact = mongoose.model("Contact", contactSchema);
