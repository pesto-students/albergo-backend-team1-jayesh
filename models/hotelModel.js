import { Schema, model } from 'mongoose';
// import slugify from 'slugify';

const hotelSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A hotel must have a name'],
    },
    slug: String,
    hotelPhone: {
        type: Number,
        required: [true, 'A hotel must have a phone number'],
        unique: true
    },
    hotelEmail: {
        type: String,
        unique: true,
        sparse: true,
        required: [true, 'A hotel must have an email address']
    },
    hotelAddress: {
        type: String,
        required: [true, 'A hotel must have an address']
    },
    hotelCity: {
        type: String,
        required: [true, 'A hotel must have a city location']
    },
    hotelState: {
        type: String,
        required: [true, 'A hotel must have a state location']
    },
    hotelCountry: {
        type: String,
        required: [true, 'A hotel must have a country location']
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    coordinates: {
        type: Number
    },
    // "locations": {
    //     "type": {
    //         "type": String,
    //         "enum": ["Point"],
    //         "required": true
    //     },
    //     "coordinates": [Number]
    // },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [0, 'Ratings must be above 0'],
        max: [5, 'Ratings must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    hotelDescription: {
        type: String,
        trim: true,
    },
    // imageCover: {
    //     type: String,
    //     required: [true, 'A hotel must have a cover image']
    // },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    hotelEmp: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

function generateUID(hotelName, hotelCity) {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = (hotelName.replace(" ", "-").slice(0, 3) + firstPart.toString(36)).slice(-3);
    secondPart = (hotelCity.slice(0, 3) + secondPart.toString(36)).slice(-3);
    const result = firstPart + secondPart;
    return result.toString().toLowerCase().trim();
}


// Document middleware
hotelSchema.pre('save', function (next) {
    this.slug = generateUID(this.name, this.hotelCity)
    // this.slug = slugify(this.name.concat(this.id), { lower: true });
    next();
});

const HotelModel = model('Hotel', hotelSchema);

export default HotelModel;