const axios = require("axios");
const FormData = require("form-data");

const predictionUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000/predict";

const predictWaste = async (buffer) => {

    const form = new FormData();

    form.append(
        "image",
        buffer,
        "image.jpg"
    );

    const response = await axios.post(predictionUrl, form, {
        headers: form.getHeaders()
    });

    return response.data;
};

module.exports = predictWaste;