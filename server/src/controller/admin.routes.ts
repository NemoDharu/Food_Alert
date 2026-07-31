import express, { Request, Response, NextFunction } from 'express';
import * as mongodb from "mongodb";
import { collections } from "../database";
import multer, { FileFilterCallback } from 'multer';
import path from 'path';


//config routes
export const adminRouter = express.Router();
adminRouter.use(express.json());

//Image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/admin_images/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1000000 }, 
  fileFilter: (req, file, cb) => {
    if (/\s/.test(file.originalname)) {
      return cb(new Error('Error: Spaces are not allowed in the image file name.'));
    }

    checkFileType(file, cb);
  }
});

// Check file type
function checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}
// =======================================================

adminRouter.post("/profile_upload", (req: Request, res: Response, next: NextFunction) => {
  upload.single('profileImage')(req, res, async (err: any) => {
    if (err) {
      return res.json({ message: err.message , status : '0' });
    }

    try {
      if (req.file === undefined) {
        return res.json({ message: 'No file selected!' , status : '0' });
      }

      const inputFields = req.body;

      const currentTimestamp = Math.floor(Date.now() / 1000);

      if(!inputFields.user_id){
        const Tablecount = await collections.profileinfo.countDocuments();
        let id = Tablecount + 1;

        const ProfileInfo = { user_id : id, name : inputFields.userName, profile_imgName : req.file.originalname , created_date : currentTimestamp };
          
        const result = await collections.profileinfo.insertOne(ProfileInfo);
        if (result.acknowledged) {
            res.json({message : 'Successfully Created a new profile & Image uploaded' , status : '1' });
        } else {
            res.json({message : 'Failed to create a new employee' , status : '0' });
        }
      }else{
          const query = { user_id: Number(inputFields.user_id) };
          const check_valid_id = await collections.profileinfo.findOne(query);
          if(!check_valid_id){
             res.json({message : 'User_id not exist in table' , status : '0' });
             return;
          }

          const ProfileInfo = { name : inputFields.userName, profile_imgName : req.file.originalname };
          const result = await collections.profileinfo.updateOne(query, { $set: ProfileInfo });
          
          if (result && result.matchedCount) {
            res.json({ message : 'Profile updated Successfully' ,status : '1' });
          } else if (!result.matchedCount) {
            res.json({ message : 'Nothing to updated' , status : '0' });
          } else {
            res.json({message : 'Failed to updated' , status : '0' });
          }
      }
     

      // Save the file name to the database
     

      // res.status(200).json({
      //   message: 'File uploaded and saved to database successfully!',
      //   file: `uploads/${req.file.filename}`
      // });
    } catch (err) {
      console.error(err);
      res.json({ message: 'Server error' });
    }
  });
});

// adminRouter.post("/profile_upload", upload.single('profileImage'),async (req: Request, res: Response, next: NextFunction) => {

//   if (req.file === undefined) {
//       return res.status(400).json({ message: 'No file selected!' });
//   }

// 	const profileInfo = req.body;
//   console.log(profileInfo); 
//     // try {
//     //         // Read file contents
//     //         const data = fs.readFileSync(req.file.path, 'utf8');

//     //         let lastRecord = await collections.station_details.findOne({},{ sort: { _id: -1 } });
//     //         let stationId = lastRecord ? lastRecord.station_id : 0;

//     //         const lines = data.trim().split('\n');

//     //         const stations = lines.map(line => {
//     //             stationId++;

//     //             const [name, code] = line.trim().split(',');
//     //             return {
//     //                 station_id: stationId,
//     //                 station_name: name.trim().toLowerCase(),
//     //                 station_code: code.trim().toLowerCase(),
//     //                 city: 'bulk',
//     //                 state: 'bulk',
//     //                 created_date: new Date().toISOString()
//     //             };
//     //         });

//     //         const newStations = [];

//     //         for (const station of stations) {
//     //             const existingStation = await collections.station_details.findOne({ station_code: station.station_code });

//     //             if (!existingStation) {
//     //               newStations.push(station);
//     //             }
//     //         }

//     //         console.log(newStations); 

//     //         if (newStations.length > 0) {
//     //             const result = await collections.station_details.insertMany(stations);

//     //             if (result.acknowledged) {
//     //               res.json({ data: result.insertedIds, message: 'File uploaded & data inserted successfully' });
//     //             } else {
//     //               res.status(500).send("Failed to upload file & insert records.");
//     //             }

//     //         } else {
//     //             res.json({ message: 'No new stations to insert' });
//     //         }

//     // } catch (error) {
//     //         console.error(error);
//     //         res.status(500).send('Internal Server Error');
//     // } 
// });