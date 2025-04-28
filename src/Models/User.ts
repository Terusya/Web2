import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

const PASSWORD_MIN_LENGTH = 6;
const AGE_MIN_VALUE = 18;
const BCRYPT_SALT_ROUNDS = 12;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    age?: number;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be longer than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [
            PASSWORD_MIN_LENGTH,
            `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
        ],
        select: false
    },
    age: {
        type: Number,
        min: [
            AGE_MIN_VALUE,
            `Minimum allowed age is ${AGE_MIN_VALUE}`
        ],
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Хеширование пароля перед сохранением
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Метод сравнения паролей
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);