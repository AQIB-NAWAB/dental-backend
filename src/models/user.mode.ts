import mongoose from "mongoose";
import { Password } from "../utils/password";

interface UserAttrs {
    email: string;
    password: string;
    name: string;
    courses: Array<{ courseId: mongoose.Schema.Types.ObjectId; packageId: mongoose.Schema.Types.ObjectId; }>;
    role: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
    name: string;
    courses: Array<{ courseId: mongoose.Schema.Types.ObjectId; packageId: mongoose.Schema.Types.ObjectId; }>;
    role: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    courses: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course', 
            required: true
        },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package', 
            required: true
        }
    }],
    role: {
        type: String,
        required: true,
        default: "user"
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
