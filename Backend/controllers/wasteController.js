const WasteAnalysis = require("../models/WasteAnalysis");

const predictWaste =
require("../services/mlService");

const wasteInfo =
require("../data/wasteInfo");

exports.analyzeWaste = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const prediction =
            await predictWaste(
                req.file.buffer
            );

        console.log(
            "Prediction:",
            prediction
        );

        const info =
            wasteInfo[
                prediction.category
            ];

        if (!info) {
            return res.status(400).json({
                message:
                `No mapping found for ${prediction.category}`
            });
        }

        const saved =
            await WasteAnalysis.create({

                userId:
                    req.user.id,

                wasteType:
                    prediction.category,

                category:
                    prediction.category,

                confidence:
                    prediction.confidence,

                recyclable:
                    info.recyclable,

                ecoScore:
                    info.ecoScore,

                disposalMethod:
                    info.disposalMethod,

                environmentalImpact:
                    info.environmentalImpact,

                recommendations:
                    info.recommendations
            });

        res.status(200).json(saved);

    }
    catch(error){

        console.error(error);

        res.status(500).json({
            message:error.message
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
                item.category === "plastic"
            ).length;

        const paper =
            analyses.filter(
                item =>
                item.category === "paper"
            ).length;

        const metal =
            analyses.filter(
                item =>
                item.category === "metal"
            ).length;

        const glass =
            analyses.filter(
                item =>
                item.category === "glass"
            ).length;

        const organic =
            analyses.filter(
                item =>
                item.category === "organic"
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