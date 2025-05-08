import swaggerJsdoc from "swagger-jsdoc";
// import swaggerUi from 'swagger-ui-express';
// import { Express } from 'express';
import * as path from "path";

console.log("[swagger] __dirname:", __dirname); // 디버깅용

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Simulation Game API",
      version: "1.0.0",
      description: "프로토타입 API 문서",
    },
    servers: [
      {url: "http://localhost:5001/starfish-e4df9/us-central1/api"}, // 로컬 emulator용 주소
      // { url: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/api` }, // 배포 주소
    ],
  },
  // apis: ['./src/routes/*.ts'],
  // apis: [path.join(__dirname, '../routes/*.js')],
  apis: [path.resolve(__dirname, "routes/*.js")],
});

// const specs = swaggerJsdoc();

// console.log(JSON.stringify(swaggerSpec, null, 2));

/* export function setupSwagger(app: Express)
{
  console.log("setup starts!\n");
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("setup end!\n");
}*/

export default swaggerSpec;
