const admin = require('firebase-admin');
const serviceAccount = require('./service_account.json')
const { PunchWithBarcode, PunchWithCreds } = require('./timeclock');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://autoclock-10615.firebaseio.com"
  });

let db = admin.firestore();

const runSearch = async () => {
    let query = db.collection('punches').where('Attempts', '<', 1);
    let observer = query.onSnapshot(async snap => {
        snap.forEach(async doc => {
            let data = doc.data();
            let usrDataRef = db.collection('users').doc(data.Uid).get();
            let usrData = await usrDataRef.then(usrdoc => {
                if (!usrdoc.exists) {
                    console.error("No User Data for UID: ", doc.Uid);
                    return null;
                }
                else {
                    return usrdoc.data()
                }
            }).catch(err => { console.error(err) });
            if (!usrData.VeritimeRegistered) {
                doc.ref.update({
                    Attempts: data.Attempts + 1,
                    "Error": "No Veritime Info Registered"
                })
                return console.error("No Veritime Info Registered")
            }
            PunchWithCreds(usrData.VeritimePhoneNumber, usrData.VeritimePassword, data.HourRequested, data.MinRequested)
                .then(res => {
                    doc.ref.update({
                        Attempts: data.Attempts + 1
                    })
                    if (!res.OK) {
                        doc.ref.update({
                            Successful: false,
                            Message: res.Error
                        });
                        return console.error("Unable to Complete Punch: ", res.Error)
                    }
                    doc.ref.update({
                        Successful: true,
                        Message: "TODO: Figure Out Message For Successful"
                    })
                })
        })
    }, err => {
        console.error(`Encountered error: ${err}`);
        
    });

}

runSearch()
