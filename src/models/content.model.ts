import mongoose from "mongoose";

interface ContentAttrs {
    courseId: mongoose.Schema.Types.ObjectId;
    packageId: mongoose.Schema.Types.ObjectId;
    packageName: string;
    contentType: string;
    topic: string;
    videoLink:string;
    pdfLink:string;
}

interface ContentModel extends mongoose.Model<ContentDoc> {
    build(attrs: ContentAttrs ): ContentDoc;
}

interface ContentDoc extends mongoose.Document {

    courseId: mongoose.Schema.Types.ObjectId;
    packageId: mongoose.Schema.Types.ObjectId;
    packageName: string;
    contentType: string;
    topic: string;
    videoLink:string;
    pdfLink:string;

    
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
    topic: {
        type: String,
    },
    videoLink: {
        type: String,
    },
    pdfLink: {
        type: String,
    },
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
