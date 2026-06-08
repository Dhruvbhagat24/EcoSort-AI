const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "EcoSort AI API",
      version: "1.0.0",
      description:
        "AI Powered Waste Segregation Assistant API"
    },

    servers: [
      {
        url: "http://localhost:5000"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [
    "./routes/*.js"
  ]
};

const swaggerSpec =
  swaggerJsdoc(options);

module.exports = swaggerSpec;