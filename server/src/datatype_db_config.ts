import * as mongodb from "mongodb";

export interface UserInfo {
    username: string;
    email: string;
    unique_id: number;
    balance: number;
  
    _id?: mongodb.ObjectId;
}

export interface StationDetails {
    station_id: number;
    station_name: string;
    station_code: string;
    city: string;
    state: string;
    created_date: string;
  
    _id?: mongodb.ObjectId;
}

export interface TrainInfo {
    train_id: number;
    train_name: string;
    train_code: string;
    status: string;
    type: string;
    seat_sl: number;
    seat_3AC: number;
    seat_2AC: number;
    seat_1AC: number;
    seat_sc: number;
    created_date: string;
  
    _id?: mongodb.ObjectId;
}

export interface TrainRunning {
    way_id: number;
    train_id: number;
    train_code: string;
    fromStation: number;
    toStation: number;
    stop_stations: string;
    created_date: string;
  
    _id?: mongodb.ObjectId;
}

export interface ProfileInfo {
    user_id: number;
    name: string;
    profile_imgName: string;
    created_date: number;
  
    _id?: mongodb.ObjectId;
}

export interface TrainStops {
  stop_id: number;
  train_id: number;
  train_code: string;
  stop_stn_id: number;
  line_id: number;
  created_date: string;
  updated_date: string;
}

export interface FoodItems {
    item_id: number;
    food_name: string;
    side_dish: string;
    meal_type: string;
    day: string;
    created_date: string;
    
      
    _id?: mongodb.ObjectId;
}

export interface SideDish {
    item_id: number;
    side_dish: string;
    day: string;
    type: string;
      
    _id?: mongodb.ObjectId;
}

export interface SelectFood {
    day: string;
    lunch: number;
    dinner: number;
    side_dish: number;
      
    _id?: mongodb.ObjectId;
}
