# Natours
Tour Booking app Built with Nodejs ,Expressjs ,MongoDB ,MongoDB Atlas ,Mongooose ,Pug ,Parceljs ,Mapbox ,Stripe ,Mailtrap and SendGrid


### Demo
link : https://drive.google.com/file/d/1Xxqa9G3tm9V1bCkBdw5xUclszRSqng_p/view?usp=sharing

### Key Features

* Authentication and Authorization
  - Login and logout
* Tour
  - Manage booking, check tours map, check users' reviews and rating
* User profile
  - Update username, photo, email, and password
* Credit card Payment

### More Features 

* Tours :
  - Admin and Lead Guide :
      - Admin and Tour Guide can create, update, delete, get single tour and all tours
      - Admin can know Montly plans and tours stats
  - User And Guide :
    - Top  Cheapest Tours , Get Tours Within a Raduis , Get Distances to tours from point

* Authentication
  - Login, Signup and Logout
  - Forget, Update, Reset Password

* Emails :
  - Sending Welcode Email to Users when they Signup
  - Sending Emails to the user With a token to reset his password
 
* Users :
  - Users :
    - User can create, update, view, Deactivate his account
  - Admins :
    - Create, Get, Update, Delete
     
* Reviews :
  - Users :
    - Only users can review our tours (admins, lead guides and usual guides can NOT review)
    - User can update his review
    - User can review Just ONCE on a single tour
      
  - Admins :
    - Can get all and single review
    - Can get all reviews and single review for particular tour

   
* Bookings :
   - Users :
     - User can book as much tours as he want using Stripe , No Deuplicated
       
   - Admins:
     - Admins can get, update, delete bookings 

  
## HOW TO 

### Book a tour
* Login to the site
* Search for tours that you want to book
* Book a tour
* Proceed to the payment checkout page
* Enter the card details (Test Mood):
  ```
  - Card No. : 4242 4242 4242 4242
  - Expiry date: 02 / 22
  - CVV: 222
  ```
* Finished!


### Manage your booking

* Check the tour you have booked in "Manage Booking" page in your user settings. You'll be automatically redirected to this
  page after you have completed the booking.

### Update your profile
* You can update your own username, profile photo, email and password.
