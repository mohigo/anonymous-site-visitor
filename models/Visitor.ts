import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true },
  firstVisit: { type: Date, required: true },
  lastVisit: { type: Date, required: true },
  visitCount: { type: Number, default: 1 },
  browser: { type: String },
  country: { type: String },
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' }
  }
}, {
  timestamps: true
});

export default mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema); 