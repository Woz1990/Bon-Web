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
#import pri

class MyHandler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        print "OPTIONS"
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()



    def do_GET(self):

        print "in here"
        if self.path == "/showFoodItems":
            database = []
            with open("database.csv", "r+") as csvFile:
                reader = csv.reader(csvFile)
                rownum = 0
                for row in reader:
                    if rownum == 0:
                        rownum += 1
                        continue 
                    if len(row) != 36:
                        continue
                    firstImageFileName = row[18]
                    firstImageFile = self.get_image_file_url(firstImageFileName)
                    #print firstImageFile
                    secondImageFileName = row[22]
                    secondmageFile = self.get_image_file_url(secondImageFileName)
                    thirdImageFileName = row[26]
                    thirdImageFile = self.get_image_file_url(thirdImageFileName)
                    fourthImageFileName = row[30]
                    fourthImageFile = self.get_image_file_url(fourthImageFileName)
                    menuImageFileName = row[33]
                    menuImageFile  = self.get_image_file_url(menuImageFileName)
                    with Image.open('pictures/{}.png'.format(menuImageFileName)) as image:
                        menuImageWidth, menuImageHeight = image.size
                    foodItem = {"id": row[0], "name": row[1], "program" : row[2], "breakfast" : row[3], "lunch": row[4], "dinner":row[5], "snacks":row[6], "energy":row[7], "protein":row[8], "fatness":row[9], "carbohydrates":row[10], "calcium":row[11], "na":row[12], "potassium":row[13],"alcohol": row[14], "moisture":row[15], "category":row[16], "firstImage":{"imageWeight":row[17], "imageFileName":firstImageFileName, "imageFile" : firstImageFile,"imageWidth":row[19], "imageHeight":row[20]}, "secondImage":{"imageWeight":row[21], "imageFileName":secondImageFileName, "imageFile" : secondmageFile,"imageWidth":row[23], "imageHeight":row[24]}, "thirdImage":{"imageWeight":row[25], "imageFileName": thirdImageFileName, "imageFile" : thirdImageFile,"imageWidth":row[27], "imageHeight":row[28]}, "fourthImage":{"imageWeight":row[29], "imageFileName":fourthImageFileName,"imageFile" : fourthImageFile,"imageWidth":row[31], "imageHeight":row[32]}, "menuImage":{"imageFileName":menuImageFileName, "file": menuImageFile, "imageWidth":menuImageWidth, "imageHeight":menuImageHeight}, "hebrewName":row[34].decode('utf-8'), "arabicName":row[35].decode('utf-8')}
                    database.append(foodItem)

           # database = {"key":"fuck"}
            self.send_response(200)
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            #database2 = simplejson.dumps(database)
            self.wfile.write(simplejson.dumps(database))
        return

    def do_POST(self):

        import base64 
        # image = open('th.jpeg', 'rb') #open binary file in read mode
        # image_read = image.read()
        # image_64_encode = base64.encodestring(image_read)
        # with open("64encoded.txt", "w") as encoded:
        #     encoded.write(image_64_encode)

        # with open("64decoded.txt", "w") as decoded:
        #     decoded.write(base64.decodestring(image_64_encode))
         

        print "in here2"
        print self.path
        


        if self.path == "/addFoodItem":
            self.data_string = self.rfile.read(int(self.headers['Content-Length']))
            data = simplejson.loads(self.data_string)

            name = data['name']
            hebrewName = data['hebrewName']
            arabicName = data['arabicName']
            foodType = data['foodType']
            mealType = data['mealType']
            calcium = data['calcium']
            potassium  = data['potassium']
            moisture = data['moisture']
            protein = data['protein']
            carbohydrates = data['carbohydrates']
            na = data['na']
            alcohol = data['alcohol']
            energy = data['energy']
            fatness = data['fatness']
            menuImageFile = data['menuImageFile']
            firstImage = data["firstImage"]
            secondImage = data["secondImage"]
            thirdImage = data["thirdImage"]
            fourthImage = data["fourthImage"]
            with open("database.csv", "r+") as csvFile:
                reader = csv.reader(csvFile)
                rowNumber = 0
                for row in reader:
                    if row[1].lower() == name.lower():
                        self.send_response(403)
                        self.send_header('Access-Control-Allow-Credentials', 'true')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write("Food item already exists. Try update instead")
                        return
                    rowNumber += 1
                reader = csv.reader(csvFile)
                writer = csv.writer(csvFile)
                # for row in reader:
                #     writer.writerow(row)

                program = 1
                menuImageFileName = name.lower().replace(" ", "_")+"_menu"

                firstImageFile, firstImageHeight, firstImageWidth, firstImageWeight = self.get_image_details(firstImage)
                firstImageFileName = name.lower().replace(" ", "_")+"_s"
                with open("pictures/{}.png".format(firstImageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(firstImageFile.split(",")[1]))

                if secondImage != "null":

                    program = 2
                    secondImageFile, secondImageHeight, secondImageWidth, secondImageWeight = self.get_image_details(secondImage)
                    secondImageFileName = name.lower().replace(" ", "_")+"_m"
                    with open("pictures/{}.png".format(secondImageFileName), "w") as decoded:
                        decoded.write(base64.decodestring(secondImageFile.split(",")[1]))

                    if thirdImage != "null":

                        thirdImageFile, thirdImageHeight, thirdImageWidth, thirdImageWeight = self.get_image_details(thirdImage)
                        thirdImageFileName = name.lower().replace(" ", "_")+"_l"
                        with open("pictures/{}.png".format(thirdImageFileName), "w") as decoded:
                            decoded.write(base64.decodestring(thirdImageFile.split(",")[1]))

                        if fourthImage != "null":

                            fourthImageFile, fourthImageHeight, fourthImageWidth, fourthImageWeight = self.get_image_details(fourthImage)
                            fourthImageFileName = name.lower().replace(" ", "_")+"_xl"
                            with open("pictures/{}.png".format(fourthImageFileName), "w") as decoded:
                                decoded.write(base64.decodestring(fourthImageFile.split(",")[1]))

                        else:

                            fourthImageFileName = "zzz_null_image" 
                            fourthImageHeight = fourthImageWidth = fourthImageWeight = 1

                    else:

                        thirdImageFileName = "zzz_null_image" 
                        thirdImageHeight = thirdImageWidth = thirdImageWeight = 1

                        fourthImageFileName = "zzz_null_image" 
                        fourthImageHeight = fourthImageWidth = fourthImageWeight = 1

                else:

                    secondImageFileName = "zzz_null_image" 
                    secondImageHeight = secondImageWidth = secondImageWeight = 1

                    thirdImageFileName = "zzz_null_image" 
                    thirdImageHeight = thirdImageWidth = thirdImageWeight = 1

                    fourthImageFileName = "zzz_null_image" 
                    fourthImageHeight = fourthImageWidth = fourthImageWeight = 1

                newrow = (rowNumber, name, program, mealType[0], mealType[1], mealType[2], mealType[3], energy, protein, fatness, carbohydrates, calcium, na, potassium, alcohol, moisture, foodType, firstImageWeight, firstImageFileName, firstImageWidth, firstImageHeight, secondImageWeight, secondImageFileName, secondImageWidth, secondImageHeight, thirdImageWeight, thirdImageFileName, thirdImageWidth, thirdImageHeight, fourthImageWeight, fourthImageFileName, fourthImageWidth, fourthImageHeight, menuImageFileName, hebrewName.encode("utf-8"), arabicName.encode("utf-8"))
                writer.writerow(newrow)


            self.send_response(200)
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            return

        if self.path == "/updateFoodItem":
            self.data_string = self.rfile.read(int(self.headers['Content-Length']))
            data = simplejson.loads(self.data_string)

            id = data['itemId']
            name = data['name']
            hebrewName = data['hebrewName']
            arabicName = data['arabicName']
            foodType = data['foodType']
            mealType = data['mealType']
            calcium = data['calcium']
            potassium  = data['potassium']
            moisture = data['moisture']
            protein = data['protein']
            carbohydrates = data['carbohydrates']
            na = data['na']
            alcohol = data['alcohol']
            energy = data['energy']
            fatness = data['fatness']
            menuImageFile = data['menuImageFile']
            firstImage = data["firstImage"]
            secondImage = data["secondImage"]
            thirdImage = data["thirdImage"]
            fourthImage = data["fourthImage"]
 
            with open("database.csv", "r") as csvFile:
                reader = csv.reader(csvFile)
                rowsList = [] 
                for row in reader:
                    if row[0] == id:
                        program = 1
                        menuImageFileName = name.lower().replace(" ", "_")+"_menu"
                        with open("pictures/{}.png".format(menuImageFileName), "w") as decoded:
                            decoded.write(base64.decodestring(menuImageFile.split(",")[1]))

                        firstImageFile, firstImageHeight, firstImageWidth, firstImageWeight = self.get_image_details(firstImage)
                        firstImageFileName = name.lower().replace(" ", "_")+"_s"
                        with open("pictures/{}.png".format(firstImageFileName), "w") as decoded:
                            decoded.write(base64.decodestring(firstImageFile.split(",")[1]))

                        if secondImage != "null":

                            program = 2
                            secondImageFile, secondImageHeight, secondImageWidth, secondImageWeight = self.get_image_details(secondImage)
                            secondImageFileName = name.lower().replace(" ", "_")+"_m"
                            with open("pictures/{}.png".format(secondImageFileName), "w") as decoded:
                                decoded.write(base64.decodestring(secondImageFile.split(",")[1]))

                            if thirdImage != "null":

                                thirdImageFile, thirdImageHeight, thirdImageWidth, thirdImageWeight = self.get_image_details(thirdImage)
                                thirdImageFileName = name.lower().replace(" ", "_")+"_l"
                                with open("pictures/{}.png".format(thirdImageFileName), "w") as decoded:
                                    decoded.write(base64.decodestring(thirdImageFile.split(",")[1]))

                                if fourthImage != "null":

                                    fourthImageFile, fourthImageHeight, fourthImageWidth, fourthImageWeight = self.get_image_details(fourthImage)
                                    fourthImageFileName = name.lower().replace(" ", "_")+"_xl"
                                    with open("pictures/{}.png".format(fourthImageFileName), "w") as decoded:
                                        decoded.write(base64.decodestring(fourthImageFile.split(",")[1]))

                                else:

                                    fourthImageFileName = "zzz_null_image" 
                                    fourthImageHeight = fourthImageWidth = fourthImageWeight = 1

                            else:

                                thirdImageFileName = "zzz_null_image" 
                                thirdImageHeight = thirdImageWidth = thirdImageWeight = 1

                                fourthImageFileName = "zzz_null_image" 
                                fourthImageHeight = fourthImageWidth = fourthImageWeight = 1

                        else:

                            secondImageFileName = "zzz_null_image" 
                            secondImageHeight = secondImageWidth = secondImageWeight = 1

                            thirdImageFileName = "zzz_null_image" 
                            thirdImageHeight = thirdImageWidth = thirdImageWeight = 1

                            fourthImageFileName = "zzz_null_image" 
                            fourthImageHeight = fourthImageWidth = fourthImageWeight = 1

                        newrow = (id, name, program, mealType[0], mealType[1], mealType[2], mealType[3], energy, protein, fatness, carbohydrates, calcium, na, potassium, alcohol, moisture, foodType, firstImageWeight, firstImageFileName, firstImageWidth, firstImageHeight, secondImageWeight, secondImageFileName, secondImageWidth, secondImageHeight, thirdImageWeight, thirdImageFileName, thirdImageWidth, thirdImageHeight, fourthImageWeight, fourthImageFileName, fourthImageWidth, fourthImageHeight, menuImageFileName, hebrewName.encode("utf-8"), arabicName.encode("utf-8"))
                        rowsList.append(newrow)
                    else:
                        rowsList.append(row)


            with open("database.csv", "w") as csvFile:   
                print len(rowsList)
                writer = csv.writer(csvFile)
                #for row in rowsList:
                writer.writerows(rowsList)
            self.send_response(200)
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            return

        if self.path == "/deleteFoodItem":
            self.data_string = self.rfile.read(int(self.headers['Content-Length']))
            data = simplejson.loads(self.data_string)
            id = data['itemId']

            with open("database.csv", "r") as csvFile:
                reader = csv.reader(csvFile)
                rowsList = [] 
                for row in reader:
                    if row[0] != id:
                        rowsList.append(row)

            with open("database.csv", "w") as csvFile:   
                print len(rowsList)
                writer = csv.writer(csvFile)
                writer.writerows(rowsList)

            self.send_response(200)
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            return


    def get_image_details(self, image):
        return image['imageFile'], image['imageHeight'], image['imageWidth'], image['imageWeight']

    def get_image_file_url(self, image_file_name):
        if image_file_name != "zzz_null_image":
            file_path = 'pictures/{}.png'.format(image_file_name)
            if os.path.isfile(file_path):
                image = open(file_path, 'rb') #open binary file in read mode
                image_read = image.read()
                encoded = "data:image/png;base64,"+base64.encodestring(image_read)
                #print encoded
                return encoded
        return "null"


def main():
    try:
        server = HTTPServer(('', 3000), MyHandler)
        print server.server_name
        print server.server_port

        sa = server.socket.getsockname()
        print "Serving HTTP on", sa[0], "port", sa[1], "..."
        print 'started httpserver...'
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        server.socket.close()

if __name__ == '__main__':
    main()

