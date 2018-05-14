#Copyright Jon Berg , turtlemeat.com

from PIL import Image
import base64
import csv
import shutil
import simplejson
import json
import urlparse
import string,cgi,time
import os
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime as dt
from datetime import date
import ssl
import jwt
import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText
#import pri

class MyHandler(BaseHTTPRequestHandler):
    #HTTP Status Codes
    OK = 200
    BAD_REQUEST = 400
    UNATHORIZED = 401
    FORBIDDEN = 403
    INTERNAL_SERVER_ERROR = 500

    #Other Constants
    ROW_SIZE = 38


    def do_OPTIONS(self):
        print "OPTIONS"
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Headers", "Authorization")
        self.end_headers()

    def send_response_status_code(self, status_code, message=""):
        print "in send_response_status_code"
        self.send_response(status_code)
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        if message != "":
            self.wfile.write(message)

    def do_GET(self):

        print self.path
        if self.jwt_signature_valid() == False:
            return
        if self.path == "/check":
            print "in check"
            from urlparse import urlparse
            query = urlparse(self.path).query
            print query
            self.send_response_status_code(self.OK)
            return

        if self.path == "/showFoodItems":
            if self.jwt_signature_valid() == False:
                return
            self.get_all_food_items()
            return

        if self.path == "/getUsersList":
            jwt_token = self.headers.get("Authorization").replace('Bearer ','').replace('"','')
            decodedToken = jwt.decode(jwt_token, 'secret', algorithms=['HS256'])
            if decodedToken["isAdmin"] != 'TRUE':
                self.send_response_status_code(self.FORBIDDEN, "You are not an admin")
                return

            self.get_users_list()
            return

        return

    def do_POST(self):

        import base64 
        print self.path
        try:
            if self.path == "/forgot_password":
                self.data_string = self.rfile.read(int(self.headers['Content-Length']))
                data = simplejson.loads(self.data_string)
                self.resend_password(data)
                return

            if self.path == "/authentication":
                self.data_string = self.rfile.read(int(self.headers['Content-Length']))
                print self.data_string
                data = simplejson.loads(self.data_string)
                self.authenticate(data)
                return

            if self.path == "/tablet_authentication":
                form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type'],})
                data = {}
                data["email"] = form["email"].value
                data["password"] = form["password"].value
                print data
                self.authenticate(data)
                return

            if self.jwt_signature_valid() == False:
                return

            if self.path == "/addUsers":
                print self.headers
                self.data_string = self.rfile.read(int(self.headers['Content-Length']))
                usersData = simplejson.loads(self.data_string)
                print "before add_users_to_db"
                self.add_users_to_db(usersData)
                return

            if self.path == "/RemoveUser":
                self.data_string = self.rfile.read(int(self.headers['Content-Length']))
                data = simplejson.loads(self.data_string)
                self.remove_user_from_db(data)
                return

            if self.path == "/updateFoodItemFromTablet":
                try:
                    form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type'],})
                    foodItemData = {}
                    for field in form.keys():
                        foodItemData[field] = form[field].value
                    foodItemData["meal_type"] = map(int, foodItemData["meal_type"].replace("[","").replace("]","").split(","))
                    print foodItemData
                    self.update_food_item(foodItemData)
                    return
                except Exception, Argument:
                    print Argument
                    self.send_response_status_code(self.INTERNAL_SERVER_ERROR, Argument)
                    return

            if self.path == "/addUpdateItemFromTablet":
                try:
                    foodItemData = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type'],})
                    self.add_update_food_item(foodItemData)
                    return
                except Exception, Argument:
                    print Argument
                    self.send_response_status_code(self.INTERNAL_SERVER_ERROR, Argument)
                    return

            if self.path == "/check":
                from urlparse import urlparse
                query = urlparse(self.path).query
                form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type'],})
                lastUpdateDate = ""
                for field in form.keys():
                    print field
                    lastUpdateDate = form[field].value
                if lastUpdateDate == "":
                    self.send_response_status_code(self.BAD_REQUEST, "Something is wrong")
                    return
                elif lastUpdateDate == "Never":
                    self.get_all_food_items()
                    print "before return"
                    return
                else:
                    self.send_updated_food_items_to_client(lastUpdateDate)
                        
                print "before return 2"
                return

            if self.path == "/deleteFoodItemFromTablet":
                form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type'],})
                data = {}
                data["itemId"] = form["itemId"].value
                self.delete_food_item(data)
                return

            self.data_string = self.rfile.read(int(self.headers['Content-Length']))
            data = simplejson.loads(self.data_string)
            if self.path == "/addFoodItem":
                #getting data from the client
                
                self.add_food_item(data)
                return

            if self.path == "/updateFoodItem":
                print data
                self.update_food_item(data)
                return

            if self.path == "/deleteFoodItem":
                self.delete_food_item(data)
                return
        except Exception,e: 
                print "Exception"
                print str(e)
                return      

    ##########Authentication, Users, Passwords############


    def get_users_list(self):
        rowsList = []
        with open("users_database.csv", "r") as users_csv:
            reader = csv.reader(users_csv)
            for row in reader:
                if row[2] == "sfsd@gmail.com":
                    continue
                userRow = {}
                userRow["first_name"] = row[0]
                userRow["last_name"] = row[1]
                userRow["email"] = row[2]
                rowsList.append(userRow) 
        self.send_response_status_code(self.OK, simplejson.dumps(rowsList))

    def sendEmail(self, userMail, userPassword):
        fromaddr = "maabadaappmail@gmail.com"
        msg = MIMEMultipart()
        msg['From'] = fromaddr
        msg['To'] = userMail
        msg['Subject'] = "Bon App Website Registration"
         
        body = "Hello! You were successfully registered to our Website. Your password is {}".format(userPassword)
        msg.attach(MIMEText(body, 'plain'))
         
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.login(fromaddr, "1zvvnhhkktp7")
        text = msg.as_string()
        server.sendmail(fromaddr, userMail, text)
        server.quit()

    def jwt_signature_valid(self):
        jwt_token = self.headers.get("Authorization").replace('Bearer ','').replace('"','')
        try:
            decodedToken = jwt.decode(jwt_token, 'secret', algorithms=['HS256'])
            print "signature is valid"
            return True
        except InvalidSignatureError:
            self.send_response_status_code(self.UNATHORIZED, "Jwt signature failed")
            print "signature is not valid"
            return False

    def resend_password(self, data):
        email = data["email"]
        with open("users_database.csv", "r") as users_csv:
            reader = csv.reader(users_csv)
            for row in reader:
                if row[2] == email:
                   #send mail
                   self.send_response_status_code(self.OK, "Password was sent")
                   return
        self.send_response_status_code(self.FORBIDDEN, "This email is not in the database")

    def authenticate(self, data):
        userEmail = data["email"]
        userPassword = data["password"]
        found = False
        with open("users_database.csv", "r") as csvFile:
            reader = csv.reader(csvFile)
            for row in reader:
                if row[2] == userEmail:
                    if row[3] == userPassword:
                        payload = {
                            'id': "user.id",
                            'isAdmin': row[4]
                        }
                        found = True
                        break
                    else:
                        self.send_response_status_code(self.UNATHORIZED, "Wrong login or password")
                        return

        if found == False:
            self.send_response_status_code(self.UNATHORIZED, "Wrong login or password")
            return

        jwt_token = jwt.encode(payload, 'secret', algorithm='HS256')
        print simplejson.dumps(jwt_token)
        self.send_response_status_code(self.OK, simplejson.dumps(jwt_token))

    
    def remove_user_from_db(self, data):
        if data["email"] == "sfsd@gmail.com": 
            self.send_response_status_code(self.FORBIDDEN)
            return

        rowsList = []
        found = False
        with open("users_database.csv", "r") as users_csv:
            reader = csv.reader(users_csv)
            for row in reader:
                if row[2] == data["email"]:
                    found = True
                    continue
                rowsList.append(row)
        if found == False:
            self.send_response_status_code(self.FORBIDDEN, "Account with this email doesn't exist")
            return
        with open("users_database.csv", "w") as users_csv:   
            writer = csv.writer(users_csv)
            writer.writerows(rowsList)
        self.send_response_status_code(self.OK)

    def add_users_to_db(self, usersData):
        usersApproved = []
        ifErrorOccured = False
        for user in usersData['users']:
            try:
                if user["password"] == "":
                    password = self.generate_password()
                else: password = user["password"]
                # print "try 2"
                # self.sendEmail(user["email"], password)
                # print "try 3"
                self.add_user_to_csv_db(user, password)
                usersApproved.append(user["email"])
            

            except Exception,e: 
                print "Exception"
                print str(e)
                ifErrorOccured = True

        if(ifErrorOccured == True):
            code = self.BAD_REQUEST
        else:
            code = self.OK

        self.send_response_status_code(code, simplejson.dumps(usersApproved))

    def add_user_to_csv_db(self, user, password):
        rowsList = []
        print "before open"
        with open("users_database.csv", "r") as users_csv:
            reader = csv.reader(users_csv)
            for row in reader:
                if row[2] == user["email"]:
                   raise Exception("Already exists") 
                rowsList.append(row)
        print "after open"
        newrow = [user["first_name"], user["last_name"], user["email"], password, "false"]
        rowsList.append(newrow)
        with open("users_database.csv", "w") as users_csv:   
            writer = csv.writer(users_csv)
            writer.writerows(rowsList)  

    def generate_password(self):
        return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(6))

    ##########Handling Request To Food DB############

    def convert_meal_type(self, type):
        if type == "false":
            return 0
        else:
            return 1

    def add_update_food_item(self, foodItemDate):
        foodItem = {}
        foodItemAttributes = ["itemId", "name", "hebrewName", "arabicName", "foodType", "calcium", "potassium", "moisture", "protein", "carbohydrates", "na", "alcohol", "energy", "fatness", "menuImageFile"]
        for attribute in foodItemAttributes:
            foodItem[attribute] = foodItemDate[attribute].value
        foodItem["mealType"] = list(map(self.convert_meal_type, foodItemDate["mealType"].value.replace("[","").replace("]","").replace(" ","").split(","))) 
        imagesNames = ["firstImage", "secondImage", "thirdImage", "fourthImage"]
        for name in imagesNames:
            foodItem[name] = {'imageFile':foodItemDate["{}File".format(name)].value, 'imageHeight':foodItemDate["{}Height".format(name)].value, 'imageWidth':foodItemDate["{}Width".format(name)].value, 'imageWeight':foodItemDate["{}Weight".format(name)].value}

        print "add_update_food_item 1"
        if foodItem["itemId"] != "-1":
            print "add_update_food_item update"
            self.update_food_item(foodItem)
            return

        else:
            print "add_update_food_item add"
            self.add_food_item(foodItem)
            return

    def send_updated_food_items_to_client(self, lastUpdateDate):
        lastUpdateDate = dt.strptime(lastUpdateDate, "%Y-%m-%d %H:%M")
        
        itemsList = []
        with open("database.csv", "r+") as csvFile:
            reader = csv.reader(csvFile)
            rowNumber = 0
            for row in reader:
                if rowNumber == 0:
                    rowNumber += 1
                    continue

                if row[37] == "True":
                    continue

                foodItemLastUpdate = dt.strptime(row[36], "%Y-%m-%d %H:%M")
                if foodItemLastUpdate > lastUpdateDate:
                    itemsList.append(self.create_food_item(row))

        now = dt.now()
        itemsList.append({"currentDate":now.strftime("%Y-%m-%d %H:%M")})
        self.send_response_status_code(self.OK, simplejson.dumps(itemsList))

    def delete_food_item(self, data):
        id = data['itemId']
        found = False

        with open("database.csv", "r") as csvFile:
            reader = csv.reader(csvFile)
            rowsList = [] 
            for row in reader:
                if row[0] == id:
                    row[37] = "True"
                    found = True
                rowsList.append(row)

        if found == False:
            self.send_response_status_code(self.FORBIDDEN, "Food item was not found")
            return

        with open("database.csv", "w") as csvFile:   
            writer = csv.writer(csvFile)
            writer.writerows(rowsList)

        self.send_response_status_code(self.OK)

    

    def update_food_item(self, data):
        print "update_food_item 1"
        print data
        itemFound = False
        #try:
        with open("database.csv", "r") as csvFile:
            print "update_food_item in open"
            reader = csv.reader(csvFile)
            rowsList = [] 
            number = 0
            print "id"
            print data["id"]
            for row in reader:
                if row[0] == data["id"]:
                    print "found"
                    itemFound = True
                    newrow = self.create_database_row_from_client_data(data, row)
                    print "after creation"
                    print newrow
                    rowsList.append(newrow)
                    print "after appending"
                else:
                    rowsList.append(row)


        if itemFound != True:
            self.send_response_status_code(self.INTERNAL_SERVER_ERROR, "Food item was not found")
            return


        with open("database.csv", "w") as csvFile:   
            writer = csv.writer(csvFile)
            writer.writerows(rowsList)
        self.send_response_status_code(self.OK)

    def add_food_item(self, data):
        name = data['name']
        maxId = 1
        with open("database.csv", "r+") as csvFile:
            reader = csv.reader(csvFile)
            rowNumber = 0
            for row in reader:
                if rowNumber == 0:
                    rowNumber += 1
                    continue
                #if item with such a name already exists, the item cannot be added
                if row[1].lower() == name.lower():
                    self.send_response_status_code(self.FORBIDDEN, "Food item already exists. Try update instead")
                    return
                if int(row[0]) > maxId:
                    maxId = int(row[0])
            reader = csv.reader(csvFile)
            writer = csv.writer(csvFile)
            row = ['']*self.ROW_SIZE
            row[0] = maxId+1
            row[1] = name
            row[22] = row[26] = row[30] = "zzz_null_image"
            row[21] = row[23] = row[24] = row[25] = row[27] = row[28] = row[29] = row[31] = row[32] = -1
            row = self.create_database_row_from_client_data(data, row)
            writer.writerow(row)

        self.send_response_status_code(self.OK, "id: "+str(maxId+1))

    def get_image_properties(self, row, startIndex):
        imageWeight = row[startIndex]
        imageFileName = row[startIndex+1]
        imageFile = self.get_image_file_url(imageFileName)
        imageWidth = str(int(round(float(row[startIndex+2]))))
        imageHeight = str(int(round(float(row[startIndex+3]))))
        imageProperties = {"imageWeight":imageWeight, "imageFileName":imageFileName, "imageFile" : imageFile,"imageWidth":imageWidth, "imageHeight":imageHeight}
        return imageProperties

    def create_food_item(self, row):
        foodItemAttributes = ["id", "name", "program", "breakfast", "lunch", "dinner", "snacks", "energy", "protein", "fatness", "carbohydrates", "calcium", "na", "potassium","alcohol", "moisture", "category"]
        foodItem = {}
        for attributeNumber in range(len(foodItemAttributes)):
            attribute = foodItemAttributes[attributeNumber]
            foodItem[attribute] = row[attributeNumber]
        menuImageFileName = row[33]
        menuImageFile = self.get_image_file_url(menuImageFileName)
        with Image.open('pictures/{}.png'.format(menuImageFileName)) as image:
            menuImageWidth, menuImageHeight = image.size
            menuImageWidth = int(round(float(menuImageWidth)))
            menuImageHeight = int(round(float(menuImageHeight)))
        menuImage = {"imageFileName":menuImageFileName, "imageFile": menuImageFile, "imageWidth":menuImageWidth, "imageHeight":menuImageHeight}
        foodItem["menuImage"] = menuImage
        foodItem["firstImage"] = self.get_image_properties(row, 17)
        foodItem["secondImage"] = self.get_image_properties(row, 21)
        foodItem["thirdImage"] = self.get_image_properties(row, 25)
        foodItem["fourthImage"] = self.get_image_properties(row, 29)
        foodItem["hebrewName"] = row[34]
        foodItem["arabicName"] = row[35]
        return foodItem

    def get_all_food_items(self):
        database = []
        with open("database.csv", "r+") as csvFile:
            reader = csv.reader(csvFile)
            rownum = 0
            for row in reader:
                if rownum == 0: #The first row contains column names
                    rownum += 1
                    continue 

                if len(row) != self.ROW_SIZE: 
                    continue

                if row[37] == "True":
                    continue
                database.append(self.create_food_item(row))
                rownum += 1
                # if rownum == 40:
                #     break

        if self.path == "/check": 
            now = dt.now()
            database.append({"currentDate":now.strftime("%Y-%m-%d %H:%M")})
        print str(len(database))
        self.send_response_status_code(self.OK, simplejson.dumps(database))

    def get_images_details_list(self, data):
        imagesNames = ["firstImage", "secondImage", "thirdImage", "fourthImage"]
        imagesFilenamesEndings = ["_s", "_m", "_l", "_xl"]
        images = []
        for index in range(len(imagesNames)):
            name = imagesNames[index]
            imageData = data[name]
            if imageData == "null":
                nullImagesNumber = len(imagesNames) - index
                images.extend([1, "zzz_null_image", 1, 1] * nullImagesNumber)
                break
            else:
                imageFile, imageHeight, imageWidth, imageWeight = self.get_image_details(imageData)
                imageFileName = data["name"].lower().replace(" ", "_")+imagesFilenamesEndings[index]
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(imageFile.split(",")[1]))
                images.extend([imageWeight, imageFileName, imageWidth, imageHeight])
        print "get_images_details_list"
        print str(images)
        print images
        program = 1
        if images[5] != "zzz_null_image":
            program = 2

        return images, program

    def create_database_row_from_client_data(self, data, row):
        for key in data:
            if key == "name":
                row[1] = data[key]; continue
            if key == "meal_type":
                row[3] = data[key][0]
                row[4] = data[key][1]
                row[5] = data[key][2]
                row[6] = data[key][3]
                continue
            if key == "energy": 
                row[7] = data[key]; continue
            if key == "protein":
                row[8] = data[key]; continue
            if key == "fatness":
                row[9] = data[key]; continue
            if key == "carbohydrates":
                row[10] = data[key]; continue
            if key == "calcium":
                row[11] = data[key]; continue
            if key == "na":
                row[12] = data[key]; continue
            if key == "potassium":
                row[13] = data[key]; continue
            if key == "alcohol":
                row[14] = data[key]; continue
            if key == "moisture":
                row[15] = data[key]; continue
            if key == "food_type":
                row[16] = data[key]; continue
            if key == "weight":
                row[17] = data[key]; continue
            if key == "img_file":
                imageFileName = row[1].lower().replace(" ", "_")+"_s"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[18] = imageFileName
                continue
            if key == "width":
                row[19] = data[key]; continue
            if key == "height":
                row[20] = data[key]; continue
            if key == "weight2":
                row[21] = data[key]; continue
            if key == "img_file2":
                imageFileName = row[1].lower().replace(" ", "_")+"_m"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[22] = imageFileName
                row[2] = 2
                continue
            if key == "width2":
                row[23] = data[key]; continue
            if key == "height2":
                row[24] = data[key]; continue
            if key == "weight3":
                row[25] = data[key]; continue
            if key == "img_file3":
                imageFileName = row[1].lower().replace(" ", "_")+"_l"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[26] = imageFileName
                continue
            if key == "width3":
                row[27] = data[key]; continue
            if key == "height3":
                row[28] = data[key]; continue
            if key == "weight4":
                row[29] = data[key]; continue
            if key == "img_file4":
                imageFileName = row[1].lower().replace(" ", "_")+"_xl"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[30] = imageFileName
                continue
            if key == "width4":
                row[31] = data[key]; continue
            if key == "height4":
                row[32] = data[key]; continue
            if key == "menu_image":
                imageFileName = row[1].lower().replace(" ", "_")+"_menu"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[33] = imageFileName
                continue
            if key == "hebrew_name":
                hebrewName = data[key]
                if isinstance(hebrewName, unicode):
                    hebrewName = hebrewName.encode("utf-8")
                row[34] = hebrewName; continue
            if key == "arabic_name":
                arabicName = data[key]
                if isinstance(arabicName, unicode):
                    arabicName = arabicName.encode("utf-8")
                row[35] = arabicName; continue

        if row[22].find("null") != -1: row[2] = 1
        currentDateAndTime = dt.now()
        currentDateAndTime = currentDateAndTime.strftime("%Y-%m-%d %H:%M")
        row[36] = currentDateAndTime
        row[37] = "False"
        return row


    def create_database_row(self, data):
        print "create_database_row 1"
        data[""] = ""
        newrow = []
        attributes = ['itemId', 'name']
        attributes.extend(['']*5)
        print "create_database_row 2"
        attributes.extend(["energy", "protein", "fatness", "carbohydrates", "calcium", "na", "potassium", "alcohol", "moisture", "foodType"])
        for attribute in attributes:
            print attribute
            newrow.append(data[attribute])
        print "create_database_row 3"
        print data["mealType"]
        mealType = data["mealType"]
        for index in range(len(mealType)):
            newrow[3+index] = mealType[index]
        menuImageFile = data['menuImageFile']
        images, program = self.get_images_details_list(data)
        newrow[2] = program
        newrow.extend(images)
        print "create_database_row 4"

        menuImageFileName = data["name"].lower().replace(" ", "_")+"_menu"
        #creating image files if needed
        with open("pictures/{}.png".format(menuImageFileName), "w") as decoded:
            decoded.write(base64.decodestring(menuImageFile.split(",")[1]))

        currentDateAndTime = dt.now()
        currentDateAndTime = currentDateAndTime.strftime("%Y-%m-%d %H:%M")
        hebrewName = data["hebrewName"]
        arabicName = data["arabicName"]
        if isinstance(hebrewName, unicode):
            hebrewName = hebrewName.encode("utf-8")
        if isinstance(arabicName, unicode):
            arabicName = arabicName.encode("utf-8")
        print "create_database_row 5"
        newrow.extend([menuImageFileName, hebrewName, arabicName, currentDateAndTime])
        newrow.append("False")
        return newrow

    def get_image_details(self, image): #parsing json element
        return image['imageFile'], image['imageHeight'], image['imageWidth'], image['imageWeight']

    def get_image_file_url(self, image_file_name):
        if image_file_name.find("null") == -1:
            file_path = 'pictures/{}.png'.format(image_file_name)
            if os.path.isfile(file_path):
                image = open(file_path, 'rb') #open binary file in read mode
                image_read = image.read()
                encoded = "data:image/png;base64,"+base64.encodestring(image_read)
                return encoded
        return "null"

server_port = 3000
ssl_key_file = "/home/woz/bon app/pythonweb/src/key.pem"
ssl_certificate_file = "/home/woz/bon app/pythonweb/src/certFolder/server.pem"

# def add_column_to_db():
#     rowsList = []
#     with open("database_tablet.csv", "r") as csvFile:
#         reader = csv.reader(csvFile) 
#         for row in reader:
#             newrow = row
#             newrow.append(False)
#             rowsList.append(newrow)
#     with open("database_tablet.csv", "w") as csvFile:   
#         writer = csv.writer(csvFile)
#         writer.writerows(rowsList) 

def main():
    try: #
        server = HTTPServer(('192.168.1.7', server_port), MyHandler)
        #server.socket = ssl.wrap_socket (server.socket, keyfile="path/tp/key.pem", certfile='path/to/cert.pem', server_side=True)
        server.socket = ssl.wrap_socket (server.socket, server_side=True,  
                                         certfile=ssl_certificate_file)
        sa = server.socket.getsockname()
        print "Serving HTTP on", sa[0], "port", sa[1], "..."
        print 'started httpserver...'
        from datetime import date
        print str(date.today())
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        server.socket.close()

if __name__ == '__main__':
    main()

# In Java files:
# 1)to add checking if a file was deleted
# 2)to add deleting request 
# 3)to add delete function to databaseHandler
# 4)to check what happens when new foodItem is created, what id it gets
# 5)to check if editing food item works well
# 6)to end all this stuff with generating password
# 7)to check how to save password in browser
# 8)to add handling deleted items on the website and on tablets
# 9)to check how many items can be send in one request