const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const analyzeWasteImage = async () => {

    return JSON.stringify({
        wasteType: "Plastic Bottle",
        category: "Plastic",
        recyclable: true,
        ecoScore: 88,
        disposalMethod: "Recycle in Blue Bin",
        environmentalImpact:
            "Recycling plastic bottles reduces landfill waste and conserves resources.",
        recommendations: [
            "Wash before recycling",
            "Remove bottle cap",
            "Use recycling collection bins"
        ]
    });

};

module.exports = analyzeWasteImage;