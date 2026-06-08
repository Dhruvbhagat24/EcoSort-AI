const cloudinary = require("../config/cloudinary");
const WasteAnalysis = require("../models/WasteAnalysis");

const analyzeWasteImage =
require("../services/geminiService");

exports.analyzeWaste = async (req, res) => {

    try {

        console.log("FILE RECEIVED:", req.file?.originalname);

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const imageBase64 =
            req.file.buffer.toString("base64");

        console.log("Calling Gemini...");

        const geminiResult =
            await analyzeWasteImage(imageBase64);

        console.log("Gemini Result:");
        console.log(geminiResult);

        let analysis;

        try {
            const cleanResult = geminiResult
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            analysis = JSON.parse(cleanResult);
        }
        catch (err) {
            return res.status(500).json({
                message: "Invalid Gemini JSON",
                data: geminiResult
            });
        }

        const saved =
            await WasteAnalysis.create({
                userId: req.user.id,
                wasteType: analysis.wasteType,
                category: analysis.category,
                recyclable: analysis.recyclable,
                ecoScore: analysis.ecoScore,
                disposalMethod: analysis.disposalMethod,
                environmentalImpact: analysis.environmentalImpact,
                recommendations: analysis.recommendations
            });

        res.status(200).json(saved);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
};

exports.getHistory = async (req, res) => {

    try {

        const history = await WasteAnalysis
            .find({
                userId: req.user.id
            })
            .sort({ createdAt: -1 });

        res.status(200).json(history);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.getStats = async (req, res) => {

    try {

        const userId = req.user.id;

        const analyses =
            await WasteAnalysis.find({
                userId
            });

        const totalUploads =
            analyses.length;

        const plastic =
            analyses.filter(
                item =>
                item.category === "Plastic"
            ).length;

        const paper =
            analyses.filter(
                item =>
                item.category === "Paper"
            ).length;

        const metal =
            analyses.filter(
                item =>
                item.category === "Metal"
            ).length;

        const glass =
            analyses.filter(
                item =>
                item.category === "Glass"
            ).length;

        const organic =
            analyses.filter(
                item =>
                item.category === "Organic"
            ).length;

        const averageEcoScore =
            totalUploads > 0
                ? Math.round(
                    analyses.reduce(
                        (sum, item) =>
                            sum +
                            (item.ecoScore || 0),
                        0
                    ) / totalUploads
                )
                : 0;

        res.json({
            totalUploads,
            plastic,
            paper,
            metal,
            glass,
            organic,
            averageEcoScore
        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

exports.getRecentScans = async (req, res) => {

    try {

        const recentScans =
            await WasteAnalysis.find({
                userId: req.user.id
            })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json(recentScans);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};