

import mongoose from "mongoose";
import { Password } from "../utils/password";

interface CourseAttrs {
    title: string;
    description: string;
    image: string;
    packages:Array<{packageId:mongoose.Schema.Types.ObjectId}>;
}

interface CourseModel extends mongoose.Model<CourseDoc> {
    build(attrs: CourseAttrs): CourseDoc;
}

interface CourseDoc extends mongoose.Document {
    title: string;
    description: string;
    image: string;
    packages:Array<{packageId:mongoose.Schema.Types.ObjectId}>;
}

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
    ,
    packages: [{
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package',
            required: true
        }
    }]
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

courseSchema.statics.build = (attrs: CourseAttrs) => {
    return new Course(attrs);
};


const Course = mongoose.model<CourseDoc, CourseModel>('Course', courseSchema);

export { Course };
