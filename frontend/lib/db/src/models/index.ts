import { Schema, model, type Document, type Types } from "mongoose";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  skinToneEstimate?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    skinToneEstimate: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

export const User = model<IUser>("User", userSchema);

// ─── Spot ─────────────────────────────────────────────────────────────────────

export interface ISpot extends Document {
  userId: Types.ObjectId;
  label: string;
  bodyRegion?: string;
  createdAt: Date;
}

const spotSchema = new Schema<ISpot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, trim: true },
    bodyRegion: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

export const Spot = model<ISpot>("Spot", spotSchema);

// ─── PhotoEntry ───────────────────────────────────────────────────────────────

export interface IPhotoEntry extends Document {
  spotId: Types.ObjectId;
  imageUrl: string;
  capturedAt: Date;
  concernType?: string;
  severity?: "mild" | "moderate" | "severe";
  confidence?: number;
}

const photoEntrySchema = new Schema<IPhotoEntry>(
  {
    spotId: { type: Schema.Types.ObjectId, ref: "Spot", required: true, index: true },
    imageUrl: { type: String, required: true },
    capturedAt: { type: Date, default: Date.now },
    concernType: { type: String },
    severity: { type: String, enum: ["mild", "moderate", "severe"] },
    confidence: { type: Number, min: 0, max: 1 },
  },
  { timestamps: false },
);

export const PhotoEntry = model<IPhotoEntry>("PhotoEntry", photoEntrySchema);

// ─── CareCard ─────────────────────────────────────────────────────────────────

export interface ICareCard extends Document {
  photoEntryId: Types.ObjectId;
  generatedText: string;
  routineSteps: string[];
  ingredients: string[];
  urgencyLevel: "low" | "medium" | "high";
  createdAt: Date;
}

const careCardSchema = new Schema<ICareCard>(
  {
    photoEntryId: {
      type: Schema.Types.ObjectId,
      ref: "PhotoEntry",
      required: true,
      unique: true,
    },
    generatedText: { type: String, required: true },
    routineSteps: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

export const CareCard = model<ICareCard>("CareCard", careCardSchema);
