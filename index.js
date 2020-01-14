const admin = require('firebase-admin');
const serviceAccount = require('./service_account.json')
const { PunchWithBarcode, PunchWithCreds } = require('./timeclock');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FB_DBUrl
  });

let db = admin.firestore();

// Function to Run a Search for Punches
// I originally wanted to Search on an 'ifAttempted' != True
// query, however Firestore does not have a != condition.
// For that reason, I had to create an Attempts Counter.
const runSearch = async () => {
    let query = db.collection('punches').where('Attempts', '<', 1);
    let observer = query.onSnapshot(async snap => {
        // Pull the Snapshot and Goes Through Each Document
        snap.forEach(async doc => {
            let data = doc.data(); // Punch Data

            // Pulls Data from the users DB to get User's Veritime Info.
            let usrDataRef = db.collection('users').doc(data.Uid).get(); // Ref
                       
            // Actual Data
            let usrData = await usrDataRef.then(usrdoc => {
                if (!usrdoc.exists) {
                    console.error("No User Data for UID: ", doc.Uid);
                    return null;
                }
                else {
                    return usrdoc.data()
                }
            }).catch(err => { console.error(err); return null });

            console.log(`Attempting Punch for ${usrData.UserDisplayName}`);

            // If User does not have any Veritime Info Registered, then fail. 
            if (!usrData.VeritimeRegistered) {
                doc.ref.update({
                    Attempts: data.Attempts + 1,
                    Error: "No Veritime Info Registered",
                    Successful: false

                })
                return console.error("No Veritime Info Registered")
            }
            // If not fail, proceed with punch.
            PunchWithCreds(usrData.VeritimePhoneNumber, usrData.VeritimePassword, data.HourRequested, data.MinRequested)
                .then(res => {
                    doc.ref.update({
                        Attempts: data.Attempts + 1
                    });

                    // If the Veritime Response 'OK' field is false, return the error message.
                    if (!res.OK) {
                        doc.ref.update({
                            Successful: false,
                            Message: res.Error
                        });
                        return console.error("Unable to Complete Punch: ", res.Error)
                    };

                    // As of right now I do not know what happens on successful punch.
                    // I have to figure that out and update this code.
                    doc.ref.update({
                        Successful: true,
                        Message: res
                    })
                })
        })
    }, err => {
        console.error(`Encountered error: ${err}`);
        
    });

}

console.log("Punch Proxy Running");
runSearch().catch(err => {
    console.error('Error Occured Running: ', err);
})
