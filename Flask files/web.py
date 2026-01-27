from flask import Flask
from flask import render_template, request
import pyodbc
app = Flask(__name__)
# Home page
@app.route("/")
def home():
        print('Loading Home page')
        return render_template("/index.html")
# Form page
@app.route("/register", methods=["GET", "POST"])
def form():
        con = ('Driver={SQL Server};' 'Server=.;' 'Database=master;' 'Trusted_connection=yes;')
        conn = pyodbc.connect(con)
        cursor = conn.cursor()
        print("creating a new table")
        print('Loading Registration page')
        if request.method == "POST":
                Name = request.form["name"]
                Email = request.form["email"]
                Comments = request.form["message"]
                Number = request.form["number"]
                cursor.execute("create table userinfo(Username varchar(30),Email varchar(40),Phonenumber varchar(10))")
                conn.commit()
                cursor.execute("insert into userinfo values(?,?,?)",(Name,Email,Number))
                conn.commit()
                conn.close()
                print("information has successfully inserted")
                return render_template('regsuccess.html',name=Name,email=Email,number=Number)
        else:
                Name = request.args.get("name")
                Email = request.args.get("email")
                Comments = request.args.get("message")
                Number = request.args.get("number")
                return render_template('regsuccess.html',name=Name,email=Email,number=Number)

if __name__ == "__main__":
        app.run(debug=True)
        print('Web service Started')
else:
        print('Web service Stopped')
