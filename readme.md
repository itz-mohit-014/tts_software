Set up 

create venv and setup dependency for auth service
```
python -m venv venv
venv\Script\activate
pip install -r requirements.server.txt 
```

install dependency for tts ....

```
venv\Script\activate
pip install -r requirements.tts.txt 
```

## Login Credentials

```
Email: textclonify2025@gmail.com
Password: nikhil123 
```

## Export frontend file and move to static direcory
```
use powershell :
cd frontend
npm run build; npm run export

cd ../
mv frontend/out/* backend/static
```

To start the application just install the dependendency and click on the `start_server.bat` file which directly opne UI with server on the browser.
