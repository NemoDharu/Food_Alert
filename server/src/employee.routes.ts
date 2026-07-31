import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "./database";
import multer from 'multer';
import fs from 'fs';

interface TrainRecord {
  _id: string;
  train_id: number;
  train_code: string;
  stop_stn_id: number;
  line_id: number;
  stop_id: number;
  created_date: string;
  updated_date: string;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export const employeeRouter = express.Router();
employeeRouter.use(express.json());

employeeRouter.get("/", async (_req, res) => {
    try {
        const employees = await collections.employees.find({}).toArray();
        res.status(200).send(employees);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

employeeRouter.get("/stationlist", async (_req, res) => {
    try {
        const stationData = await collections.station_details.find({}).toArray();
        res.json({ data: stationData , status : 1});
    } catch (error) {
        res.status(500).send(error.message);
    } 
});

employeeRouter.get("/getTrainvehicles", async (_req, res) => {
    try {
        const vehicleData = await collections.TrainVehicle.find({}).toArray();
        res.json({ data: vehicleData , status : 1});
    } catch (error) {
        res.status(500).send(error.message);
    } 
});

employeeRouter.get("/station/:id", async (req, res) => {
    try {
        const id = Number(req?.params?.id);
        const query = { station_id: id };
        const station = await collections.station_details.findOne(query);

        if (station) {
            const data = { res : station , 'status' : 1 }
            res.send(data); 
        } else {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
    } catch (error) {
        res.status(404).send(`Failed to find an employee: ID ${req?.params?.id}`);
    }
});

employeeRouter.get("/train/:id", async (req, res) => {
    try {
        const id = Number(req?.params?.id);
        const query = { train_id: id };
        const train = await collections.TrainVehicle.findOne(query);

        if (train) {
            const data = { res : train , 'status' : 1 }
            res.send(data); 
        } else {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
    } catch (error) {
        res.status(404).send(`Failed to find an employee: ID ${req?.params?.id}`);
    }
});

employeeRouter.get("/train_route/:id", async (req, res) => {
    try {
         const id = Number(req?.params?.id);

        const results = await collections.TrainOnRunning.aggregate([
        {
            $match: {
              train_id: id
            }
        },
        {
            $lookup: {
                from: 'Train_stops',
                localField: 'train_id',
                foreignField: 'train_id',
                as: 'train_stops_info'
            }
        }
        ]).toArray();

        //  const query = { train_id: id };
        //  const train = await collections.TrainOnRunning.findOne(query);

        if (results.length > 0) {
            const data = { res : results , 'status' : 1 }
            res.send(data);
        } else {
            res.json({ res : 'No data found' , 'status' : 0 });
        }
    } catch (error) {
        res.status(404).send(`Failed to find an employee: ID ${req?.params?.id}`);
    }
});

employeeRouter.get("/check-phone-unique/:id", async (req, res) => {
    try {
        const phone_num = req?.params?.id;

        const query = { phone_no: phone_num };
        const exist_no = await collections.userinformation.findOne(query);

        if (exist_no) {
            return res.json({ success: false, message: "Phone number already exists.", data: null });
        } else {
            return res.json({ success: true,  message: "Phone number is unique.",data: null});
        }
    } catch (error) {
        res.status(404).send(`Failed to find an employee: ID ${req?.params?.id}`);
    }
});

employeeRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const employee = await collections.employees.findOne(query);

        if (employee) {
            res.status(200).send(employee);
        } else {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
    } catch (error) {
        res.status(404).send(`Failed to find an employee: ID ${req?.params?.id}`);
    }
});

// ======================================================================================================================
employeeRouter.post("/employee_add", async (req, res) => {
   
    try {
        const employee = req.body;
        const result = await collections.employees.insertOne(employee);

        if (result.acknowledged) {
            res.status(201).send(`Created a new employee: ID ${result.insertedId}.`);
        } else {
            res.status(500).send("Failed to create a new employee.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

employeeRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const employee = req.body;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.employees.updateOne(query, { $set: employee });

        if (result && result.matchedCount) {
            res.status(200).send(`Updated an employee: ID ${id}.`);
        } else if (!result.matchedCount) {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an employee: ID ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

employeeRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new mongodb.ObjectId(id) };
        const result = await collections.employees.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Removed an employee: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an employee: ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an employee: ID ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

employeeRouter.post("/delete", async (req, res) => {
    try {
        const result = await collections.station_details.deleteMany({});
        res.json({message : 'truncated successfully' , output : result});
    } catch (err) {
        res.json({message : 'Not truncating collection' , output : 'Error'});
    }
});

employeeRouter.post("/station/delete/:id", async (req, res) => {
    const id = req?.params?.id;
    const stationId = Number(id);
    if (isNaN(stationId)) {
        return res.status(400).json({ message: 'Invalid station ID' });
    }

    const query = { station_id: stationId };

    try {
        const result = await collections.station_details.deleteOne(query);

        if (result && result.deletedCount) {
            res.send(`Station deleted successfully: ID ${id}`);
        } else if (!result) {
            res.send(`Failed to delete: ID ${id}`);
        } else if (!result.deletedCount) {
            res.send(`Failed to find: ID ${id}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the station' });
    }

});

employeeRouter.post('/employee_poistion', async (req, res) => {
    const input_params = req.body;

    const employee = await collections.employees.find(input_params).toArray();
    if (employee) {
            res.status(200).send(employee);
    } else {
            res.status(404).send(`Position not available: ${input_params.position}`);
    }
});

employeeRouter.post("/rail_user_add", async (req, res) => {
   
    try {
        const userInfo = req.body;

        const existingUser = await collections.userinformation.findOne({ $or: [{ username: userInfo.username }, { email: userInfo.email }, { phone_no: userInfo.phone_no }] });

        if (existingUser) {
            res.json({message : 'Username, email, or phone number already exists.' , status : 0});
            return;
        }

        const Tablecount = await collections.userinformation.countDocuments();
        userInfo.user_id = Tablecount + 1;
    
        const result = await collections.userinformation.insertOne(userInfo);

        if (result.acknowledged) {
            res.json({message : 'Successfully Created a new employee' , status : 1});
        } else {
            res.json({message : 'Failed to create a new employee' , status : 0});
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

employeeRouter.post("/station_upload", upload.single('document'),async (req, res) => {
    try {
            // Read file contents
            const data = fs.readFileSync(req.file.path, 'utf8');

            let lastRecord = await collections.station_details.findOne({},{ sort: { _id: -1 } });
            let stationId = lastRecord ? lastRecord.station_id : 0;

            const lines = data.trim().split('\n');

            const stations = lines.map(line => {
                stationId++;

                const [name, code] = line.trim().split(',');
                return {
                    station_id: stationId,
                    station_name: name.trim().toLowerCase(),
                    station_code: code.trim().toLowerCase(),
                    city: 'bulk',
                    state: 'bulk',
                    created_date: new Date().toISOString()
                };
            });

            const newStations = [];

            for (const station of stations) {
                const existingStation = await collections.station_details.findOne({ station_code: station.station_code });

                if (!existingStation) {
                  newStations.push(station);
                }
            }

            console.log(newStations); 

            if (newStations.length > 0) {
                const result = await collections.station_details.insertMany(stations);

                if (result.acknowledged) {
                  res.json({ data: result.insertedIds, message: 'File uploaded & data inserted successfully' });
                } else {
                  res.status(500).send("Failed to upload file & insert records.");
                }

            } else {
                res.json({ message: 'No new stations to insert' });
            }

    } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
    }
});

employeeRouter.post('/rail_user_login', async (req, res) => {
  const { username, password } = req.body;

  // // Find user by username
  const query = { $and: [ { username: username }, { password: password } ] };
   const user = await collections.userinformation.findOne(query);
   
  // Check if user exists and password matches
  if (user) {
    res.json({ data: user , message : 'Login success' , status : 1});
  } else {
    res.json({ message: 'Invalid username or password' , data : 'error' , status : 0});
  }
});


employeeRouter.post("/add_station_name", async (req, res) => {
   
    try {
        const stationInfo = req.body;

        const query = {
            $or: [
                { station_name: stationInfo.station_name },
                { station_code: stationInfo.station_code }
            ]
        };

        const exist = await collections.station_details.findOne(query);

        if( exist ){
           res.json({ message : 'Station Name/Code already exists. Validate in Station List table' , status : 0 });
           return;
        }

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so we add 1
        const day = String(currentDate.getDate()).padStart(2, '0');

        const formattedDate = `${day}-${month}-${year}`;
        const Tablecount = await collections.station_details.countDocuments();
        
        stationInfo.created_date = formattedDate;
        stationInfo.station_id = Tablecount + 1;

        const result = await collections.station_details.insertOne(stationInfo);

        if (result.acknowledged) {
            res.json({ data: result.insertedId , message : 'Created a new station' , status : 1});
        } else {
            res.json({ data: result.insertedId , message : 'Failed to create a new station' , status : 0});
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

employeeRouter.post("/add_train_vehicle", async (req, res) => {
   
    try {
        const { train_code, seat_sl, seat_3AC, seat_2AC, seat_1AC, seat_sc, ...vehicleInfo } = req.body;

        const exist = await collections.TrainVehicle.findOne({ train_code });

        if( exist ){
           res.json({ message : 'Train code already exists.' , status : 0 });
           return;
        }

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so we add 1
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${day}-${month}-${year}`;

        const Tablecount = await collections.TrainVehicle.countDocuments();

        vehicleInfo.created_date = formattedDate;
        vehicleInfo.train_id = Tablecount + 1;
        vehicleInfo.train_code = train_code;

         ['seat_sl', 'seat_3AC', 'seat_2AC', 'seat_1AC', 'seat_sc'].forEach(seat => {
            vehicleInfo[seat] = Number(req.body[seat]);
         });

         const result = await collections.TrainVehicle.insertOne(vehicleInfo);

        if (result.acknowledged) {
            res.json({ data: result.insertedId , message : 'Added a New Train' , status : 1});
        } else {
            res.json({ message : 'Failed to create a new employee' , status : 0 });
        }
    } catch (error) {
        res.json({ message : error.message , status : 0 });
    }
});

employeeRouter.post("/edit_train_vehicle", async (req, res) => {   
    try {
        const { seat_sl, seat_3AC, seat_2AC, seat_1AC, seat_sc, ...trainInfo } = req.body;

        const id = req.body.train_id;
        
        delete trainInfo.train_id;

        ['seat_sl', 'seat_3AC', 'seat_2AC', 'seat_1AC', 'seat_sc'].forEach(seat => {
            trainInfo[seat] = Number(req.body[seat]);
        });

        const query = { train_id: id };
        const result = await collections.TrainVehicle.updateOne(query, { $set: trainInfo });
        
        if (result && result.matchedCount) {
            res.json({message : 'Train Details updated' , status : 1});
        } else if (!result.matchedCount) {
            res.json({message : 'Nothing to updated' , status : 2});
        } else {
            res.json({message : 'Failed to updated' , status : 0});
        }

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

employeeRouter.post("/add_stops", async (req, res) => {

    try {
        const TrainStopInfo = req.body;

        const isSameTrainCode = TrainStopInfo.every((train: any) => train.train_code === TrainStopInfo[0].train_code);

        if (!isSameTrainCode) {
          res.json({message : 'Error : Train codes must be same' , status : 0});
          return;
        }

        // ------------------------------------------------------------------------------------------------------
        
        // Check for Duplicate stop_stn_id
        const stopStnIdSet = new Set();
        for (const train of TrainStopInfo) {
        if (stopStnIdSet.has(train.stop_stn_id)) {
          return res.json({message : `Error : Duplicate stop_stn_id found ${train.stop_stn_id}` , status : 0});
        }
          stopStnIdSet.add(train.stop_stn_id);
        }


        // ------------------------------------------------------------------------------------------------------

        // Check for sequential line_id without any missing numbers
        const lineIds = TrainStopInfo.map((train:any) => train.line_id).sort((a:any, b:any) => a - b);

        const startLineId = 2;
        for (let i = 0; i < lineIds.length; i++) {
            const expectedLineId = startLineId + i;
            if (lineIds[i] !== expectedLineId ) {
                console.log(lineIds[i]);
              return res.json({message : `Missing line_id: ${startLineId + i}` , status : 0});
            }
        }

        // ------------------------------------------------------------------------------------------------------
        const [{ train_id, train_code }] = TrainStopInfo;

        const query = { train_id: train_id };
        const running_data = await collections.TrainOnRunning.findOne(query);

        // const stops_data = await collections.Train_stops.find(query).toArray();

        const from_stn_id = running_data.fromStation;
        const to_stn_id = running_data.toStation;

        // const filtered_stops_data = stops_data.filter(stop => stop.stop_stn_id !== from_stn_id && stop.stop_stn_id !== to_stn_id);

        // Remove unnecessary fields from filtered_stops_data
        // const cleaned_filtered_stops_data = filtered_stops_data.map(stop => ({
        //     train_id: stop.train_id,
        //     train_code: stop.train_code,
        //     stop_stn_id: stop.stop_stn_id,
        //     line_id: stop.line_id
        // }));

        // const mergedData = [...cleaned_filtered_stops_data, ...TrainStopInfo];
        const mergedData = TrainStopInfo;


         // const uniqueStopStnIds = new Set();
         // const bothData = mergedData.filter(item => {
         //    const stopStnId = Number(item.stop_stn_id); // Ensure stop_stn_id is treated as a number
         //    if (!uniqueStopStnIds.has(stopStnId)) {
         //        uniqueStopStnIds.add(stopStnId);
         //        return true;
         //    }
         //    return false;
         //  });

        // mergedData.sort((a, b) => a.line_id - b.line_id);

        const finalData = mergedData.map((stop:any, index:any) => ({
            ...stop,
            line_id: index + 1
        }));

        // ------------------------------------------------------------------------------------------------------
        
        const transformedTrainStopInfo = [
        { "train_id": train_id, "train_code": train_code, "stop_stn_id": from_stn_id.toString(), "line_id": 1 },
        ...finalData.map((stop:any, index:any) => ({
        ...stop,
        line_id: index + 2
        })),
        { "train_id": train_id, "train_code": train_code, "stop_stn_id": to_stn_id.toString(), "line_id": finalData.length + 2 }
        ];

        // ------------------------------------------------------------------------------------------------------
        
        if( transformedTrainStopInfo.length > 2 ){
           
           const lastStopIdDoc = await collections.Train_stops.find().sort({ stop_id: -1 }).limit(1).toArray();
           const lastStopId = lastStopIdDoc.length > 0 ? lastStopIdDoc[0].stop_id : 0;

           const currentDate = new Date();
           const formattedDate = currentDate.toISOString(); // ISO format for date

            const preparedData = transformedTrainStopInfo.map((train:any, index:any) => ({
                ...train,
                stop_id: lastStopId + index + 1, // Incremental stop_id
                stop_stn_id: Number(train.stop_stn_id),
                created_date: formattedDate,
                updated_date: formattedDate
            }));

            const delete_result = await collections.Train_stops.deleteMany(query);

            if ( delete_result && delete_result.deletedCount ) {

                if (preparedData.length > 0) {
                        const stop_insertData = await collections.Train_stops.insertMany(preparedData);

                        if ( stop_insertData.acknowledged ) {
                          res.json({ status: 1, message: 'Train Stops added successfully', data: stop_insertData.insertedIds });
                        } else {
                          res.json({ status: 0, message: 'Failed to stop station insert' , data: [] });
                        }

                } 
                else {
                    res.json({ status: 0 , message: 'No new stations to insert' });
                }

            }

        }

        // ------------------------------------------------------------------------------------------------------

        
    } catch (error) {

       res.json({ message : error.message , status : 0 });

    }

});

employeeRouter.post("/add_train_running", async (req, res) => {
   
    try {
        const TrainRunningInfo = req.body;

        console.log(TrainRunningInfo);

        const id = Number(req.body.train_id);
        const query = { train_id: id };
        const exist = await collections.TrainOnRunning.findOne(query);

        if( exist ){
            res.json({message : 'Route already added' , status : 0});
            return;
        }

        // if( exist ){
        //     const query = { train_id: id };
        //     const result = await collections.TrainOnRunning.updateOne(query, { $set: TrainRunningInfo });

        //     if (result && result.matchedCount) {
        //       res.json({message : 'Station updated' , status : 1});
        //     } else if (!result.matchedCount) {
        //       res.json({message : 'Nothing to updated' , status : 2});
        //     } else {
        //       res.json({message : 'Failed to updated' , status : 0});
        //     }

        // }
        // else{
        
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so we add 1
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${day}-${month}-${year}`;

            const Tablecount = await collections.TrainOnRunning.countDocuments();

            TrainRunningInfo.created_date = formattedDate;
            TrainRunningInfo.way_id = Tablecount + 1;

            const result = await collections.TrainOnRunning.insertOne(TrainRunningInfo);

            //===============================================================================================================

            // Record insert in Train stops
            const rec_exist = await collections.Train_stops.findOne(query);
            if ( rec_exist ) {
                res.json({ message : 'Data already in DB , check in Train_stops table' , status : 0});
                return;
            } 


            const lastStopIdDoc = await collections.Train_stops.find().sort({ stop_id: -1 }).limit(1).toArray();
            const lastStopId = lastStopIdDoc.length > 0 ? lastStopIdDoc[0].stop_id : 0;

            const prepareData = (info:any) => {
                return [
                { "train_id": info.train_id, "train_code": info.train_code, "stop_stn_id": String(info.fromStation), "line_id": 1 },
                { "train_id": info.train_id, "train_code": info.train_code, "stop_stn_id": String(info.toStation), "line_id": 2 }
                ];
            };

            const preparedData = prepareData(TrainRunningInfo);

            const insertData = preparedData.map((train:any, index:any) => ({
            ...train,
            stop_id: lastStopId + index + 1, // Incremental stop_id
            stop_stn_id: Number(train.stop_stn_id),
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
            }));

            const resultA = await collections.Train_stops.insertMany(insertData);

            //===============================================================================================================

            if (result.acknowledged && resultA ) {
                res.json({ data: result.insertedId , message : 'Train route has been added successfully.' , status : 1});
            } else {
                res.json({ message : 'Failed to add route , check in DB' , status : 0 });
            }

        // }
        
        

        
    } catch (error) {
        res.json({ message : error.message , status : 0 });
    }
});

employeeRouter.post("/edit_station_name", async (req, res) => {   
    try {
        const editInfo = req.body;
        const id = req.body.station_id;
        
        delete editInfo.station_id;

        const query = { station_id: id };
        const result = await collections.station_details.updateOne(query, { $set: editInfo });

        if (result && result.matchedCount) {
            res.json({message : 'Station updated' , status : 1});
        } else if (!result.matchedCount) {
            res.json({message : 'Nothing to updated' , status : 2});
        } else {
            res.json({message : 'Failed to updated' , status : 0});
        }

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

employeeRouter.get("/getUserBalance/:id", async (req, res) => {
    
    const id = Number(req?.params?.id);

    if (!id) {
        res.json({ message: 'Username is required' , status: 0 });
    }

    const query = { user_id: id };
    try {
        const user = await collections.userinformation.findOne(query);

        if (user) {
            res.json({ data: user , status: 1 });
        } else {
            res.json({ message: 'Invalid', data: [], status: 0 });
        }
    } catch (error) {
        res.json({ message: 'Internal Server Error', error: error.message, status: 0 });
    }

});

employeeRouter.post('/deposit', async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    // Validate input
    if (!user_id || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required', status: 0 });
    }

    // Parse amount to ensure it's a number
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount', status: 0 });
    }

    const query = { user_id: Number(user_id) };

    // Find the user by ID
    const user = await collections.userinformation.findOne(query);
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 0 });
    }

    // Update user's balance using $inc for atomic update
    const updateResult = await collections.userinformation.updateOne(
      query,
      { $inc: { balance: depositAmount } }
    );

    if (updateResult.matchedCount > 0 && updateResult.modifiedCount > 0) {
      // Fetch the updated user information
      const updatedUser = await collections.userinformation.findOne(query);
      res.json({ data: updatedUser, status: 1 });
    } else {
      res.status(500).json({ message: 'Unable to update balance', status: 0 });
    }
  } catch (error) {
    console.error('Error during deposit:', error);
    res.status(500).json({ message: 'Server error', status: 0 });
  }
});


employeeRouter.post("/search_trains", async (req, res) => {   
    try {
        const editInfo = req.body;
        const from_id = req.body.fromStationID;
        const to_id = req.body.toStationID;

        const pipeline = [
        {
            $match: {
              stop_stn_id: { $in: [from_id, to_id] }
            }
        },
        {
            $group: {
                _id: "$train_code",
                records: { $push: "$$ROOT" }, // Push the whole document into an array
                stationIds: { $addToSet: "$stop_stn_id" } // Add unique stop_stn_id to an array
            }
        },
        {
            $match: {
              stationIds: { $all: [from_id, to_id] } // Ensure both from_id and to_id are present
            }
        },
        {
          $unwind: "$records" // Unwind to get individual records
        },
        {
           $replaceRoot: { newRoot: "$records" } // Replace root with the actual document
        }
        ];

        const result = await collections.Train_stops.aggregate(pipeline).toArray();

        const groupedData: { [key: number]: any[] } = {};

        result.forEach((record) => {
            if (!groupedData[record.train_id]) {
             groupedData[record.train_id] = [];
            }
            groupedData[record.train_id].push(record);
        });


        const filteredOutput = Object.values(groupedData)
        .filter((group) => {

        if (group.length < 2) return true; // Single entry, keep it

        // Find records with stop_stn_id of 158 and 164
        const fromRecord = group.find((rec) => rec.stop_stn_id === from_id);
        const toRecord = group.find((rec) => rec.stop_stn_id === to_id);
        
        // Return true if either fromRecord or toRecord is missing
        if (!fromRecord || !toRecord) return true;

        // Return true if line_id of fromRecord is less than line_id of toRecord
        return fromRecord.line_id <= toRecord.line_id;
        })
        .flat();

        const uniqueTrainIds = Array.from(new Set(filteredOutput.map(item => item.train_code)));

        const selected_ids = uniqueTrainIds.map(train_id => ({ train_id }));

        const trainCodes = selected_ids.map(item => item.train_id);

        const query = { train_code: { $in: trainCodes } };

        const trainData = await collections.TrainVehicle.find(query).toArray();

        return res.json({ success: true, data: trainData });

       
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});



