import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    enum: ['contact_form', 'contact_sales', 'start_pro', 'start_free'],
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'completed'],
    default: 'new',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model is already defined to prevent recompilation in development
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact; 