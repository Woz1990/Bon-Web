#Copyright Jon Berg , turtlemeat.com
import webbrowser
from PIL import Image
import base64
import csv
import shutil
import simplejson
import json
import urlparse
import string,cgi,time
import os
import math
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime as dt
from datetime import date
import ssl
import jwt
import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText

server_port = 3000
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import io
from apiclient.http import MediaIoBaseDownload

def main(): 
    
    try: 
        gauth = GoogleAuth()
        gauth.LoadCredentialsFile("credentials.json")
        gauth.LocalWebserverAuth()
        gauth.SaveCredentialsFile("credentials.json")
        drive = GoogleDrive(gauth)
        #print_all_files_from_drive(drive, gauth)
        get_updates(drive, gauth)
        #files_to_upload = [f.split(".png")[0] for f in os.listdir("pictures") if os.path.isfile(os.path.join("pictures", f))]
        # files_to_upload = ["im013_t", "apple_red", "apple_s", "im001_t", "im002_t", "im003_t", "im007_t",
        #                     "im009_t", "im008_t", "im019_t", "im017_t", "im004_t", "im026_t", "im025_t", "im027_t"]
        # for filename in files_to_upload:
        #     upload_image_file(drive, filename)
        server = ServerForGoogleDrive(drive, gauth)
    except Exception,e: 
            print "Exception"
            print str(e)
            return 

    

class ServerForGoogleDrive:
    def __init__(self, drive, gauth):
        try:
            RequestHandler.drive = drive
            RequestHandler.gauth = gauth
            server = HTTPServer(('127.0.0.1', server_port), RequestHandler)
            sa = server.socket.getsockname()
            print "Serving HTTP on", sa[0], "port", sa[1], "..."
            print 'started httpserver...'
            from datetime import date
            print str(date.today())
            webbrowser.get('firefox').open_new_tab('WebContent/index.html')
            server.serve_forever()
        except KeyboardInterrupt:
            print '^C received, shutting down server'
            server.socket.close()


class RequestHandler(BaseHTTPRequestHandler):
    drive = None
    gauth = None

    #HTTP Status Codes
    OK = 200
    BAD_REQUEST = 400
    UNATHORIZED = 401
    FORBIDDEN = 403
    INTERNAL_SERVER_ERROR = 500

    #Other Constants
    ROW_SIZE = 37
    MAX_NUMBER_OF_ITEMS_IN_UPDATE_RESPONSE = 30


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
        if self.path == "/check":
            print "in check"
            from urlparse import urlparse
            query = urlparse(self.path).query
            print query
            self.send_response_status_code(self.OK)
            return

        if self.path == "/showFoodItems":
            self.get_all_food_items()
            return

        if self.path == "/reloadAllImages":
            download_img_files(self.drive, self.gauth)
            self.get_all_food_items()
            return

        if self.path == "/showRemovedFoodItems":
            self.get_all_food_items("false")
            return


        return

    def do_POST(self):

        import base64 
        print self.path
        try:
            self.data_string = self.rfile.read(int(self.headers['Content-Length']))
            data = simplejson.loads(self.data_string)
            download_csv_database(self.drive, self.gauth)
            if self.path == "/addFoodItem":
                #getting data from client
                
                self.add_food_item(data)
                return

            if self.path == "/updateFoodItem":
                print data
                self.update_food_item(data)
                return

            if self.path == "/deleteFoodItem":
                self.delete_undelete_food_item(data, "delete")
                return

            if self.path == "/undeleteFoodItem":
                self.delete_undelete_food_item(data, "undelete")
                return

        except Exception,e: 
            print "Exception"
            print str(e)
            return      

    ##########Handling Request To Food DB############

    def delete_undelete_food_item(self, data, mode):
        if mode == "delete": valueToSet = "True";
        elif mode == "undelete": valueToSet = "False";
        id = data['itemId']
        found = False

        with open("database.csv", "r") as csvFile:
            reader = csv.reader(csvFile)
            rowsList = [] 
            for row in reader:
                if row[0] == id:
                    row[36] = valueToSet
                    found = True
                rowsList.append(row)

        if found == False:
            self.send_response_status_code(self.FORBIDDEN, "Food item was not found")
            return

        with open("database.csv", "w") as csvFile:   
            writer = csv.writer(csvFile)
            writer.writerows(rowsList)
        upload_csv_database(self.drive)
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
        upload_csv_database(self.drive)
        #TODO here
        self.send_response_status_code(self.OK)

    def add_food_item(self, data):
        print "add_food_item 1"
        name = data['name']
        print "add_food_item 2"
        maxId = 1
        with open("database.csv", "r+") as csvFile:
            print "add_food_item 3"
            reader = csv.reader(csvFile)
            print "add_food_item 4"
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
            #reader = csv.reader(csvFile)
            print "add_food_item 5"
            writer = csv.writer(csvFile)
            row = ['']*self.ROW_SIZE
            row[0] = maxId+1
            print "add_food_item 6"
            row[1] = name
            row[22] = row[26] = row[30] = "zzz_null_image"
            print "add_food_item 7"
            row[21] = row[23] = row[24] = row[25] = row[27] = row[28] = row[29] = row[31] = row[32] = -1
            print "add_food_item 8"
            row = self.create_database_row_from_client_data(data, row)
            print "add_food_item 9"
            writer.writerow(row)
        upload_csv_database(self.drive)
        self.send_response_status_code(self.OK, simplejson.dumps({"id":maxId+1}))

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

    def get_all_food_items(self, valueToSkip="true"):
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

                if row[36].lower() == valueToSkip:
                    continue
                try:
                    item = self.create_food_item(row)
                    database.append(item)
                except Exception,e:
                    print e
                rownum += 1
                # if rownum == 40:
                #     break

        if self.path == "/check": 
            now = dt.now()
            database.append({"currentDate":now.strftime("%Y-%m-%d %H:%M")})
        print str(len(database))
        self.send_response_status_code(self.OK, simplejson.dumps(database))

    def create_database_row_from_client_data(self, data, row):
        print "create_database_row_from_client_data 1"
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
                upload_image_file(self.drive, imageFileName)
                continue
            if key == "width":
                row[19] = str(int(round(float(data[key])))); continue
            if key == "height":
                row[20] = str(int(round(float(data[key])))); continue
            if key == "weight2":
                row[21] = data[key]; continue
            if key == "img_file2":
                if data[key] == "zzz_null_image":
                    row[21] = "-1"
                    row[22] = "zzz_null_image"
                    row[23] = "-1"
                    row[24] = "-1"
                    continue
                imageFileName = row[1].lower().replace(" ", "_")+"_m"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[22] = imageFileName
                row[2] = 2
                upload_image_file(self.drive, imageFileName)
                continue
            if key == "width2":
                row[23] = str(int(round(float(data[key])))); continue
            if key == "height2":
                row[24] = str(int(round(float(data[key])))); continue
            if key == "weight3":
                row[25] = data[key]; continue
            if key == "img_file3":
                if data[key] == "zzz_null_image":
                    row[25] = "-1"
                    row[26] = "zzz_null_image"
                    row[27] = "-1"
                    row[28] = "-1"
                    continue
                imageFileName = row[1].lower().replace(" ", "_")+"_l"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[26] = imageFileName
                upload_image_file(self.drive, imageFileName)
                continue
            if key == "width3":
                row[27] = str(int(round(float(data[key])))); continue
            if key == "height3":
                row[28] = str(int(round(float(data[key])))); continue
            if key == "weight4":
                row[29] = data[key]; continue
            if key == "img_file4":
                if data[key] == "zzz_null_image":
                    row[29] = "-1"
                    row[30] = "zzz_null_image"
                    row[31] = "-1"
                    row[32] = "-1"
                    continue
                imageFileName = row[1].lower().replace(" ", "_")+"_xl"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[30] = imageFileName
                upload_image_file(self.drive, imageFileName)
                continue
            if key == "width4":
                row[31] = str(int(round(float(data[key])))); continue
            if key == "height4":
                row[32] = str(int(round(float(data[key])))); continue
            if key == "menu_image":
                imageFileName = row[1].lower().replace(" ", "_")+"_menu"
                with open("pictures/{}.png".format(imageFileName), "w") as decoded:
                    decoded.write(base64.decodestring(data[key].split(",")[1]))
                row[33] = imageFileName
                upload_image_file(self.drive, imageFileName)
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
        print "create_database_row_from_client_data 2"
        if row[22].find("null") != -1: row[2] = 1
        print "create_database_row_from_client_data 3"
        row[36] = "False"
        return row


    def get_image_file_url(self, image_file_name):
        if image_file_name.find("null") == -1:
            file_path = 'pictures/{}.png'.format(image_file_name)
            if os.path.isfile(file_path):
                image = open(file_path, 'rb') #open binary file in read mode
                image_read = image.read()
                encoded = "data:image/png;base64,"+base64.encodestring(image_read)
                return encoded
            else:
                print file_path + " doesn't exist"
        return "null"

def download_csv_database(drive, gauth):
    file_list = drive.ListFile({'q': "title='database.csv'"}).GetList()
    if len(file_list) == 0:
        return False

    file_id = file_list[0]['id']

    drive_service = gauth.service
    try:
        request = drive_service.files().get_media(fileId=file_id)
        fh = io.FileIO("database.csv", 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            print "database.csv was downloaded" 
        return True

    except Exception, e:
        print e
        return False

def upload_csv_database(drive):
    file_list = drive.ListFile({'q': "title='{}'".format("database.csv")}).GetList()
    for file_index in range(len(file_list)):
        file_id = file_list[file_index]['id']
        f = drive.CreateFile({'id': file_id})
        f.Delete()
    databaseFile = drive.CreateFile()
    databaseFile.SetContentFile('database.csv')
    databaseFile.Upload()
    print "csv uploaded"

def upload_image_file(drive, img_filename):
    file_list = drive.ListFile({'q': "title='pictures' and mimeType = 'application/vnd.google-apps.folder'"}).GetList()
    if len(file_list) != 1:
        return
    pictures_folder_id = file_list[0]['id']

    file_list = drive.ListFile({'q': "title='{}.png'".format(img_filename)}).GetList()
    for file_index in range(len(file_list)):
        print "upload_image_file in for"
        png_id = file_list[file_index]['id']
        f = drive.CreateFile({'id': png_id})
        f.SetContentFile('pictures/{}.png'.format(img_filename))
        f.Upload()
        print "seems to be uploaded"
        return

    imgFile = drive.CreateFile({"parents": [{"id": pictures_folder_id}], 'title': "{}.png".format(img_filename)})
    for key in imgFile:
        print key
        print imgFile[key]
        print "-------"
    imgFile.SetContentFile('pictures/{}.png'.format(img_filename))
    imgFile.Upload()

def print_all_files_from_drive(drive, gauth):
    file_list = drive.ListFile({'q': "title='pictures' and mimeType = 'application/vnd.google-apps.folder'"}).GetList()
    if len(file_list) != 1:
        return
    pictures_folder_id = file_list[0]['id']
    drive_service = gauth.service
    print str(type(drive_service))
    counter = 0
    request = drive_service.files().list().execute()
    for item in request.get('items'):
        #print "parents " + str(item.get("parents"))
        print "trashed " + str(item.get("labels")["trashed"])
        print "explicitlyTrashed " + str(item.get("explicitlyTrashed"))
        if item.get("parents")[0]["id"] == pictures_folder_id:
            counter += 1
        # if item.get("title").find(".png") != -1:
        #     counter += 1
        # else:
        #     print item.get("mimeType")
        #     print item.get("title")
    page_token = request.get('nextPageToken')
    while page_token is not None:
        request = drive_service.files().list(pageToken=page_token).execute()
        for item in request.get('items'):
            print "trashed " + str(item.get("labels")["trashed"])
            print "explicitlyTrashed " + str(item.get("explicitlyTrashed"))
            if item.get("parents")[0]["id"] == pictures_folder_id:
                counter += 1
        page_token = request.get('nextPageToken')
    print str(counter)
    
def get_updates(drive, gauth):
    if download_csv_database(drive, gauth) == False:
        print "csv database download failed"
        #return
    if not os.path.isdir("pictures"):
        os.makedirs("pictures")
        download_image_files(drive, gauth)
    else:
        drive_service = gauth.service
        if os.path.isfile("last_page.txt"):
            last_page_file = open("last_page.txt", "r")
            last_page = last_page_file.readline()
            last_page_file.close() 
            page_token = last_page
            updatedFilesIds = []
            while page_token is not None:
                response = drive_service.changes().list(pageToken=page_token, 
                                                        spaces='drive').execute()
                for change in response.get('items'):
                    # Process change
                    if change.get('deleted'): continue
                    updatedFilesIds.append(change.get('fileId'))
                if 'newStartPageToken' in response:
                    # Last page, save this token for the next polling interval
                    last_page = response.get('newStartPageToken')
                page_token = response.get('nextPageToken')
            with open("last_page.txt", "w") as last_page_file:
                last_page_file.write(last_page)

            download_img_files(drive, gauth, updatedFilesIds)
        else:
            response = drive_service.changes().getStartPageToken().execute()
            last_page = response.get('startPageToken')
            with open("last_page.txt", "w") as last_page_file:
                last_page_file.write(last_page)
            download_img_files(drive, gauth)

###TODOOO: IF WE NEED GAUTH

def download_img_files(drive, gauth, updatedFilesIds=None):
    file_list = drive.ListFile({'q': "title='pictures' and mimeType = 'application/vnd.google-apps.folder'"}).GetList()
    if len(file_list) != 1:
        return
    pictures_folder_id = file_list[0]['id']
    drive_service = gauth.service
    file_list = drive.ListFile({'q': "'{}' in parents and (mimeType='image/jpeg' or mimeType='image/png')".format(pictures_folder_id)}).GetList()
    for file1 in file_list:
        if file1['labels']['trashed'] == True: continue
        if updatedFilesIds != None:
            if file1['id'] not in updatedFilesIds:
                continue
        print file1['title']
        download_img_file(drive_service, file1['id'], file1['title'])

###TODOOO: IF WE NEED GAUTH

def download_img_file(drive_service, fileId, title):
    try:
        request = drive_service.files().get_media(fileId=fileId)
        fh = io.FileIO(format(title), 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            shutil.move(title, 'pictures/{}'.format(title))
            print "{} downloaded".format(title )
    except Exception, e:
        print e



if __name__ == '__main__':
    main()
