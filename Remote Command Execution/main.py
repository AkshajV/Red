from flask import Flask, request    #flask is a web framework for building web apps in python, requests handle http req
from flask_httpauth import HTTPBasicAuth    #provides authentication facility
import subprocess   #creates new child process through which I can run external applications and execute commands

app = Flask(__name__)
auth = HTTPBasicAuth()

users = {
    "admin" : "password"
}

@auth.get_password
def get_pw(username):
    if username in users:                   #if username exists in users dict, it will return the corresponding password
        return users.get(username)
    return None

@app.route("/")
@auth.login_required
def index():
    command = request.args.get("command")       #retrieves query parameter
    try:
        output = subprocess.check_output(command, shell=True)       #executes shell command
        return output.decode()
    except subprocess.CalledProcessError as e:
        return str(e)

if __name__ == "__main__":
    app.run()



