import * as express from "express";
import { collections } from "./database";

export const appRouter = express.Router();

appRouter.get('/app', async (_req, res) => {
    try {
        // Example query from collections
        const data = await collections.station_details.find({}).toArray();

         // Update documents
        const bulkWriteOperations = data.map(station => {
            const updatedStation = {
                ...station,
                station_name: station.station_name.toLowerCase(),
                station_code: station.station_code.toLowerCase()
            };

            return {
                updateOne: {
                    filter: { _id: station._id },
                    update: { $set: updatedStation }
                }
            };
        });

        const result = await collections.station_details.bulkWrite(bulkWriteOperations); 
  
        res.json(`${result.modifiedCount} documents updated.`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

appRouter.get("/sip", async (req, res) => {

    try {
        const { investment, apr, profit_mid_point, monthly_investment } = req.body;

        let amount = Number(investment);
        const iteration = Math.floor(apr / profit_mid_point);

        function formatINR(value: number | string): string {
          return '₹' + Math.round(Number(value)).toLocaleString('en-IN');
        }

        const result: string[] = [];

        for (let i = 1; i <= iteration; i++) {
            const interest = (amount / 100) * profit_mid_point;
            amount += interest + monthly_investment;

            result.push(
                `${i}, ${formatINR(amount)}, ${formatINR(interest)}`
            );
        }

        return res.status(200).json({
          data: result
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }

});

function formatINR(amount: number): string {
  return '₹' + Number(amount.toFixed(0)).toLocaleString('en-IN');
}

appRouter.get("/compoundinvest", async (req, res) => {

    try {
        const payload = req.body;

        console.log("**********************************************************");

        let Investment = payload.invest;
        let loan = 750000;

        const apr = 50;
        const months = 60;
        let recover = 18250;

        const monthlyRate = apr / 12; // Convert APR to monthly interest rate
        
        let futureValue = 62503;
        let actualMonths = 0;
        let report = [];
        let totalInvested = 0;
        let totalEarnings = 0;
    
        for (let i = 0; i < months; i++) {
             actualMonths++;

             let loan_interest = ( ( loan / 100 ) * 16 ) / 12;
             loan = loan + loan_interest;
             loan = loan - recover;

             // console.log(actualMonths,loan_interest,loan);
             Investment = Investment - recover;
             let earn = ( Investment / 100 ) * monthlyRate ; 
             Investment = earn + Investment;

            console.log(`M : ${actualMonths} , I : ${formatINR(Investment)} ,E : ${formatINR(earn)}, LN : ${formatINR(loan)}`);
        }

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }

});

appRouter.post("/addItems", async (req, res) => {
   
    try {
        const data = req.body;

        if( data.meal_type == 'S' ){

            const lastItem = await collections.Side_dish.find({}).sort({ item_id: -1 }).limit(1).toArray();

            const nextId = lastItem.length > 0 ? lastItem[0].item_id + 1 : 1;

            const side_dish_Data = {
                  item_id: nextId,
                  side_dish: data.food_name || "",
                  day : "Mo,Tu,We,Th,Fr,Sa",
                  type : data.meal_type
            };
            const result = await collections.Side_dish.insertOne(side_dish_Data);
            if (result.acknowledged) {
                res.status(201).json({ message: "✅ Sidedish item added successfully!",item_id: nextId });
            } else {
                res.status(201).json({ message: "❌ Failed to add Sidedish item." });
            }

        }else{
            // 1️⃣ Auto-increment item_id
            const lastItem = await collections.Food_items.find({}).sort({ item_id: -1 }).limit(1).toArray();

            const nextId = lastItem.length > 0 ? lastItem[0].item_id + 1 : 1;

            const createdDate = new Date().toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", });

            const foodData = {
                  item_id: nextId,
                  food_name: data.food_name || "",
                  side_dish: "0,0",
                  meal_type: data.meal_type || "",
                  day: "Tu,We,Th,Fr,Sa",
                  created_date: createdDate.replace(",", ""),
            };

            const result = await collections.Food_items.insertOne(foodData);
            if (result.acknowledged) {
                res.status(201).json({ message: "✅ Food item added successfully!",item_id: nextId });
            } else {
                res.status(500).json({ message: "❌ Failed to add food item." });
            }
        }
        
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

appRouter.get('/getItems/:mealType/:day', async (req, res) => {
    try {
        const mealTypeParam = req.params.mealType?.toUpperCase();
        const dayParam = req.params.day;

        let targetDay;

        if (dayParam) {
          targetDay = dayParam;
        } else {
          return res.status(400).json({ message: "Invalid day parameter. Use 'T' for today or 'M' for tomorrow." });
        }    

        const selection = await collections.Select_Food.find({ day: targetDay }).toArray();
        const lunchId = selection[0].lunch;
        const dinnerId = selection[0].dinner;

        const data = await collections.Food_items.find({ meal_type: { $regex: `(^|,)${mealTypeParam}(,|$)`, $options: 'i' }, day: { $regex: targetDay, $options: 'i' } }).toArray();

        if (!data.length) {
         return res.status(200).json({ message: `No items found` });
        }

        data.forEach(item => {
            if (item.item_id === lunchId) {
                (item as any).lunch_id = 'selected';
            }

            if (item.item_id === dinnerId) {
                (item as any).dinner_id = 'selected';
            }
        });
        
        res.status(200).json(data);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});


appRouter.get('/getSideDish/:itemId/:day/:type', async (req, res) => {
    try {
        const itemId = Number(req?.params?.itemId);
        const dayParam = req.params.day;
        const mealtype = req.params.type?.toUpperCase();

        let targetDay;

        if (dayParam) {
          targetDay = dayParam;
        }else {
          return res.status(400).json({ message: "Invalid day parameter." });
        }

        if (!itemId) {
          return res.status(400).json({ message: "Invalid itemId" });
        }

        const foodItem = await collections.Food_items.findOne(
          { item_id: itemId },
          { projection: { side_dish: 1 } }
        );

        if (!foodItem) {
          return res.status(200).json({ message: "Food item not found" , status : 0 });
        }

        const sideDishIds = foodItem.side_dish ?.split(',').map(x => Number(x.trim())).filter(x => !isNaN(x));

        if (!sideDishIds || sideDishIds.length === 0) {
          return res.json([]);
        }

        const sideDishes = await collections.Side_dish.find({ 
            item_id: { $in: sideDishIds }, 
            day: { $regex: targetDay, $options: 'i' },
            type: { $regex: `(^|,)${mealtype}(,|$)`, $options: 'i' }
        }).toArray();

        const AllsideDishes = await collections.Side_dish.find({ 
            // item_id: { $nin: sideDishIds },   // exclude these IDs
            day: { $regex: targetDay, $options: 'i' },
            type: { $regex: `(^|,)${mealtype}(,|$)`, $options: 'i' }
        }).toArray();
        
        return res.json({ sideDishes,AllsideDishes });
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});

appRouter.post("/updateSideDish", async (req, res) => {
   try {
     const data = req.body;

     let side_dish_id = data.side_dish_id;
     const query = { item_id: data.foodId };

     const result = await collections.Food_items.findOne(query);
     const old_Ids = result.side_dish;

     let new_ids = toggleSideDish(old_Ids, side_dish_id);

     console.log(side_dish_id,old_Ids);
     console.log(new_ids);
     console.log("********************");

     const response = await collections.Food_items.updateOne( query,{ $set: { side_dish: new_ids } } );

     if (response && response.matchedCount) {
        res.json({message : 'Side dish updated' , status : 1});
     } else if (!response.matchedCount) {
        res.json({message : 'Nothing to updated' , status : 0});
     } else {
        res.json({message : 'Error:2 to updated' , status : 0});
     }
   }
   catch (error) {
        console.error(error);
        res.json({message : 'Error:1 to updated' , status : 0});
    }
});

function toggleSideDish(old_Ids: string, side_dish_id: any) {
  // Convert string → number array
  let ids = old_Ids
    ? old_Ids.split(',').map(Number)
    : [];

  if (ids.includes(side_dish_id)) {
    // REMOVE
    ids = ids.filter(id => id !== side_dish_id);
  } else {
    // ADD
    ids.push(side_dish_id);
  }

  // Sort (optional)
  ids.sort((a, b) => a - b);

  // Convert back to string
  return ids.join(',');
}

appRouter.post("/selectFood", async (req, res) => {
   try {
     const data = req.body;

     let FoodId = Number(data.item_id);

     let type = data.type;
     const query = { day: data.day };
     let response;

     if( type == 'L' ){
       response = await collections.Select_Food.updateOne( query,{ $set: { lunch: FoodId } } );
     }
     else if ( type == 'D'){
       response = await collections.Select_Food.updateOne( query,{ $set: { dinner: FoodId } } );
     }     

     if (response && response.matchedCount) {
        res.json({message : 'Food Selected' , status : 1});
     } else if (!response.matchedCount) {
        res.json({message : 'Nothing to updated' , status : 0});
     } else {
        res.json({message : 'Error:2 to updated' , status : 0});
     }
   }
   catch (error) {
        console.error(error);
        res.json({message : 'Error:1 to updated' , status : 0});
    }
});

appRouter.get("/clearSelection", async (req, res) => {
    try {
        const result = await collections.Select_Food.updateMany(
        {}, // empty filter → all documents
        { $set: { lunch: 0, dinner: 0, side_dish: 0 } }
        );

        res.json({
        status:1,
        message: "All selections cleared",
        modifiedCount: result.modifiedCount
        });

  } catch (error) {
        res.json({
        status:0,
        message: "Internal Server Error",
        modifiedCount: error
        });
  }
});

