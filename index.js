const express = require("express");
const path = require("path");
const body_parser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const favicon = require('serve-favicon');
const saltRounds = 10;

let config = {
    host: '178.128.57.4',
    user: 'caesars2',
    password: '0812678626',
    database: 'ezparking',
    port: '3306'
};

// let config = {
//     host: 'localhost',
//     user: 'root',
//     database: 'ezparking'
// }



const app = express();
const con = mysql.createConnection(config, { multipleStatements: true });


app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'img', 'logoTitle.ico')));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/index.html"))
});

app.get("/signUp", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/signUp.html"))
});

app.get("/signIn", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/signIn.html"))
});

app.get("/searchParking", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/searchParking.html"))
});

app.get("/toggleStatus", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/toggleStatus.html"))
});

app.get("/signUpMember", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/signUpMember.html"))
});

app.get("/getStatus", function (req, res) {

    const sql = "SELECT UserID, Location, Activation,Geo,Province,Amphur,District,Description,SupportCar FROM account";
    con.query(sql, function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
            // console.log(result[0].TripID)

        }
    });
})

app.get("/getRequest/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT RequestID, RequesterFirstname,RequestierLastname,Day,Month,Year,Time,Confirmation FROM request WHERE UserID =? AND Confirmation='ยังไม่ได้รับการตอบรับ';";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
            // console.log(result[0].TripID)

        }
    });
})

app.get("/getApprovedRequest/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT RequestID, RequesterFirstname,RequestierLastname,Day,Month,Year,Time,Confirmation FROM request WHERE UserID =? AND Confirmation='ได้รับการยืนยันแล้ว';";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
            // console.log(result[0].TripID)

        }
    });
})

app.get("/getDeniedRequest/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT RequestID, RequesterFirstname,RequestierLastname,Day,Month,Year,Time,Confirmation FROM request WHERE UserID =? AND Confirmation='ได้รับการปฏิเสธ';";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
            // console.log(result[0].TripID)

        }
    });
})

app.get("/getMemberInfo/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT Firstname, Lastname, Phone, Email FROM `member` where UserID = ?;";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
        }
    });
});

app.get("/getRequestInfo/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT Location,RequestID, RequesterFirstname, RequestierLastname , Day, Month, Year, Time,Confirmation FROM `request` where MemberID = ?;";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
        }
    });
});

app.post("/sendRequest", function (req, res) {
    var { UserLocation, UserID, MemberID, RequesterFirstname, RequesterLastname, Day, Month, Year, Time, Confirmation } = req.body
    const sql = "INSERT INTO `request` (`Location`,`UserID`,`MemberID`,`RequesterFirstname`, `RequestierLastname`, `Day`, `Month`, `Year`, `Time`, `Confirmation`) VALUES (?,?,?,?,?,?,?,?,?,?);";
    con.query(sql, [UserLocation, UserID, MemberID, RequesterFirstname, RequesterLastname, Day, Month, Year, Time, Confirmation], function (err, result, fields) {
        if (err) {
            res.status(500).send("Server error");
            console.log(err)
        }
        else {
            res.json(result);
        }
    });
})

app.put("/addMember", function (req, res) {
    const { Username, Password, Firstname, Lastname, Phone, Email } = req.body

    const sql = "SELECT * FROM member WHERE Username = ?"
    con.query(sql, [Username], function (err, result, fields) {
        if (err) {
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง")
            console.log(err)
        }
        else {
            if (!result[0]) {
                const sql2 = "INSERT INTO `member` ( `Username`, `Password`, `Firstname`, `Lastname`, `Phone`,`Email`) VALUES (?, ?, ?, ? ,?, ?);"
                bcrypt.hash(Password, saltRounds, function (err, hash) {
                    con.query(sql2, [Username, hash, Firstname, Lastname, Phone, Email], function (err2, result2, fields) {
                        if (err2) {
                            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง")
                            console.log(err2)
                        }
                        else {
                            const sql2 = "SELECT * FROM member WHERE Username = ?"
                            con.query(sql2, [Username], function (err2, result2, fields2) {
                                if (err2) {
                                    res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
                                    console.log(err2)
                                } else {
                                    res.send(result2);
                                }
                            })

                        }
                    });
                });
            } else {
                res.send('0')
            }
        }
    })
});

app.put("/addUser", function (req, res) {
    const { Username, Password, Firstname, Lastname, Location, Phone, Activation, Province, Amphur, District, Description, Email, Geo, SupportCar, FreeSpace } = req.body

    const sql = "SELECT * FROM account WHERE Username = ?"
    con.query(sql, [Username], function (err, result, fields) {
        if (err) {
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง")
            console.log(err)
        }
        else {
            if (!result[0]) {
                const sql2 = "INSERT INTO `account` ( `Username`, `Password`, `Firstname`, `Lastname`, `Location`, `Phone` ,`Activation`,`Province`,`Amphur`,`District`,`Description`,`Email`,`Geo`,`SupportCar`,`FreeSpace`) VALUES (?, ?, ?, ? ,?, ? ,? ,? ,? ,? ,?,?,?,?,?);"
                bcrypt.hash(Password, saltRounds, function (err, hash) {
                    con.query(sql2, [Username, hash, Firstname, Lastname, Location, Phone, Activation, Province, Amphur, District, Description, Email, Geo, SupportCar, FreeSpace], function (err2, result2, fields) {
                        if (err2) {
                            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง")
                            console.log(err2)
                        }
                        else {
                            const sql2 = "SELECT * FROM account WHERE Username = ?"
                            con.query(sql2, [Username], function (err2, result2, fields2) {
                                if (err2) {
                                    res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
                                    console.log(err2)
                                } else {
                                    res.send(result2);
                                }
                            })

                        }
                    });
                });
            } else {
                res.send('0')
            }
        }
    })
});

app.post("/login", function (req, res) {
    const { Username, Password1 } = req.body

    const sql = "SELECT * FROM account WHERE Username = ?"
    con.query(sql, [Username, Username], function (err, result, fields) {
        if (err) {
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
            console.log(err)
        }
        else {
            if (result.length > 0) {
                bcrypt.compare(Password1, result[0].Password, function (err, resp) {
                    if (err) {
                        res.status(503).send('Authentication Server error');
                    } else {
                        if (resp) {
                            res.json(result)

                        } else {
                            res.send('0')
                        }
                    }
                });
            } else {
                res.send('0')
            }
        }
    })
});

app.post("/loginMember", function (req, res) {
    const { Username, Password1 } = req.body

    const sql = "SELECT * FROM member WHERE Username = ?"
    con.query(sql, [Username, Username], function (err, result, fields) {
        if (err) {
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
            console.log(err)
        }
        else {
            if (result.length > 0) {
                bcrypt.compare(Password1, result[0].Password, function (err, resp) {
                    if (err) {
                        res.status(503).send('Authentication Server error');
                    } else {
                        if (resp) {
                            res.json(result)

                        } else {
                            res.send('0')
                        }
                    }
                });
            } else {
                res.send('0')
            }
        }
    })
});

app.get("/getAllProvinces/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT id,name_th FROM `provinces` where geography_id = ?;";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
        }
    });
});


app.get("/getAllAmphures/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT id,name_th FROM `amphures` where province_id =?";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
        }
    });
});

app.get("/getAllDistricts/:id", function (req, res) {
    var id = req.params.id;
    const sql = "SELECT id,name_th FROM `districts` where amphure_id =?";
    con.query(sql, [id], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
        }
    });
});

app.get("/getAllGeo", function (req, res) {
    const sql = "SELECT id,name FROM `geographies`";
    con.query(sql, function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
        }
    });
});

app.get("/getLocationName/:UserID", function (req, res) {
    var UserID = req.params.UserID;
    const sqlTrip = "SELECT Location, Firstname, Lastname, Phone, Email,Geo,Province,Amphur,District,Description,SupportCar,Activation FROM `account` WHERE UserID =?";
    con.query(sqlTrip, [UserID], function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
            // console.log(result[0].TripID)
        }
    });
});

app.put("/editInfo", function (req, res) {
    const Firstname = req.body.Firstname;
    const Lastname = req.body.Lastname;
    const Email = req.body.Email;
    const Phone = req.body.Phone;
    const UserID = req.body.UserID;

    const sql = "UPDATE `account` SET `Firstname` = ?,`Lastname` = ?, `Phone` = ? ,`Email` = ? WHERE `UserID` = ?;"
    con.query(sql, [Firstname, Lastname, Phone, Email, UserID], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});
app.get("/getVisiting", function (req, res) {

    const sql = "SELECT * FROM `visiting`";
    con.query(sql, function (err, result, fields) {
        if (err) {
            // console.log(err)
            res.status(500).send("Server error");
        }
        else {
            res.json(result);
            // console.log(result[0].TripID)

        }
    });
})

app.get("/getParkedCar/:UserID", function (req, res){
    const UserID = req.params.UserID;
    const sql = "SELECT ParkedCar FROM account WHERE UserID = ?;";
    con.query(sql,[UserID], function (err, result, fields){
        if(err){
            res.status(500).send("Server error");
        }else{
            res.json(result);
        }
    })
});

app.get("/getSupportCar/:UserID", function (req, res){
    const UserID = req.params.UserID;
    const sql = "SELECT SupportCar FROM account WHERE UserID = ?;";
    con.query(sql,[UserID], function (err, result, fields){
        if(err){
            res.status(500).send("Server error");
        }else{
            res.json(result);
        }
    })
});

app.put("/visiting", function (req, res) {
    const visiting = req.body.visiting;
    const sql = "UPDATE `visiting` SET `visiting` = ?"
    con.query(sql, [visiting], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});

app.put("/editMemberInfo", function (req, res) {
    const Firstname = req.body.Firstname;
    const Lastname = req.body.Lastname;
    const Email = req.body.Email;
    const Phone = req.body.Phone;
    const UserID = req.body.UserID;

    const sql = "UPDATE `member` SET `Firstname` = ?,`Lastname` = ?, `Phone` = ?, `Email` = ? WHERE `UserID` = ?;"
    con.query(sql, [Firstname, Lastname, Phone, Email, UserID], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});

app.put("/changeStatus", function (req, res) {
    const Activation = req.body.Activation
    const UserID = req.body.UserID;

    const sql = "UPDATE `account` SET `Activation` = ? WHERE `UserID` = ?;"
    con.query(sql, [Activation, UserID], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});

app.put("/accept", function (req, res) {
    const Confirmation = req.body.Confirmation
    const RequestID = req.body.RequestID;

    const sql = "UPDATE `request` SET `Confirmation` = ? WHERE `RequestID` = ?;"
    con.query(sql, [Confirmation, RequestID], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});

app.put("/deny", function (req, res) {
    const Confirmation = req.body.Confirmation
    const RequestID = req.body.RequestID;

    const sql = "UPDATE `request` SET `Confirmation` = ? WHERE `RequestID` = ?;"
    con.query(sql, [Confirmation, RequestID], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});

app.put("/changeCar", function (req, res) {
    const SupportCar = req.body.SupportCar
    const UserID = req.body.UserID;

    const sql = "UPDATE `account` SET `SupportCar` = ? WHERE `UserID` = ?;"
    con.query(sql, [SupportCar, UserID], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});

app.put("/newCar", function (req, res) {
    const ParkedCar = req.body.ParkedCar
    const UserID = req.body.UserID;

    const sql = "UPDATE `account` SET `ParkedCar` = ? WHERE `UserID` = ?;"
    con.query(sql, [ParkedCar, UserID], function (err, result, fields) {
        if (err) {
            console.log(err)
            res.status(503).send("เซิร์ฟเวอร์ไม่ตอบสนอง");
        }
        else {
            res.send("/toggleStatus");
        }
    })
});

// <======Starting server======>
const PORT = 9099
app.listen(PORT, function () {
    console.log("Server port is " + PORT);
});