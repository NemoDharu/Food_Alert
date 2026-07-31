import * as mongodb from "mongodb";
import { Collection, Db } from "mongodb";
import { Employee } from "./employee";
import { UserInfo , StationDetails, TrainInfo, TrainRunning, ProfileInfo, TrainStops, FoodItems, SideDish, SelectFood } from "./datatype_db_config";


export const collections: {
    employees?: mongodb.Collection<Employee>;
    userinformation?: mongodb.Collection<UserInfo>;
    station_details?: mongodb.Collection<StationDetails>;
    TrainVehicle?: mongodb.Collection<TrainInfo>;
    TrainOnRunning?: mongodb.Collection<TrainRunning>;
    profileinfo?: mongodb.Collection<ProfileInfo>;
    Train_stops?: mongodb.Collection<TrainStops>;
    Food_items?: mongodb.Collection<FoodItems>;
    Side_dish?: mongodb.Collection<SideDish>;
    Select_Food?: mongodb.Collection<SelectFood>;
} = {};

    const employeesSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "position", "level", "title", "age"],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is required and is a string",
                },
                position: {
                    bsonType: "string",
                    description: "'position' is required and is a string",
                    minLength: 5
                },
                level: {
                    bsonType: "string",
                    description: "'level' is required and is one of 'junior', 'mid', or 'senior'",
                    enum: ["junior", "mid", "senior"],
                },
                title: {
                    bsonType: "string",
                    description: "'title' is required and is a string",
                },
                age: {
                    bsonType: "string",
                    description: "'age' is required and is a string",
                },
            },
        },
    };

const userInfoSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["user_id","username", "email","age","balance","gender","phone_no","password"],
        additionalProperties: false,
        properties: {
            _id: {},
            user_id: {
                bsonType: "number",
                description: "'user_id' is required and is a number",
            },
            username: {
                bsonType: "string",
                description: "'username' is required and is a string",
            },
            email: {
                bsonType: "string",
                description: "'email' is required and is a string",
                // Add additional validation as needed
            },
            age: {
                bsonType: "number",
                description: "'age' is required and is a number",
            },
            balance: {
                bsonType: "number",
                description: "'balance' is required and is a number",
            },
            gender: {
                bsonType: "string",
                description: "'gender' is required and is one of 'male', 'female', or 'other'",
                enum: ["male", "female", "other"],
            },
            phone_no: {
                bsonType: "string",
                description: "'phone_no' is required and is a string",
            },
            password: {
                bsonType: "string",
                description: "'password' is required and is a string",
            },
            // Add other properties and their validation as needed
        },
    },
};


const stationdetailsSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["station_id","station_name", "station_code","city","state","created_date"],
        additionalProperties: false,
        properties: {
            _id: {},
            station_id: {
                bsonType: "number",
                description: "'station_id' is required and is a number",
            },
            station_name: {
                bsonType: "string",
                description: "'station_name' is required and is a string",
            },
            station_code: {
                bsonType: "string",
                description: "'station_code' is required and is a string",
            },
            city: {
                bsonType: "string",
                description: "'city' is required and is a number",
            },
            state: {
                bsonType: "string",
                description: "'state' is required",
            },
            created_date: {
                bsonType: "string",
            },
            // Add other properties and their validation as needed
        },
    },
};


const traindetailsSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["train_id","train_name", "train_code","status","type","seat_sl","seat_3AC","seat_2AC","seat_1AC","seat_sc","created_date"],
        additionalProperties: false,
        properties: {
            _id: {},
            train_id: {
                bsonType: "number",
                description: "'train_id' is required and is a number",
            },
            seat_sl: {
                bsonType: "number",
                description: "'seat_sl' is required and is a number",
            },
            seat_3AC: {
                bsonType: "number",
                description: "'seat_3AC' is required and is a number",
            },
            seat_2AC: {
                bsonType: "number",
                description: "'seat_2AC' is required and is a number",
            },
            seat_1AC: {
                bsonType: "number",
                description: "'seat_1AC' is required and is a number",
            },
            seat_sc: {
                bsonType: "number",
                description: "'seat_sc' is required and is a number",
            },
            train_name: {
                bsonType: "string",
                description: "'train_name' is required and is a string",
            },
            train_code: {
                bsonType: "string",
                description: "'train_code' is required and is a string",
            },
            status: {
                bsonType: "string",
                description: "'status' is required and is a string",
            },
            type: {
                bsonType: "string",
                description: "'type' is required",
            },
            created_date: {
                bsonType: "string",
            },
            // Add other properties and their validation as needed
        },
    },
};

const trainrunningSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["way_id","train_id","train_code", "fromStation","toStation","created_date"],
        additionalProperties: false,
        properties: {
            _id: {},
            way_id: {
                bsonType: "number",
                description: "'way_id' is required and is a number",
            },
            train_id: {
                bsonType: "number",
                description: "'train_id' is required and is a number",
            },
            train_code: {
                bsonType: "string",
                description: "'train_code' is required and is a string",
            },
            fromStation: {
                bsonType: "number",
                description: "'fromStation' is required and is a number",
            },
            toStation: {
                bsonType: "number",
                description: "'toStation' is required",
            },
            stop_stations: {
                bsonType: "string",
                description: "'stop_stations' is required",
            },
            created_date: {
                bsonType: "string",
            },
            // Add other properties and their validation as needed
        },
    },
};

const train_stopsSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["stop_id","train_id","train_code", "stop_stn_id","line_id","created_date","updated_date"],
        additionalProperties: false,
        properties: {
            _id: {},
            stop_id: {
                bsonType: "number",
                description: "'stop_id' is required and is a number",
            },
            train_id: {
                bsonType: "number",
                description: "'train_id' is required and is a number",
            },
            train_code: {
                bsonType: "string",
                description: "'train_code' is required and is a string",
            },
            stop_stn_id: {
                bsonType: "number",
                description: "'stop_stn_id' is required and is a number",
            },
            line_id: {
                bsonType: "number",
                description: "'line_id' is required",
            },
            created_date: {
                bsonType: "string",
                description: "'stop_stations' is required",
            },
            updated_date: {
                bsonType: "string",
                description: "'updated_date' is required and is a date",
            },
            // Add other properties and their validation as needed
        },
    },
};


const food_itemsSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["item_id","food_name","side_dish", "meal_type","day","created_date"],
        additionalProperties: false,
        properties: {
            _id: {},
            item_id: {
                bsonType: "number",
                description: "'item_id' is required and is a number",
            },
            food_name: {
                bsonType: "string",
                description: "'food_name' is required and is a string",
            },
            side_dish: {
                bsonType: "string",
                description: "'food_name' is required and is a string",
            },
            meal_type: {
                bsonType: "string",
                description: "'meal_type' is required and is a string",
            },
            day: {
                bsonType: "string",
                description: "'day' is required",
            },
            created_date: {
                bsonType: "string",
                description: "'created_date' is required",
            },
            // Add other properties and their validation as needed
        },
    },
};


const side_dishSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["item_id","side_dish","day","type"],
        additionalProperties: false,
        properties: {

            _id: {},
            item_id: {
                bsonType: "number",
            },
            side_dish: {
                bsonType: "string",
            },
            day: {
               bsonType: "string", 
            },
            type: {
               bsonType: "string", 
            }
            
        },
    },
};

const select_foodSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["day","lunch","dinner","side_dish"],
        additionalProperties: false,
        properties: {

            _id: {},
            day: {
                bsonType: "string",
            },
            lunch: {
                bsonType: "number",
            },
            dinner: {
               bsonType: "number", 
            },
            side_dish: {
               bsonType: "number", 
            }
            
        },
    },
};

const profileInfoSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["user_id","name","profile_imgName","created_date"],
        additionalProperties: false,
        properties: {
            _id: {},
            user_id: {
                bsonType: "number",
                description: "'user_id' is required and is a number",
            },
            name: {
                bsonType: "string",
                description: "'name' is required and is a string",
            },
            profile_imgName: {
                bsonType: "string",
                description: "'profile_imgName' is required and is a number",
            },
            created_date: {
                bsonType: "number",
            },
            // Add other properties and their validation as needed
        },
    },
};


export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("exampledatabase");
    await applySchemaValidation(db, "employees", employeesSchema);
    await applySchemaValidation(db, "userinfo", userInfoSchema);
    await applySchemaValidation(db, "station_details", stationdetailsSchema);
    await applySchemaValidation(db, "TrainVehicle", traindetailsSchema);
    await applySchemaValidation(db, "TrainOnRunning", trainrunningSchema);
    await applySchemaValidation(db, "profileinfo", profileInfoSchema);
    await applySchemaValidation(db, "Train_stops", train_stopsSchema);
    await applySchemaValidation(db, "Food_items", food_itemsSchema);
    await applySchemaValidation(db, "Side_dish", side_dishSchema);
    await applySchemaValidation(db, "Select_Food", select_foodSchema);

    const employeesCollection = db.collection<Employee>("employees");
    const userinformationCollection = db.collection<UserInfo>("userinformation");
    const station_detailsCollection = db.collection<StationDetails>("station_details");
    const train_detailsCollection = db.collection<TrainInfo>("TrainVehicle");
    const trainrunningCollection = db.collection<TrainRunning>("TrainOnRunning");
    const profileinfoCollection = db.collection<ProfileInfo>("profileinfo");
    const train_stopsCollection = db.collection<TrainStops>("Train_stops");
    const food_itemsCollection = db.collection<FoodItems>("Food_items");
    const side_dishCollection = db.collection<SideDish>("Side_dish");
    const select_foodCollection = db.collection<SelectFood>("Select_Food");

    collections.employees = employeesCollection;
    collections.userinformation = userinformationCollection;
    collections.station_details = station_detailsCollection;
    collections.TrainVehicle = train_detailsCollection;
    collections.TrainOnRunning = trainrunningCollection;
    collections.profileinfo = profileinfoCollection;
    collections.Train_stops = train_stopsCollection;
    collections.Food_items = food_itemsCollection;
    collections.Side_dish = side_dishCollection;
    collections.Select_Food = select_foodCollection;

}

// export async function connectToDatabase(uri: string) {
//     const client = new mongodb.MongoClient(uri);
//     await client.connect();

//     const db = client.db("exampledatabase");
//     await applySchemaValidation(db, "userinfo", userInfoSchema);

//     const userInfoCollection = db.collection<UserInfo>("userinfo");
//     collections.userInfo = userInfoCollection;
// }


// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
// async function applySchemaValidation(db: mongodb.Db) {


//     // Try applying the modification to the collection, if the collection doesn't exist, create it 
//    await db.command({
//         collMod: "employees",
//         validator: jsonSchema
//     }).catch(async (error: mongodb.MongoServerError) => {
//         if (error.codeName === "NamespaceNotFound") {
//             await db.createCollection("employees", {validator: jsonSchema});
//         }
//     });
// }


async function applySchemaValidation(db: Db, collectionName: string, schema: any) {
    await db.command({
        collMod: collectionName,
        validator: schema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection(collectionName, { validator: schema });
        }
    });
}

