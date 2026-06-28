import mongoose from "mongoose";

const demoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, default: null },
  preferredDate: { type: String, default: null },
  message: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  callStatus: { type: String, enum: ["pending", "done", "missed"], default: "pending" },
}, { timestamps: true });

demoSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.read = ret.isRead;
    ret.callStatus = ret.callStatus || "pending";
    delete ret._id;
    delete ret.__v;
    delete ret.isRead;
    return ret;
  },
});

export const DemoRequest = mongoose.model("DemoRequest", demoSchema);
