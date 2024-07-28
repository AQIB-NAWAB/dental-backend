import mongoose from "mongoose";

interface PackageAttrs {
    packageName: string;
    start : Date;
    end : Date;
    price: number;
    courseId: mongoose.Schema.Types.ObjectId;
    packageType: string;
    mocksPrices: Array<{quatity:number;price:number}>;


}

interface PackageModel extends mongoose.Model<PackageDoc> {
    build(attrs: PackageAttrs ): PackageDoc;
}

interface PackageDoc extends mongoose.Document {
    packageName: string;
    start : Date;
    end : Date;
    price: number;
    courseId: mongoose.Schema.Types.ObjectId;
    packageType: string;
    mocksPrices: Array<{quatity:number;price:number}>;
}

const packageSchema = new mongoose.Schema({
    packageName: {
        type: String,
        required: true,
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    packageType: {
        type: String,
        required: true,
    },
    mocksPrices: [{
        quatity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
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

packageSchema.statics.build = (attrs: PackageAttrs ) => {
    return new Package(attrs);
};


const Package = mongoose.model<PackageDoc, PackageModel>('Package', packageSchema);

export { Package };
