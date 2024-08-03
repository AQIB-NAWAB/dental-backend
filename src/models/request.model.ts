import mongoose from "mongoose";

// Define the attributes for the Ticket
interface TicketAttrs {
  email?: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  packageId: mongoose.Schema.Types.ObjectId;
  pricePaid: number;
  paidThrough: string;
  receiptLink?: string;
  status: string;
  mocksPurcahsed?:number;
}

// Define the document interface for Mongoose
interface TicketDoc extends mongoose.Document {
  email?: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  packageId: mongoose.Schema.Types.ObjectId;
  pricePaid: number;
  paidThrough: string;
  receiptLink?: string;
  status: string;
  mocksPurcahsed:number;
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
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Package',
    },
    paidThrough: {
      type: String,
      required: true,
    },
    receiptLink: {
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
    mocksPurcahsed:{
      type:Number,
      required:true
    }
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