import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

interface SwaggerOptions {
    definition: {
        openapi: string;
        info: {
            title: string;
            version: string;
            description: string;
        };
        servers: Array<{
            url: string;
            description: string;
        }>;
        components: {
            schemas: {
                User: {
                    type: string;
                    properties: {
                        name: { type: string; example: string };
                        email: { type: string; format: string; example: string };
                        age: { type: string; example: number; minimum: number };
                    };
                    required: string[];
                };
            };
        };
    };
    apis: string[];
}

const options: SwaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Management API',
            version: '1.0.0',
            description: 'API дл€ управлени€ пользовател€ми'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Ћокальный сервер'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com'
                        },
                        age: {
                            type: 'number',
                            example: 25,
                            minimum: 18
                        }
                    },
                    required: ['name', 'email']
                }
            }
        }
    },
    apis: ['./src/app.ts']
};

export const setupSwagger = (app: Express) => {
    const specs = swaggerJSDoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};