var express = require('express');
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();
const mysql = require('mysql')

var con = mysql.createConnection({
  host: "localhost",
  user: "taskerren",
  password: "FixItFelix",
  database: "askareiska"
});

var pool  = mysql.createPool({
  host: "localhost",
  user: "taskerren",
  password: "FixItFelix",
  database: "askareiska"
});

const { v4: uuidv4 } = require('uuid');
const{ validate: validateUuid } = require('uuid');


let uuidNew = uuidv4();
console.log(uuidNew);
uuidNew = uuidv4();
console.log(uuidNew);

app.get('/newDevice', (request, response) => {
    var thisResponse = new Object();
    thisResponse.type = "newDeviceToken";
    const time_stamp = Date.now();
    const date_stamp = new Date();

    var deviceId = uuidv4();
    thisResponse.deviceId = deviceId;

    pool.getConnection(function(err, connection) {
	
    	const sql_query = "INSERT INTO devices (id,deviceId) VALUES (NULL,'" + deviceId + "');";
    	connection.query(sql_query, (err, result) => {
    	//con.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result);
        connection.release();
     	})
    })

    const logText = date_stamp + " /newDevice " + request.connection.remoteAddress + " " + deviceId;
    console.log(logText);
    response.send(JSON.stringify(thisResponse));

})

app.get('/newFamily/:deviceId', (request, response) => {
	var thisResponse = new Object();
	thisResponse.type = "newFamily";
	const deviceId = request.params.deviceId;
	const time_stamp = Date.now();
	const date_stamp = new Date();

	var familyId = uuidv4();
	thisResponse.familyId = familyId;
    
  
	var sql_query = "INSERT INTO families (id,familyId,masterId) VALUES (NULL,'" + familyId + "',(SELECT id FROM devices WHERE deviceID = '" + deviceId + "'));";
	pool.getConnection(function(err, connection) {

		try {
			connection.query(sql_query, (err, result) => {
			if (err) console.log(JSON.stringify(err))
			const json = JSON.stringify(result)
			//connection.release();
			})
		} catch (err) {
		} finally {
			sql_query = "INSERT INTO members (id,familyId,deviceId,role) VALUES (NULL,(SELECT id FROM families WHERE familyId = '" + familyId + "'),(SELECT id FROM devices WHERE deviceID = '" + deviceId + "'),'guardian');";
			
			try {
				connection.query(sql_query, (err, result) => {
				if (err) console.log(JSON.stringify(err))
				const json = JSON.stringify(result)
				//connection.release();
				})
			} catch (err) {
			} finally {
				connection.release();
				const logText = date_stamp + " /newFamily " + request.connection.remoteAddress + " " + familyId;
				console.log(logText);
				response.send(JSON.stringify(thisResponse));
			}


		}
	})   

})

app.get('/joinFamily/cancelRequest/:deviceId', (request, response) => {
	const deviceId = request.params.deviceId;
	var thisResponse = new Object();
	thisResponse.type = "cancelRequest";
	thisResponse.valid = false;
	const time_stamp = Date.now();
	const date_stamp = new Date();
	thisResponse.valid = false;

	const logText = date_stamp + " /joinFamily/cancelRequest " + request.connection.remoteAddress + " " + deviceId;
	console.log(logText);

	if (validateUuid(deviceId))
	{
		const sql_query = "UPDATE joinRequests SET status='cancelled' WHERE fromDevice = (SELECT id FROM devices WHERE deviceId='" + deviceId + "') AND status='unhandled';";
		pool.getConnection(function(err, connection) {

		try {
			connection.query(sql_query, (err, result) => {
			if (err) console.log(JSON.stringify(err))
			const json = JSON.stringify(result)
			//connection.release();
			})
		} catch (err) {
		} finally {
		    
			//console.log(JSON.stringify(thisResponse))
			thisResponse.valid = true;
			response.send(JSON.stringify(thisResponse));

		}
	}) 

	}
	else
	{
	    response.send(JSON.stringify(thisResponse));
		
	}


})

app.get('/joinFamily/pendingRequest/:deviceId', (request, response) => {
	const deviceId = request.params.deviceId;
	var thisResponse = new Object();
	thisResponse.type = "pendingRequest";
	thisResponse.status = "error";
	thisResponse.valid = false;
	const time_stamp = Date.now();
	const date_stamp = new Date();
	thisResponse.valid = false;

	const logText = date_stamp + " /joinFamily/pendingRequest " + request.connection.remoteAddress + " " + deviceId;
	console.log(logText);

	if (validateUuid(deviceId))
	{
		const sql_query = "SELECT families.familyId,joinRequests.status FROM families join joinRequests on families.id=joinRequests.toDevice WHERE joinRequests.fromDevice = (SELECT id FROM devices WHERE deviceId = '" + deviceId + "') AND joinRequests.isActive=TRUE";
		pool.getConnection(function(err, connection) {

		try {
			connection.query(sql_query, (err, result) => {
			if (err) console.log(JSON.stringify(err))
			var json = JSON.stringify(result);
			var jsonObj = JSON.parse(json)
			thisResponse.status = jsonObj[0].status;
			//connection.release();
			})
		} catch (err) {
		} finally {
		    
			//console.log(JSON.stringify(thisResponse))
			thisResponse.valid = true;
			response.send(JSON.stringify(thisResponse));
			connection.release();

		}
	}) 

	}
	else
	{
	    response.send(JSON.stringify(thisResponse));
		
	}


})

app.get('/joinFamily/:familyId/:deviceId', (request, response) => {
	const familyId = request.params.familyId;
	const deviceId = request.params.deviceId;
	var thisResponse = new Object();
	thisResponse.type = "joinFamily";
	const time_stamp = Date.now();
	const date_stamp = new Date();
	thisResponse.familyId = "undefined";
	thisResponse.deviceId = "undefined";
	thisResponse.valid = false;

	const logText = date_stamp + " /joinFamily " + request.connection.remoteAddress + " " + familyId + "," + deviceId;
	console.log(logText);

	if (validateUuid(familyId) && validateUuid(deviceId))
	{
		thisResponse.familyId = familyId;
		thisResponse.deviceId = deviceId;
		thisResponse.valid = true;
	

		const sql_query = "INSERT INTO joinRequests (id,fromDevice,toDevice) VALUES (NULL,(SELECT id FROM devices WHERE deviceId = '" + deviceId + "'),(SELECT id FROM families WHERE familyId = '" + familyId + "'));";
		pool.getConnection(function(err, connection) {

		try {
			connection.query(sql_query, (err, result) => {
			if (err) console.log(JSON.stringify(err))
			const json = JSON.stringify(result)
			//connection.release();
			})
		} catch (err) {
		} finally {
		    
		    //console.log(JSON.stringify(thisResponse))
		    response.send(JSON.stringify(thisResponse));

		}
	}) 

	}
	else
	{
	    response.send(JSON.stringify(thisResponse));
		
	}


})




app.get('/joinFamily/joinMember/:familyId/:deviceId/:userName', (request, response) => {
    const familyId = request.params.familyId;
    const deviceId = request.params.deviceId;
    const userName = request.params.userName;
    var thisResponse = new Object();
    thisResponse.type = "joinFamily";
    const time_stamp = Date.now();
    const date_stamp = new Date();

    const logText = date_stamp + " /joinMember " + request.connection.remoteAddress + " " + familyId + "/" + deviceId + "/" + userName;
    console.log(logText);
})

app.get('/manageFamily/:deviceId', (request, response) => {
    var thisResponse = new Object();
    thisResponse.type = "manageFamily";
    thisResponse.query = [];
    const deviceId = request.params.deviceId;
    const time_stamp = Date.now();
    const date_stamp = new Date();

    var sql_query = "select devices.deviceId, members.role from devices join members on devices.id=members.deviceId where members.familyId=(select id from families where families.familyId='e2a60318-ce7b-452f-8b3b-63077c2ad2fc');";
    //con.query(sql_query, (err, result) => {
    pool.getConnection(function(err, connection) {
	connection.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
	console.log(result);
	thisResponse.query = json;
        response.send(JSON.stringify(thisResponse));
	connection.release();
     	})
    })

    thisResponse.query = "salaatti";


    const logText = date_stamp + " /manageFamily " + request.connection.remoteAddress + " " + deviceId;
    console.log(logText);
    //response.send(JSON.stringify(thisResponse));

})

app.get('/outside/current', (request, response) => {

    const time_stamp = Date.now();
    const date_stamp = new Date();

    /* GENERIC SQL QUERY
    const sql_query = "";
    con.query(sql_query, (err, result) => {
	if (err) console.log(JSON.stringify(err))
	const json = JSON.stringify(result)
	response.send(json)
    })
    */

    let tempField = "";
    let sensorIdField = 0;

    let sql_query = "SELECT * FROM Parameters WHERE id=1";
    con.query(sql_query, (err, result) => {
	if (err) console.log(JSON.stringify(err))

	 tempField = result[0].charParam1;
   sensorIdField = result[0].intParam1;
	// console.log(tempField + " - " + sensorIdField);

	    sql_query = "SELECT date," + tempField + " FROM test2 WHERE sensorId=" + sensorIdField + " ORDER BY id DESC LIMIT 1";
	    con.query(sql_query, (err, result) => {
		if (err) console.log(JSON.stringify(err))

		const logText = date_stamp + " /outside/current " + request.connection.remoteAddress + " Outside temperature: " + result[0][tempField];
		console.log(logText);
		const json = JSON.stringify(result)
	        response.send(json)

	    })
    })

})

app.get('/Ventilator/current', (request, response) => {
	const time_stamp = Date.now();
	const date_stamp = new Date();

	let sql_query = "SELECT * FROM Ventilator ORDER BY id DESC LIMIT 1";
	con.query(sql_query, (err, result) => {
                if (err) console.log(JSON.stringify(err))

                const logText = date_stamp + " /Ventilator/current " + request.connection.remoteAddress;
                console.log(logText);
                const json = JSON.stringify(result)
                response.send(json)

	})

})

app.get('/mobile.php', (request, response) => {

    const time_stamp = Date.now();
    const date_stamp = new Date();

    /* GENERIC SQL QUERY
    const sql_query = "";
    con.query(sql_query, (err, result) => {
	if (err) console.log(JSON.stringify(err))
	const json = JSON.stringify(result)
	response.send(json)
    })
    */

    let tempField = "";
    let sensorIdField = 0;

    let sql_query = "SELECT * FROM Parameters WHERE id=1";
    con.query(sql_query, (err, result) => {
	if (err) console.log(JSON.stringify(err))

	tempField = result[0].charParam1;
        sensorIdField = result[0].intParam1;
	//console.log(tempField + " - " + sensorIdField);

	    sql_query = "SELECT * FROM (SELECT date as date," + tempField + " as temp,humid as humid, baro as baro, lux as lux FROM test2 WHERE sensorId=" + sensorIdField + " ORDER BY id DESC LIMIT 120) sub order by date ASC";
	    //console.log(sql_query);
	    con.query(sql_query, (err, result) => {
		if (err) console.log(JSON.stringify(err))

		const logText = date_stamp + " /mobile.php " + request.connection.remoteAddress + " Outside temperature: " + result[119][tempField];
		console.log(logText);
		const json = JSON.stringify(result)
	        response.send(json)

	    })
    })

})

app.get('/test.php', (request, response) => {

       console.log(request.connection.remoteAddress);
    const time_stamp = Date.now();
    const date_stamp = new Date();
	console.log(time_stamp);
	console.log(date_stamp);
   const sql_query = "INSERT INTO test (id,data) VALUES (NULL,'nodejs_testi_" + time_stamp + "')";
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        response.send(json)
    })

  // response.send('alex on paras');
//})

app.get('/test2.php', (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");

    console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
	console.log(time_stamp);
	console.log(date_stamp);

   const sql_query = "INSERT INTO test2 (id,time,temp,humid,baro,lux,sensorId,date) VALUES (NULL," + time_stamp + ",100,100,100,100,99,FROM_UNIXTIME(" + time_stamp + "))";
   console.log(sql_query);
con.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        response.send(json)
    })
  // response.send('alex on paras');
})

app.post('/post.php', urlencodedParser, (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");
    const b = request.body;
    //console.log(b);
    const temp = b.temp/10;
    const humid = b.humid;
    const baro = b.baro/10;
    const lux = b.lux;
    //const sensorId = b.sensorId;
    const sensorId = 2;
//console.log("temp="+temp);
    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
    //	console.log(time_stamp);
    //	console.log(date_stamp);
    const sql_query = "INSERT INTO test2 (id,time,temp,humid,baro,lux,sensorId,date) VALUES (NULL," + time_stamp + "," + temp + "," + humid + "," + baro + "," + lux + "," + sensorId + ",FROM_UNIXTIME(" + time_stamp + "))";
    // console.log(sql_query);
con.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        const logText = date_stamp + " post.php " + request.connection.remoteAddress + ": temp=" + temp + " humid=" + humid + " baro=" + baro + " lux=" + lux + " sensorId=" + sensorId;
    console.log(logText);
        //response.send(json)
	response.send('OK');
    })
  // response.send('alex on paras');
})

app.post('/pulseCounter', urlencodedParser, (request, response) => {
    const b = request.body;
    //console.log(b);
    let list = b.list;
    console.log(list);
    //let list = "160,3,4,5,6,7,8,9";
    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();

    let chars = 0;
    chars = list.search(",");
    //console.log(chars);
    let pulses = parseInt(list.substring(0,chars));
    const totalPulses = pulses;
    const totalEnergy_kWh = totalPulses / 1000;
    const avgOutage_kW = totalPulses * 3.6 / 300;

    // insert 10 minute pulse count

    let timeIncrement = 0;
    let energy_kJ = 0;
    let energy_kWh = 0;
    let outage_kW = 0;   
    let sql_query = "";
    let modifiedTime = time_stamp;
    let entries = 0;

    while (list.search(",") > -1)
    {
        list = list.substring(chars+1);
        //console.log(list);
        chars = list.search(",");
	if (chars < 0)
        {
            chars = list.length;
        }
        pulses = parseInt(list.substring(0,chars));
	//console.log(pulses);

        energy_kJ = pulses * 3.6;
        energy_kWh = pulses / 1000;
        outage_kW = energy_kJ / 10;
	modifiedTime = time_stamp - timeIncrement;
	sql_query = "INSERT INTO ElectricityPulses(id,unixtime,date,pulses,energy_kJ,energy_kWh,outage_kW) VALUES(NULL," +
                + modifiedTime + ","
                + "FROM_UNIXTIME(" + modifiedTime + "),"
                + pulses + ","
                + energy_kJ + ","
                + energy_kWh + ","
                + outage_kW + ")";

        timeIncrement = timeIncrement + 10;

        //console.log(sql_query);
	entries = entries + 1;
	con.query(sql_query, (err, result) => {
        if (err) 
	{
		//console.log(JSON.stringify(err));
		entries = entries - 1;
	}
        const json = JSON.stringify(result);
	})
    }


        const logText = date_stamp + " /ElectricityPulses " + request.connection.remoteAddress + " Total energy [kWh]: " + totalEnergy_kWh + " - Average outage [kW]: " + avgOutage_kW + " - Entries: " + entries;
    	console.log(logText);
        //response.send(json)
	response.send('OK');
    
  // response.send('alex on paras');
})

app.post('/sensorSetup', urlencodedParser, (request, response) => {
    const b = request.body;
    //console.log(b);
    let serialNumber = b.sn;
    console.log(serialNumber);
    //let list = "160,3,4,5,6,7,8,9";
    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
    const logText = date_stamp + " /sensorSetup " + request.connection.remoteAddress + " serialNumber: " + serialNumber;
    console.log(logText);
    
    var json = new Object();
    json.sensorId = 1;
    json.DHT1 = "11A";
    json.LDR = "C";
    response.send(json)
    
  // response.send('alex on paras');
})


app.post('/post2.php', urlencodedParser, (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");
    const b = request.body;
    //console.log(b);
    const temp = b.temp/10;
    const humid = b.humid;
    const baro = b.baro/10;
    const lux = b.lux;
    const sensorId = b.sensorId;
    let heaterRatio = -1;

    if (b.heater)
    {
        heaterRatio = b.heater/100;
    }
    //const sensorId = 2;
//console.log("temp="+temp);
    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
    //	console.log(time_stamp);
    //	console.log(date_stamp);
    const sql_query = "INSERT INTO test2 (id,time,temp,humid,baro,lux,sensorId,date,heaterRatio) VALUES (NULL," + time_stamp + "," + temp + "," + humid + "," + baro + "," + lux + "," + sensorId + ",FROM_UNIXTIME(" + time_stamp + ")," + heaterRatio + ")";
    // console.log(sql_query);
con.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        const logText = date_stamp + " post.php " + request.connection.remoteAddress + ": temp=" + temp + " humid=" + humid + " baro=" + baro + " lux=" + lux + " sensorId=" + sensorId + " heaterRatio: " + heaterRatio;
    console.log(logText);
        //response.send(json)
	response.send('OK');
    })
  // response.send('alex on paras');
})

app.post('/post4.1', urlencodedParser, async(request, response) => {
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
    const b = request.body;
    //console.log(b);
    let temp = b.t; // comma separated list of temps as desidegrees (254 = 25.4 degrees)
    let humid = b.hu; // comma separated list of humidities as percentages (56 = 56 %)
    const lux = b.l;
    const baro = b.b/10;
    //console.log(baro);
    const sensorId = parseInt(b.s,10);   
    let heater = b.he; // comma separated list of heater ratios as percentages (56 = 56 %)
    const folds = b.f;
    
    const address = request.connection.remoteAddress;
    
    Sensors.addSensor(sensorId); // Sensors method checks and prevents duplicate entries
    //Sensors.response(sensorId); 
    
    const message = '' + Sensors.response(sensorId);
    
    response.send(message); // return immediately sensor fold control data
    
    let sql_query = "";
    
    const temps = temp.split(",");
    
    for (let i=0;i<temps.length;i++)
    {
      //console.log(temps[i]/10);
      sql_query = "INSERT INTO temperature (id,unixtime,date,sensorId,tempId,temperature) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")," + sensorId + "," + i + "," + temps[i]/10 + ")";
      con.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        })
    }
    
    const humids = humid.split(",");
    
    for (let i=0;i<humids.length;i++)
    {
      sql_query = "INSERT INTO humidity (id,unixtime,date,sensorId,humidId,humidity) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")," + sensorId + "," + i + "," + humids[i] + ")";
      con.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        })
      //console.log(humids[i]);
    }
    
    sql_query = "INSERT INTO illuminance (id,unixtime,date,sensorId,lux) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")," + sensorId + "," + lux + ")";
   con.query(sql_query, (err, result) => {
   if (err) console.log(JSON.stringify(err))
   const json = JSON.stringify(result)
   })
   
   if (baro > 0)
   {
      sql_query = "INSERT INTO barometry (id,unixtime,date,sensorId,barometric) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")," + sensorId + "," + baro + ")";
     con.query(sql_query, (err, result) => {
     if (err) console.log(JSON.stringify(err))
     const json = JSON.stringify(result)
     })
   }
    
    const heaters = heater.split(",");
    
    for (let i=0;i<heaters.length;i++)
    {
	//console.log("heaters[i] = " + heaters[i]);
	if (heaters[i] != "")
	{

		sql_query = "INSERT INTO heater (id,unixtime,date,sensorId,heaterId,heaterRatio) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")," +     sensorId + "," + i + "," + heaters[i]/100 + ")";
	      con.query(sql_query, (err, result) => {
		if (err) console.log(JSON.stringify(err))
		const json = JSON.stringify(result)
		})
	      //console.log(heaters[i]/100);
	}
    }
    
    const controlText = ["NoFold","Auto","Manual","Timer"];
    const statusText = ["Closed","Qclose","Middle","Qopen","Open"];
    
    const control = controlText[Math.floor(folds/10)];
    const status = statusText[folds - ((Math.floor(folds/10) * 10))];
    
    //console.log("control: " + control + " - status: " + status);
    
    sql_query = "INSERT INTO folds (id,unixtime,date,sensorId,foldId,foldControl,foldStatus) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")," + sensorId + ",0,'" + control + "','" + status + "')";
   con.query(sql_query, (err, result) => {
   if (err) console.log(JSON.stringify(err))
   const json = JSON.stringify(result)
   })   
   
   const logText = date_stamp + " /post4.1 " + address + " s=" + b.s +" t=" + b.t + " hu=" + b.hu + " baro=" + b.b + " l=" + b.l + " he=" + b.he + " f=" + b.f + " response: " + message;
    console.log(logText); 
      
})

app.post('/updateFolds', urlencodedParser, (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");
    const b = request.body;
    //console.log(b);
    const sensorId = b.sensorId;
    const control = b.control;
    const status = b.status;
    
    const controlTexts = ["NoFold","Auto","Manual","Timer"];
    const statusTexts = ["Closed","Qopen","Middle","Qclose","Open"]

    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
    //	console.log(time_stamp);
    //	console.log(date_stamp);
    const sql_query = "INSERT INTO foldsControl (id,unixtime,date,sensorId,setControl,setStatus,setControlText,setStatusText) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")," + sensorId + "," + control + "," + status + ",'" + controlTexts[control] + "','" + statusTexts[status] + "')";
    // console.log(sql_query);
con.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        const logText = date_stamp + " /updateFolds " + request.connection.remoteAddress + ": sensorId=" + sensorId + " control=" + control + " status=" + status;
    console.log(logText);
    
    Sensors.updateFolds(sensorId,control,status);
        //response.send(json)
	response.send('OK');
    })
  // response.send('alex on paras');
})

app.get('/sensor/:id', (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");
    const id = request.params.id;

    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
	//console.log(time_stamp);
	//console.log(date_stamp);

	const logText = date_stamp + " sensor/" + id + " " + request.connection.remoteAddress;
	console.log(logText);

   const sql_query = "SELECT * FROM (SELECT * FROM test2 WHERE sensorId=" + id + " ORDER BY id DESC LIMIT 100) sub ORDER BY id DESC;";
   //console.log(sql_query);
con.query(sql_query, (err, data) => {
        if (err) console.log(err)

	//console.table(data.recordset);
        //response.send(data);

	let str = "<table><tr><th>Aika</th><th>Lämpö</th><th>Kosteus</th><th>Ilmanpaine</th><th>Valoisuus</th><th>Lämmitys</th></tr>";
	let row = "";
	for (let j=0;j<data.length;j++)
	{
		row = row + "<tr><td>" + data[j].date + "</td><td>" + data[j].temp + "</td><td>" + data[j].humid + "</td><td>" + data[j].baro + "</td><td>" + data[j].lux + "</td><td>" + data[j].heaterRatio + "</td></tr>";
	}
	str = str + row + "</table>";

	response.send(str);

    })
  // response.send('alex on paras');
})

app.get('/ElectricityUsage/tenSeconds', (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");

    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
	//console.log(time_stamp);
	//console.log(date_stamp);

	const logText = date_stamp + " ElectricityUsage/tenSeconds " + request.connection.remoteAddress;
	console.log(logText);

   const sql_query = "SELECT * FROM ElectricityPulses ORDER BY unixtime DESC LIMIT 300;";
   //console.log(sql_query);
con.query(sql_query, (err, data) => {
        if (err) console.log(err)

	//console.table(data.recordset);
        //response.send(data);

	let str = "<table><tr><th>Aika</th><th>Teho [kW]</th><th>Energia [kWh]</th><th>Pulssit</th></tr>";
	let row = "";
	for (let j=0;j<data.length;j++)
	{
		row = row + "<tr><td>" + data[j].date + "</td><td>" + data[j].outage_kW + "</td><td>" + data[j].energy_kWh + "</td><td>" + data[j].pulses + "</td></tr>";
	}
	str = str + row + "</table>";

	response.send(str);

    })
  // response.send('alex on paras');
})

app.get('/ElectricityUsage/tenMinutes', (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");

    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
	//console.log(time_stamp);
	//console.log(date_stamp);

	const logText = date_stamp + " ElectricityUsage/tenMinutes " + request.connection.remoteAddress;
	console.log(logText);

   const sql_query = "select FROM_UNIXTIME(a.utime) as date,SUM(kWh) as energy_kWh,SUM(kWh)*3.6/0.600 as outage_kW from (select floor(e.unixtime/600)*600 as utime,e.energy_kWh as kWh,e.outage_kW as kW from ElectricityPulses e) as a group by a.utime order by a.utime desc limit 300;";
   //console.log(sql_query);
con.query(sql_query, (err, data) => {
        if (err) console.log(err)

	//console.table(data.recordset);
        //response.send(data);

	let str = "<table><tr><th>Aika</th><th>Teho [kW]</th><th>Energia [kWh]</th></tr>";
	let row = "";
	for (let j=0;j<data.length;j++)
	{
		row = row + "<tr><td>" + data[j].date + "</td><td>" + data[j].outage_kW + "</td><td>" + data[j].energy_kWh + "</td></tr>";
	}
	str = str + row + "</table>";

	response.send(str);

    })
  // response.send('alex on paras');
})

app.get('/ElectricityUsage/day', (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");

    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
	//console.log(time_stamp);
	//console.log(date_stamp);

	const logText = date_stamp + " ElectricityUsage/day " + request.connection.remoteAddress;
	console.log(logText);

   //const sql_query = "select FROM_UNIXTIME((a.utime + TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP))) as date,SUM(kWh) as energy_kWh,SUM(kWh)/24 as outage_kW from (select floor((e.unixtime + TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP))/(3600*24))*(3600*24) as utime,e.energy_kWh as kWh,e.outage_kW as kW from ElectricityPulses e) as a group by a.utime order by a.utime desc limit 31;";
   const sql_query = "select FROM_UNIXTIME(a.utime + TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP)) as date,SUM(kWh) as energy_kWh,SUM(kWh)/24 as outage_kW from (select floor((e.unixtime - TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP))/(3600*24))*(3600*24) as utime,e.energy_kWh as kWh,e.outage_kW as kW from ElectricityPulses e) as a group by a.utime order by a.utime desc limit 31;";
//console.log(sql_query)
con.query(sql_query, (err, data) => {
        if (err) console.log(err)

	//console.table(data.recordset);
        //response.send(data);

	let str = "<table><tr><th>Aika</th><th>Teho [kW]</th><th>Energia [kWh]</th></tr>";
	let row = "";
	for (let j=0;j<data.length;j++)
	{
		row = row + "<tr><td>" + data[j].date + "</td><td>" + data[j].outage_kW + "</td><td>" + data[j].energy_kWh + "</td></tr>";
	}
	str = str + row + "</table>";

	response.send(str);

    })
  // response.send('alex on paras');
})


app.get('/ElectricityUsage/hour', (request, response) => {
 //  con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL," + user_hash + ")"");
   //con.query("INSERT INTO Kuluttajat (id,id_hash) VALUES (NULL,'abcdefghijklmnop')");

    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
	//console.log(time_stamp);
	//console.log(date_stamp);

	const logText = date_stamp + " ElectricityUsage/hour " + request.connection.remoteAddress;
	console.log(logText);

   const sql_query = "select FROM_UNIXTIME(a.utime) as date,SUM(kWh) as energy_kWh,SUM(kWh) as outage_kW from (select floor(e.unixtime/3600)*3600 as utime,e.energy_kWh as kWh,e.outage_kW as kW from ElectricityPulses e) as a group by a.utime order by a.utime desc limit 720;";
   //console.log(sql_query);
con.query(sql_query, (err, data) => {
        if (err) console.log(err)

	//console.table(data.recordset);
        //response.send(data);

	let str = "<table><tr><th>Aika</th><th>Teho [kW]</th><th>Energia [kWh]</th></tr>";
	let row = "";
	for (let j=0;j<data.length;j++)
	{
		row = row + "<tr><td>" + data[j].date + "</td><td>" + data[j].outage_kW + "</td><td>" + data[j].energy_kWh + "</td></tr>";
	}
	str = str + row + "</table>";

	response.send(str);

    })
  // response.send('alex on paras');
})



app.post('/post2', (request, response) => {
    const b = request.body
    const time_stamp = Date.now();
    const date_stamp = new Date();
	console.log(time_stamp);
	console.log(date_stamp);
    const sql_query = `INSERT INTO test2 (
            id,time,temp,humid,baro,lux,sensorId,date
            ) VALUES (
            "NULL",$time_stamp / 1000,${b.temp/10}, ${b.humid},${b.baro/10}, ${b.lux}, ${b.sensorId},"${date_stamp}
            );`
    sql.query(sql_query, (err, result) => {
        if (err) console.log(JSON.stringify(err))
        const json = JSON.stringify(result)
        response.send(json)
    })
})

app.post('/Ventilator', urlencodedParser, (request, response) => {
const b = request.body;
	var list = b.list;
    /* list order
    freshCoolTemp	
    freshCoolHumid
    usedWarmTemp
    usedWarmHumid
    freshWarmTemp
    freshWarmHumid
    usedCoolTemp
    usedCoolHumid
    freshCoolEnthalpy
    usedWarmEnthalpy
    freshWarmEnthalpy
    usedCoolEnthalpy
    condensedVapor_g
    actualExchangeCoef
    predictedExchangeCoef
    predictedFreshWarmTemp
    predictedFreshWarmHumid
    predictedUsedCoolTemp
    predictedUsedCoolHumid
    heater
    */
    //let list = "52,85,234,22,176,23,128,45,3175,3458,3309,3289,12,47,52,194,21,117,51,1,0";
    let divisors = [10,1,10,1,10,1,10,1,10,10,10,10,10,100,100,10,1,10,1,1,1];
    //console.log(request.connection.remoteAddress);
    const time_stamp = Math.round(Date.now() / 1000);
    const date_stamp = new Date();
	//console.log("Try /Ventilator");   
	//console.log(list);
    let chars = 0;
    let number = 0;
    let insertValues = "";
    let number2 = 1.5;
    let i = 0;

    while (list.search(",") > -1 && i < 21)
    {
	//console.log(list);
        chars = list.search(",");
        if (chars < 0)
        {
            chars = list.length;
        }
        number = parseInt(list.substring(0,chars));
	number2 = number / divisors[i];
	//console.log(number2);

	insertValues = insertValues + "," + number2;
	list = list.substring(chars+1);
	i++;
    }

    let sql_query = "INSERT INTO Ventilator (id,unixtime,date,freshCoolTemp,freshCoolHumid,usedWarmTemp,usedWarmHumid,freshWarmTemp,freshWarmHumid,usedCoolTemp,usedCoolHumid,freshCoolEnthalpy,usedWarmEnthalpy,freshWarmEnthalpy,usedCoolEnthalpy,condensedVapor_g,actualExchangeCoef,predictedExchangeCoef,predictedFreshWarmTemp,predictedFreshWarmHumid,predictedUsedCoolTemp,predictedUsedCoolHumid,heater) VALUES (NULL," + time_stamp + ",FROM_UNIXTIME(" + time_stamp + ")" + insertValues + ")";
    //console.log(sql_query);

    //try {
	con.query(sql_query, (err, result) => {
        	if (err) 
		{
			console.log(JSON.stringify(err));
			console.log(JSON.stringify(err));
		}
		else
		{
		const json = JSON.stringify(result)
		const logText = date_stamp + " /Ventilator " + request.connection.remoteAddress + " " + insertValues;
		console.log(logText);
        	response.send("OK");
		}
		
    	})
	//response.send(json)
   // } catch (error) {
//	response.send('ERROR');
  //  }
})


var server = app.listen(8100, function () {
   var host = '192.168.1.127';
   var port = '8100';

   console.log("Example app listening at http://%s:%s", host, port)
})

