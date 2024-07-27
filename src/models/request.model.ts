import mongoose from "mongoose";

// Define the attributes for the Ticket
interface TicketAttrs {
  email: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  packageId: mongoose.Schema.Types.ObjectId;
  pricePaid: number;
  paidThrough: string;
  cardNumber?: string;
  status: string;
  
}

// Define the document interface for Mongoose
interface TicketDoc extends mongoose.Document {
  email: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  packageId: mongoose.Schema.Types.ObjectId;
  pricePaid: number;
  paidThrough: string;
  cardNumber?: string;
  status: string;
}

// Define the model interface for Mongoose
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// Define the schema for the Ticket
const ticketSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    paidThrough: {
      type: String,
      required: true,
    },
    cardNumber: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
    },
    pricePaid: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Static method to build a new Ticket
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

// Create the Ticket model
const Ticket = mongoose.model<TicketDoc, TicketModel>("Request", ticketSchema);

export { Ticket };