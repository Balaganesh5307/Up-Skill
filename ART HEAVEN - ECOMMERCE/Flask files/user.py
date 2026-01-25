from flask import Flask
from flask import render_template, request
import pyodbc

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../templates/static"
)
@app.route("/")
def home():
        print("Loading Home page")
        return render_template("index.html")


@app.route("/signin")
def signin():
        print("Loading Sign in page")
        return render_template("sign in.html")


@app.route("/signup")
def signup():
        print("Loading Sign up page")
        return render_template("sign up.html")


@app.route("/cart")
def cart():
        print("Loading Cart page")
        return render_template("add to cart.html")


@app.route("/checkout")
def checkout():
        print("Loading Checkout page")
        return render_template("payment_form.html")


@app.route("/order")
def order():
        print("Loading Order confirmation page")
        return render_template("order.html")

@app.route("/user", methods=["GET", "POST"])
def form():
        con = ('Driver={SQL Server};' 'Server=.;' 'Database=master;' 'Trusted_connection=yes;')
        conn = pyodbc.connect(con)
        cursor = conn.cursor()
        print("creating a new table")
        print('Loading Registration page')
        if request.method == "POST":
                Name = request.form["username"]
                Email = request.form["email"]
                Password = request.form["password"]
                Number = request.form["pnumber"]
                Address = request.form["address"]
                Pincode = request.form["pincode"]
                cursor.execute("create table logininfo(Username varchar(30),Email varchar(40),Password varchar(20),Phonenumber varchar(10),Address varchar(50),Pincode varchar(6))")
                conn.commit()
                cursor.execute("insert into logininfo values(?,?,?,?,?,?)",(Name,Email,Password,Number,Address,Pincode))
                conn.commit()
                conn.close()
                print("information has successfully inserted")
                return render_template('usersuccess.html',username=Name,email=Email,pnumber=Number,password=Password,address=Address,pincode=Pincode)
        else:
                Name = request.args.get("username")
                Email = request.args.get("email")
                Password = request.args.get("password")
                Number = request.args.get("pnumber")
                Address = request.args.get("address")
                Pincode = request.args.get("pincode")
                return render_template('usersuccess.html',username=Name,email=Email,pnumber=Number,password=Password,address=Address,pincode=Pincode)
if __name__ == "__main__":
        app.run(debug=True)
        print('Web service Started')
else:
        print('Web service Stopped')
