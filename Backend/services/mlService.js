const axios = require("axios");
const FormData = require("form-data");

const predictWaste = async (buffer) => {

    const form = new FormData();

    form.append(
        "image",
        buffer,
        "image.jpg"
    );

    const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        form,
        {
            headers: form.getHeaders()
        }
    );

    return response.data;
};

module.exports = predictWaste;