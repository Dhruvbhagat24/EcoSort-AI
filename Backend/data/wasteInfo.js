module.exports = {

    plastic: {
        recyclable: true,
        ecoScore: 85,
        disposalMethod:
            "Recycle in blue bin",
        environmentalImpact:
            "Plastic can remain in landfills for hundreds of years.",
        recommendations: [
            "Clean before recycling",
            "Reuse whenever possible"
        ]
    },

    paper: {
        recyclable: true,
        ecoScore: 90,
        disposalMethod:
            "Paper recycling bin",
        environmentalImpact:
            "Recycling paper saves trees.",
        recommendations: [
            "Keep dry",
            "Avoid contamination"
        ]
    },

    metal: {
        recyclable: true,
        ecoScore: 95,
        disposalMethod:
            "Metal recycling center",
        environmentalImpact:
            "Metal recycling saves energy.",
        recommendations: [
            "Crush cans",
            "Remove food residue"
        ]
    },

    glass: {
        recyclable: true,
        ecoScore: 92,
        disposalMethod:
            "Glass recycling bin",
        environmentalImpact:
            "Glass can be recycled indefinitely.",
        recommendations: [
            "Rinse before recycling"
        ]
    },
    battery: {
    recyclable: true,
    ecoScore: 98,
    disposalMethod: "E-waste collection center",
    environmentalImpact: "Batteries can leak toxic chemicals into soil and water.",
    recommendations: [
        "Never throw in regular trash",
        "Use certified e-waste recycling points"
    ]
},

    biological: {
        recyclable: false,
        ecoScore: 80,
        disposalMethod: "Compost bin",
        environmentalImpact: "Organic waste decomposes naturally and can enrich soil.",
        recommendations: [
            "Use composting",
            "Separate from dry waste"
        ]
    },

    cardboard: {
        recyclable: true,
        ecoScore: 90,
        disposalMethod: "Paper recycling bin",
        environmentalImpact: "Recycling cardboard saves trees and energy.",
        recommendations: [
            "Flatten boxes",
            "Keep dry before recycling"
        ]
    },

    clothes: {
        recyclable: true,
        ecoScore: 75,
        disposalMethod: "Textile recycling center",
        environmentalImpact: "Textile waste contributes significantly to landfills.",
        recommendations: [
            "Donate usable clothes",
            "Use textile recycling programs"
        ]
    },

    shoes: {
        recyclable: true,
        ecoScore: 70,
        disposalMethod: "Footwear recycling program",
        environmentalImpact: "Shoes take many years to decompose.",
        recommendations: [
            "Donate wearable shoes",
            "Recycle through footwear collection drives"
        ]
    },

    trash: {
        recyclable: false,
        ecoScore: 30,
        disposalMethod: "General waste bin",
        environmentalImpact: "Landfill waste increases pollution and methane emissions.",
        recommendations: [
            "Reduce consumption",
            "Separate recyclables before disposal"
        ]
    }
};