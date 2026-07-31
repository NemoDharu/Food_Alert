import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { Request, Response } from 'express';

import { connectToDatabase } from "./database";
import { collections } from "./database";

import { employeeRouter } from "./employee.routes";
import { appRouter } from './app.routes';
import { adminRouter } from './controller/admin.routes';


import csv from 'csv-parser';

const path = require('path');
import mongoose from 'mongoose';





// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();
const { ATLAS_URI } = process.env;

mongoose.connect(ATLAS_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err: Error) => console.log(err));

const stationSchema = new mongoose.Schema({
    name: String,
    code: String
});
const Station = mongoose.model('temp_station_details', stationSchema);

// import { bankRouter } from "./bank.routes";
// var Bankinfo = require('./models/bank_info');
//const date = require('date-and-time')





if (!ATLAS_URI) {
    console.error("No ATLAS_URI environment variable has been defined in config.env");
    process.exit(1);
}



connectToDatabase(ATLAS_URI)
    .then(() => {
        const app = express();
        app.use(cors());

         app.use(express.json()); 
				
        app.use("/employees", employeeRouter);
        app.use("/com", appRouter);
        app.use("/admin", adminRouter);

        app.use("/employees/employee_add", employeeRouter);
        app.use("/employees/rail_user_add", employeeRouter);
        app.use("/employees/rail_user_login", employeeRouter);
        app.use("/employees/employee_poistion", employeeRouter);
        app.use("/employees/add_station_name", employeeRouter);
        app.use("/employees/edit_station_name", employeeRouter);
        app.use("/employees/stationlist", employeeRouter);  
        app.use("/employees/station", employeeRouter);
        app.use("/employees/check-phone-unique", employeeRouter);  
        app.use("/employees/add_train_vehicle", employeeRouter); 
        app.use("/employees/edit_train_vehicle", employeeRouter); 
        app.use("/employees/getTrainvehicles", employeeRouter);
        app.use("/employees/delete", employeeRouter);
        app.use("/employees/train", employeeRouter); 
        app.use("/employees/train_route", employeeRouter); 
        app.use("/employees/add_train_running", employeeRouter);
        app.use("/employees/add_stops", employeeRouter);
        app.use("/employees/search_trains", employeeRouter);
        app.use("/employees/station/delete", employeeRouter);
        app.use("/employees/station_upload", employeeRouter);
        app.use("/employees/getUserBalance", employeeRouter);

        app.use('/com/app', appRouter);
        app.use('/com/sip', appRouter);
        app.use('/com/compoundinvest', appRouter);
        
        app.use('/admin/profile_upload', appRouter);

        app.use('/com/addItems', appRouter);
        app.use('/com/getItems', appRouter);
        app.use('/com/getSideDish', appRouter);
        app.use('/com/getAllSideDish', appRouter);
        app.use('/com/updateSideDish', appRouter);
        app.use('/com/selectFood', appRouter);
        app.use('/com/clearSelection', appRouter);
        
        
        // app.get("/stationlist", async (_req, res) => {
        //   console.log('hai');
        // });   

       

       		

        app.get('/download-csv', async (_req, res) => {

        const data = await collections.employees.find({}).toArray();
        // Replace this with your logic to fetch table records and convert to CSV
        // const data = [
        // { name: 'John', level: 30, position: 'New York', title: 'book' },
        // { name: 'Alice', level: 25, position: 'San Francisco', title: 'laptop' },
        // // Add more records...
        // ];
        console.log(data,'data');
       

        const csvData = data.map(record => `${record.name},${record.position},${record.level}`).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('table_records.csv');
        res.send(csvData);
        });

        // Define the multer storage for file upload
        // const storage = multer.memoryStorage();
        // const upload = multer({ storage: storage });

        // app.post('/upload-csv', upload.single('file'), async (req, res) => {
        //     try {
                // const file = req.file;

                // if (!file) {
                //     return res.status(400).send('No file uploaded.');
                // }

                // const results = [];

                // // Process the CSV file
                // const stream = fs.createReadStream(file.buffer);
                // stream
                //     .pipe(csv())
                //     .on('data', (data) => {
                //         results.push(data);
                //     })
                //     .on('end', async () => {
                //         // Assuming your collections.employees has a method named 'fileupload'
                //         const result = await collections.employees.fileupload(results);

                //         // Optionally, you can send a response back
                //         res.status(200).json({ message: 'File uploaded and data processed.', result });
                //     });
        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).send('Internal Server Error');
        //     }
        // });

		

        // app.post('/register', function(req, res){
	 
        // });

        // start the Express server
        app.listen(5200, () => {
            console.log(`Server running at http://localhost:5200...`);
        });

    })
    .catch(error => console.error(error));
