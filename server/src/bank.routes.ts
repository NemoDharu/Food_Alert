import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "./database";
const date = require('date-and-time');
var Employee = require('./models/bank_info');

export const bankRouter = express.Router();
bankRouter.use(express.json());

bankRouter.get("/", async (_req, res) => {
    try {
        const employees = await collections.employees.find({}).toArray();
        res.status(200).send(employees);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

bankRouter.get("/:id", async (req, res) => {
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

// bankRouter.post("/", async (req, res) => {
//     try {

//         var employee = req.body;
//         const now = new Date();
//         const value = date.format(now,'DD-MM-YYYY');
        
//         if(!employee.email || !employee.username || !employee.password || !employee.passwordConf){
//             res.send({"Error":"Input params not sufficient"});
//         }else if( employee.password != employee.passwordConf ){
//             res.send({"Error":"Password mismatched..!"});
//         }else{
            
//             	TimeTrack.findOne({date_value:value},function(err,data){
// 				  if(!data){
// 					  var c;
// 					  TimeTrack.findOne({},function(err,data){
  
// 						  if (data) {
// 							  console.log("if");
// 							  c = data.unique_id + 1;
// 						  }else{
// 							  c=1;
// 						  }
  
// 						  var newPerson = new TimeTrack({
// 							  unique_id:c,
// 							  date:now,
// 							  date_value:value,
// 							  login: timeEntry.login,
// 							  status: 1
// 						  });
						  
// 						  newPerson.save(function(err, Person){
// 							  if(err){
//                                  //res.send({"Error":err});
// 								 console.log(err);
// 							  }  
// 							  else{
// 								console.log('success');
//                                 // res.send({"Success":'Successfully record inserted'});
// 							  }
							      
// 						  });
  
// 					  }).sort({_id: -1}).limit(1);
					  
// 					  res.send({"Success":'Successfully record inserted'});
// 				  }
// 				  else{
// 					  res.send({"Success":"Name is already used."});
// 				  }
  
// 			  });

//         } 

//         return;

        
//         const result = await collections.employees.insertOne(employee);

//         if (result.acknowledged) {
//             res.status(201).send(`Created a new employee: ID ${result.insertedId}.`);
//         } else {
//             res.status(500).send("Failed to create a new employee.");
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(400).send(error.message);
//     }
// });

bankRouter.put("/:id", async (req, res) => {
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

bankRouter.delete("/:id", async (req, res) => {
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
