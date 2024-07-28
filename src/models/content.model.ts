import mongoose from "mongoose";

interface ContentAttrs {
    courseId: mongoose.Schema.Types.ObjectId;
    packageId: mongoose.Schema.Types.ObjectId;
    packageName: string;
    contentType: string;
    mockLink: string;
    weekNo: number;
    topic: string;
    meetLink:string;
    pdfLink:string;
    lectureNo:number;
}

interface ContentModel extends mongoose.Model<ContentDoc> {
    build(attrs: ContentAttrs ): ContentDoc;
}

interface ContentDoc extends mongoose.Document {

    courseId: mongoose.Schema.Types.ObjectId;
    packageId: mongoose.Schema.Types.ObjectId;
    packageName: string;
    contentType: string;
    mockLink: string;
    weekNo: number;
    topic: string;
    meetLink:string;
    pdfLink:string;
    lectureNo:number;

    
}

const contentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    packageName: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    mockLink: {
        type: String,
        required: true
    },
    weekNo: {
        type: Number,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    meetLink: {
        type: String,
        required: true
    },
    pdfLink: {
        type: String,
        required: true
    },
    lectureNo: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

contentSchema.statics.build = (attrs: ContentAttrs ) => {
    return new Content(attrs);
};


const Content = mongoose.model<ContentDoc, ContentModel>('Content', contentSchema);

export { Content };
