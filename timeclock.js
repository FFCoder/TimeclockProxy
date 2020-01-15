const axios = require('axios');
const moment = require('moment')

const TIMECLOCK_URL = "https://veritime.aesoponline.com/Clock/ProcessLoginRequest";

const getLoadStamp = () => {
    let d = new Date();
    d.setHours(4,0);
    return moment(d).format('YYYY-MM-DDTHH:mm:ss.000')
}
const getPunchTime = (hour, min) => {
    let d = new Date();
    d.setHours(hour, min);
    return moment(d).format('YYYY-MM-DD HH:mm:ss')
}
const BASE_DATA = {
    OrgId: process.env.OrgId,
    KioskId: process.env.KioskId,
    LoadStamp: getLoadStamp(),
    KioskTypeId: 5

}
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
}

const _punch = async (data) => {
    return await axios.post(TIMECLOCK_URL, data, {headers: HEADERS});
}

const PunchWithCreds = async (userId, userPassword, hourRequested, minRequested) => {
    let data = {
        ...BASE_DATA,
        KioskDateTime: getPunchTime(hourRequested, minRequested),
        Username: userId,
        Password: userPassword
    }
    return await _punch(data).then(res => res.data)

    
}

const PunchWithBarcode = async (barcodeData, hourRequested, minRequested) => {
    let data = {
        ...BASE_DATA,
        KioskDateTime: getPunchTime(hourRequested, minRequested),
        Scan: barcodeData
    }
    return await _punch(data).then(res => res.data)
    
}
module.exports.PunchWithBarcode = PunchWithBarcode;
module.exports.PunchWithCreds = PunchWithCreds;