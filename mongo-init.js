db.createUser({
    user: "app_user",
    pwd: "app_password",
    roles: [
        { role: "readWrite", db: "users_db" },
        { role: "dbAdmin", db: "users_db" }
    ]
});

db.createCollection("users", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "password"],
            properties: {
                name: { bsonType: "string" },
                email: { bsonType: "string" },
                password: { bsonType: "string" },
                age: { bsonType: "int", minimum: 18 }
            }
        }
    }
});