# Timeclock Proxy
This is a project that is utilized to provide the real backend for the timeclock project I was working in. 

# Purpose
While working, forgetting to clock in and out is difficult for all of us. This project aims to allow notifications to be sent out telling techs that it is time to clock in or out and by using the UI provided, will allow them to create a punch.

# Requirements
* A Firebase Service Account Saved Under 'service-account.json' in the root folder
* ENV Variables:
  - TIMECLOCK_URL: The Full Veritime URL (https://veritime.aesoponline.com/Clock?Org=12345&KID=1234)
  - OrgId: Veritime Organization ID
  - KioskId: Veritime Kiosk ID
  - FB_DBUrl: Firebase Database URL

## Notes
* I recognize I could include the variables inside the Timeclock Url, that was noticed as of writing this README that I had missed it. I will have to correct it in a future patch. 
* Currently Notifications are handled by Firebase Functions. 
