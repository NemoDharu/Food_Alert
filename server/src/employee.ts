import * as mongodb from "mongodb";

export interface Employee {
    name: string;
    position: string;
    unique_id: number;
    level: "junior" | "mid" | "senior";
    _id?: mongodb.ObjectId;
}
