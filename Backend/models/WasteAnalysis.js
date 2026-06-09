const mongoose = require("mongoose");

const wasteSchema =
new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },


    imageUrl:String,

    wasteType:String,

    confidence: {
        type: Number,
        default: 0
    },

    category:String,

    recyclable:Boolean,

    ecoScore:Number,

    disposalMethod:String,

    environmentalImpact:String,

    recommendations:[String]

},
{
    timestamps:true
});

module.exports = mongoose.model(
    "WasteAnalysis",
    wasteSchema
);