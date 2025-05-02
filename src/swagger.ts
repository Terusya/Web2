import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path'; // ��������� ������ ��� ������ � ������

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Auth API',
            version: '1.0.0',
            description: 'API ��� �������������� � ���������� ��������������'
        },
        tags: [
            { name: 'Authentication', description: '����������� � ���� � �������' },
            { name: 'Users', description: '���������� ��������������' }
        ],
        servers: [
            {
                url: 'http://localhost:3000',
                description: '��������� ������'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        password: {
                            type: 'string',
                            example: 'secret123',
                            minLength: 6
                        },
                        age: { type: 'number', minimum: 18, example: 25 }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'secret123' }
                    }
                }
            }
        }
    },
    apis: [path.join(__dirname, 'app.ts')] // ���������� ���������� ����
};

export const setupSwagger = (app: Express) => {
    const specs = swaggerJSDoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};