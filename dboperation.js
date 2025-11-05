var config = require('./dbconfig')
const sql = require('mssql');
const e = require('express');
const connection = require('./dbconfig_mysql');
const moment = require('moment-timezone');
const DBNAME = '[neoncmsprod]';


async function searchCustomerName(id) {
    const query = `SELECT TOP 100 [Number],[PreferredName],[Gender] FROM ${DBNAME}.[dbo].[Customer] Where dbo.customer.PreferredName like '%${id}%' ORDER BY [dbo].[Customer].[Number] ASC`;
    try {
        let pool = await sql.connect(config)
        // console.log(`connection was established_getPointByID`);
        let points = await pool.request().query(`${query}`);
        return points.recordset;
    } catch (error) {
        console.log(`An error orcur get customer name by keyword: ${error}`);
    }
}

async function getUserRegisterDates(dateStart, dateEnd) {
    const query = `
    SELECT dbo.Customer.Number as number
          ,[Surname] as surname
          ,[Forename] as forename
          ,[MiddleName] as middle_name
          ,[Title] as title
          ,[PreferredName] as preferred_name
          ,[Gender] as gender
          ,[DateOfBirth]  as date_of_birth
          ,dbo.CustomerCard.TrackData  as card_number
         ,dbo.CustomerImage.ImageDataID as picture
         ,0 as 'loyalty_balance'
         ,0.0 as 'cashless_balance'
         ,dbo.customer.[MembershipTypeID]
         ,dbo.MembershipType.Name as 'membership_short_code'
         ,dbo.MembershipType.Colour as 'colour'
          ,dbo.MembershipType.Colour as 'colour_html'
          ,[GamingDateRegistered] as gaming_date_register
          ,[DateTimeRegistered] as datime_time_register

         ,dbo.customer.[PlayerTierID]
         ,dbo.PlayerTier.Name as 'player_tier_name'
         ,dbo.PlayerTier.Name as 'player_tier_short_code'
         ,dbo.Playertier.Colour as 'Player Tier Colour'
          ,[PremiumPlayer] as premium_player
          ,[PremiumPlayerStatus] as premium_player_status
           ,[MembershipExpiryDate] as membership_last_issue_date
           ,'#0080FF' as 'comp_status_colour'
	,'#0080FF' as 'comp_status_colour_html'
	,0 as freeplay_balance
	,0 as has_online_account
	,0 as hide_comp_balance

      FROM ${DBNAME}.[dbo].[Customer]

      Join dbo.CustomerCard
      on dbo.CustomerCard.CustomerID=dbo.Customer.CustomerID
      Join dbo.CustomerImage
      on dbo.CustomerImage.CustomerID=dbo.customer.CustomerID

      Join dbo.MembershipType
      on dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID
      Join dbo.PlayerTier
      on dbo.Customer.PlayerTierID=dbo.PlayerTier.PlayerTierID

      Where dbo.Customer.GamingDateRegistered between @input_dateStart and @input_dateEnd  ORDER BY  dbo.Customer.GamingDateRegistered  DESC`;
    let status = false;
    let message = "can not get user for this date range";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_dateStart', sql.NVarChar, dateStart).input('input_dateEnd', sql.NVarChar, dateEnd).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get new user register list from date range success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)
            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get user list for this date range: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }
}
async function getUserRegisterDate(date) {
    const query = `SELECT [CustomerID], [Number],[Title], [PreferredName],[Gender],[GamingDateRegistered],[DateTimeRegistered],[MobilePhone],[EmailAddress] FROM ${DBNAME}.[dbo].[Customer]
    Where GamingDateRegistered=@input_date`;
    let status = false;
    let message = "can not get user for this date";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_date', sql.NVarChar, date).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get new user register list success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)

            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get user list for this date: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }

}



async function getMachinePlayer(date, customer_number) {
    const query = `SELECT [MachinePlayerSessionID]
      ,dbo.customer.Number as 'Customer_Number'
      ,dbo.machine.Number as 'Machine_Number'
      ,dbo.gametype.Name as 'Game'
      ,[StartDateTime]
      ,[EndDateTime]
      ,[Buyin]
      ,[CoinOut]
      ,[GamesPlayed]
      ,[Jackpots]
  FROM ${DBNAME}.[dbo].[MachinePlayerSession]
  join dbo.Customer
  on dbo.customer.CustomerID=dbo.MachinePlayerSession.CustomerID
  join dbo.Machine
  on dbo.machine.MachineID=dbo.MachinePlayerSession.MachineID
  join dbo.GameType
  on dbo.GameType.GameTypeID=dbo.MachinePlayerSession.GameTypeID
  Where dbo.customer.Number=@input_number
  and dbo.MachinePlayerSession.StartGamingDate=@input_date`;
    let status = false;
    let message = "can not get machine player list";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_date', sql.NVarChar, date).input('input_number', sql.Int, customer_number).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get machine player list success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)

            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get machine player list: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }
}
async function getMachinePlayerByMachineNum(date, machine_number) {
    const query = `SELECT [MachinePlayerSessionID]
    ,dbo.customer.Number as 'Customer_Number'
    ,dbo.machine.Number as 'Machine_Number'
    ,dbo.gametype.Name as 'Game'
    ,[StartDateTime]
    ,[EndDateTime]
    ,[Buyin]
    ,[CoinOut]
    ,[GamesPlayed]
    ,[Jackpots]
FROM [neoncmsprod].[dbo].[MachinePlayerSession]
join dbo.Customer
on dbo.customer.CustomerID=dbo.MachinePlayerSession.CustomerID
join dbo.Machine
on dbo.machine.MachineID=dbo.MachinePlayerSession.MachineID
join dbo.GameType
on dbo.GameType.GameTypeID=dbo.MachinePlayerSession.GameTypeID
Where dbo.Machine.number = @input_number and dbo.MachinePlayerSession.StartGamingDate=@input_date ORDER BY [StartDateTime] DESC`;
    let status = false;
    let message = "can not get machine player by machine number ";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_date', sql.NVarChar, date).input('input_number', sql.Int, machine_number).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get machine player by MC number list success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)

            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get machine player by MC number list: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }
}

async function getJackPotHistory(startDate, endDate) {
    const query = `SELECT [JackpotOccurrenceID]
    ,dbo.jackpot.JackpotID
    ,dbo.Jackpot.Name
    ,[HitGamingDate]
    ,[HitDateTime]
    ,dbo.machine.Number as 'Machine_Number'
    ,dbo.MachineGameTheme.Name as 'Game_Theme'
    ,[AmountPaidOut],[MinimumHitValue]
FROM ${DBNAME}.[dbo].[JackpotOccurrence]
Join dbo.Jackpot
on dbo.Jackpot.JackpotID=dbo.JackpotOccurrence.JackpotID
Join dbo.Customer
on dbo.customer.CustomerID=dbo.JackpotOccurrence.CustomerID
Join dbo.Machine
on dbo.Machine.MachineID=dbo.JackpotOccurrence.MachineID
Join dbo.MachineGameTheme
on dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
Where HitGamingDate between @input_startDate and @input_endDate AND dbo.jackpot.JackpotID > 0 AND dbo.Jackpot.JackpotID != 41 ORDER BY dbo.JackpotOccurrence.HitDateTime DESC`;
let status = false;
let message = "can not get jackpot history";
let data = null;
try {
    let pool = await sql.connect(config);
    let jackpot = await pool.request().input('input_startDate', sql.NVarChar, startDate).input('input_endDate', sql.NVarChar, endDate).query(query)

    if (jackpot.recordset.length > 0) {
        data = jackpot.recordset.map(record => {
            if (record.JackpotID === 44) {
                return { ...record, JackpotID: 46, Name: "Monthly" }; //every item have jpID = 44 change to 46
            }
            return record;
        });
        status = true;
        message = `get jackpot history success, ${jackpot.recordset.length} results`;
        let map = {
            "status": status,
            "message": message,
            "data": data,
        };
        return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
} catch (error) {
    console.log(`An error orcur getJackPotHistory: ${error}`)
    let map = {
        "status": false,
        "message": 'can not get jackpot history or an input error type',
        "data": null,
    }
    return map;
}
}

//jackpot history floor

async function getJackPotHistoryFloor(startDate, endDate) {
    const query = `SELECT
        [JackpotOccurrenceID]
        ,dbo.jackpot.JackpotID
        ,dbo.Jackpot.Name
        ,[HitGamingDate]
        ,[HitDateTime]
        ,dbo.machine.Number as 'Machine_Number'
        ,dbo.MachineGameTheme.Name as 'Game_Theme'

        ,[AmountPaidOut]
        ,[MinimumHitValue]
        ,CASE
            WHEN dbo.Location.Name IN ('Roulette', 'Slots', 'Tables 2', 'Tables BAC', 'Tables BJ')
                THEN 1
            WHEN dbo.Location.Name IN ('Roulette 2', 'Slot 2', 'Slots 2')
                THEN 2
            ELSE 0
         END as 'floorId'
    FROM ${DBNAME}.[dbo].[JackpotOccurrence]
    JOIN dbo.Jackpot
        ON dbo.Jackpot.JackpotID = dbo.JackpotOccurrence.JackpotID
    JOIN dbo.Customer
        ON dbo.customer.CustomerID = dbo.JackpotOccurrence.CustomerID
    JOIN dbo.Machine
        ON dbo.Machine.MachineID = dbo.JackpotOccurrence.MachineID
    JOIN dbo.MachineGameTheme
        ON dbo.machine.MachineGameThemeID = dbo.MachineGameTheme.MachineGameThemeID
    JOIN dbo.Location
        ON dbo.machine.AreaLocationID = dbo.Location.LocationID
    WHERE HitGamingDate BETWEEN @input_startDate AND @input_endDate
        AND dbo.jackpot.JackpotID > 0
        AND dbo.Jackpot.JackpotID != 41
    ORDER BY dbo.JackpotOccurrence.HitDateTime DESC`;

    let status = false;
    let message = "can not get jackpot history";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let jackpot = await pool.request()
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .query(query);

        if (jackpot.recordset.length > 0) {
            data = jackpot.recordset;
            status = true;
            message = `get jackpot history success,${jackpot.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            };
            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            };
            return map;
        }
    } catch (error) {
        console.log(`An error occurred in getJackPotHistoryFloor: ${error}`);
        let map = {
            "status": false,
            "message": 'can not get jackpot history or an input error type',
            "data": null,
        };
        return map;
    }
}
//end jackpotHistory Floor


async function getJackPotHistoryID(startDate, endDate, id) {
    const query = `SELECT [JackpotOccurrenceID]
    ,dbo.jackpot.JackpotID
    ,dbo.Jackpot.Name
    ,[HitGamingDate]
    ,[HitDateTime]
    ,dbo.machine.Number as 'Machine_Number'
    ,dbo.MachineGameTheme.Name as 'Game_Theme'
    ,[AmountPaidOut],[MinimumHitValue]
    FROM ${DBNAME}.[dbo].[JackpotOccurrence]
    Join dbo.Jackpot
    on dbo.Jackpot.JackpotID=dbo.JackpotOccurrence.JackpotID
    Join dbo.Customer
    on dbo.customer.CustomerID=dbo.JackpotOccurrence.CustomerID
    Join dbo.Machine
    on dbo.Machine.MachineID=dbo.JackpotOccurrence.MachineID
    Join dbo.MachineGameTheme
    on dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
    Where HitGamingDate between @input_startDate
    and @input_endDate AND dbo.jackpot.JackpotID > 0
    AND dbo.Jackpot.JackpotID = @input_id
    ORDER BY dbo.JackpotOccurrence.HitDateTime DESC`;

    let status = false;
    let message = "can not get jackpot history";
    let data = null;

    try {
        let pool = await sql.connect(config);
        let jackpot = await pool.request()
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .input('input_id', sql.NVarChar, id)
            .query(query);

        // If no data and id is 44 or 46, try the alternative JackpotID
        if (jackpot.recordset.length === 0 && (id === "44" || id === "46")) {
            const fallbackId = id === "44" ? "46" : "44";
            jackpot = await pool.request()
                .input('input_startDate', sql.NVarChar, startDate)
                .input('input_endDate', sql.NVarChar, endDate)
                .input('input_id', sql.NVarChar, fallbackId)
                .query(query);
        }

        if (jackpot.recordset.length > 0) {
            data = jackpot.recordset.map(record => {
                if (record.JackpotID === 44) {
                    return { ...record, JackpotID: 46, Name: "Monthly" };
                }
                if (record.JackpotID === 46) {
                    return { ...record, Name: "Monthly" };
                }
                return record;
            });
            status = true;
            message = `get jackpot history by id success, ${jackpot.recordset.length} results`;
        }

        let map = {
            "status": status,
            "message": message,
            "data": data,
        };
        return map;
    } catch (error) {
        console.log(`An error occurred in getJackPotHistoryID: ${error}`);
        let map = {
            "status": false,
            "message": "can not get jackpot history or an input error type",
            "data": null,
        };
        return map;
    }
}

//FACE RECOGINZIE
async function getFaceRecognizeToday(date) {
  const query = `
    SELECT
      c.CustomerID,
      c.Number,
      c.PreferredName,
      c.Gender,
      c.DateOfBirth,
      c.GamingDateLastVisited,
      v.ActualDateTime
    FROM dbo.Customer c
    JOIN dbo.Visit v ON v.CustomerID = c.CustomerID
    WHERE v.GamingDate = @input_date
  `;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('input_date', sql.Date, date)
      .query(query);

    const records = result.recordset;

    return {
      status: records.length > 0,
      message: records.length > 0
        ? `Retrieved ${records.length} face recognition visits.`
        : `No face recognition visits found.`,
      data: records,
    };
  } catch (error) {
    console.error(`Error in getFaceRecognizeToday: ${error}`);
    return {
      status: false,
      message: 'Failed to fetch data due to an error.',
      data: null,
    };
  }
}






//GET CUSTOMER INFO W HOST
async function getCustomerWHost(customer_number) {
  const query = `
    SELECT
        c.[CustomerID],
        c.[Number],
        c.[PreferredName],
        cf.CustomFieldID,
        cf.Value,
        cfv.Value AS [HostBy]
    FROM ${DBNAME}.[dbo].[Customer] c
    JOIN dbo.CustomerField cf
        ON cf.CustomerID = c.CustomerID
    JOIN dbo.CustomFieldValue cfv
        ON cf.Value = cfv.CustomFieldValueID
    WHERE cf.CustomFieldID = 4
      AND c.Number = @customer_number
  `;
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("customer_number", sql.Int, customer_number) // safe parameter binding
      .query(query);
    const records = result.recordset;
    return {
      status: records.length > 0,
      message: records.length > 0
        ? `Retrieved ${records.length} customer info with hostname.`
        : `No data found for number ${customer_number}.`,
      data: records,
    };
  } catch (error) {
    console.error(`Error in getCustomerWHost: ${error}`);
    return {
      status: false,
      message: "Failed to fetch data due to an error.",
      data: null,
    };
  }
}
//END GET CUSTOMER INFO W HOST



//Face Recoginize Version 2
async function getFaceRecognizeFull(page = 1, limit = 50, number = null) {
  const offset = (page - 1) * limit;

  // Base query
  let query = `
    SELECT
      c.[CustomerID],
      c.[Number],
      c.[PreferredName],
      c.[Gender],
      c.[DateOfBirth],
      c.[CountryID],
      co.[Nationality],
      co.ISOCode,
      c.[GamingDateLastVisited],
      v.[ActualDateTime]
    FROM ${DBNAME}.[dbo].[Customer] c
    JOIN dbo.Country co ON co.CountryID = c.CountryID
    JOIN dbo.Visit v ON v.CustomerID = c.CustomerID
    WHERE v.GamingDate = c.GamingDateLastVisited
  `;

  // Add filter if `number` is given
  if (number) {
    query += ` AND c.[Number] = ${number} `;
  }

  // Order + Pagination
  query += `
    ORDER BY v.ActualDateTime DESC
    OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
  `;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    const records = result.recordset;

    return {
      status: records.length > 0,
      message: records.length > 0
        ? `Retrieved ${records.length} face recognition data.`
        : `No face recognition data found.`,
      data: records,
    };
  } catch (error) {
    console.error(`Error in getFaceRecognizeFull: ${error}`);
    return {
      status: false,
      message: 'Failed to fetch data due to an error.',
      data: null,
    };
  }
}
//END FACE RECOGNIZE






// GAMING SESSION QUERY (ALL DATA)
async function getGamingSessionToday(date) {
    const query = `
        SELECT
		  dbo.customer.Number,
		  dbo.Machine.Number as MachineNumber,
		  [StartGamingDate],
		  dbo.MachinePlayerSession.StartDateTime,
		  dbo.machineplayersession.EndDateTime,
		  [EndDateTime],
		  dbo.machineplayersession.[Status]
	FROM [neoncmsprod].[dbo].[MachinePlayerSession]
    Join dbo.Machine
    On dbo.machine.MachineID=dbo.MachinePlayerSession.MachineID
    Join dbo.Customer
    On dbo.customer.CustomerID=dbo.MachinePlayerSession.CustomerID
	Where StartGamingDate= @input_date
    `;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('input_date', sql.Date, date)
            .query(query);
        const records = result.recordset;
        return {
            status: records.length > 0,
            message: records.length > 0
                ? `Retrieved ${records.length} gaming session record(s).`
                : `No gaming session data found.`,
            data: records,
        };
    } catch (error) {
        console.error(`Error in getGamingSessionToday: ${error}`);
        return {
            status: false,
            message: 'Failed to fetch data due to an error.',
            data: null,
        };
    }
}
//END GAMING SESSION TODAY



//MACHINE ONLINE STATUS FLOOR 2
async function getMachineOnlineStatusFloor2(date) {
    try {
    let pool = await sql.connect(config)
    let query = `SELECT dbo.Machine.Number, dbo.machineplayersession.[Status] FROM ${DBNAME}.[dbo].[MachinePlayerSession] Join dbo.Machine
        On dbo.machine.MachineID=dbo.MachinePlayerSession.MachineID
        Where dbo.machineplayersession.Status='1'
        And dbo.machine.number IN ('2002','2003','2023')
        And StartGamingDate=@input_id`;
    const data_query = await pool.request().input('input_id', sql.NVarChar, date).query(`${query}`)
    return data_query.recordset;
    } catch (error) {
        console.log(`An error orcur getMachineOnlineStatus: ${error}`);
    }
}
//END MACHINE ONLINE STATUS FLOOR 2



async function getPointUser(id) {
    const query = `SELECT dbo.customer.[CustomerID]
          ,[PreferredName]
          ,dbo.CustomerAccount.DisplayBalance
          ,dbo.customeraccount.AccountType
      FROM ${DBNAME}.[dbo].[Customer]
      Join dbo.CustomerAccount
      on dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID
      Where Number=@input_id`;
    try {
        let pool = await sql.connect(config);
        let points = await pool.request().input('input_id', sql.Int, id).query(query)

        let status = false;
        let name = null;
        let number = null;
        let current_point = 0;
        let comp_point = 0;
        let casshlet_credit = 0;
        let fortune_credit = 0
        let message = "An error orcur or can not get the data";

        for (let i = 0; i < points.recordset.length; i++) {
            // console.log(points.recordset[i]['PreferredName']);
            // console.log(points.recordset[i]['CustomerID']);
            // console.log(points.recordset[i]['DisplayBalance']);
            // console.log(points.recordset[i]['AccountType']);

            number = points.recordset[i]['CustomerID'];
            name = points.recordset[i]['PreferredName'];
            if (name != null && number != null) {
                status = true;
                message = "get points success"
            } else {
                status = false;
            }
            if (points.recordset[i]['PreferredName'] != null) {
                name == points.recordset[i]['PreferredName'];
            }
            if (points.recordset[i]['AccountType'] == 1) {
                current_point = points.recordset[i]['DisplayBalance'];
            } if (points.recordset[i]['AccountType'] == 2) {
                comp_point = points.recordset[i]['DisplayBalance'];
            } if (points.recordset[i]['AccountType'] == 3) {
                casshlet_credit = points.recordset[i]['DisplayBalance'];
            } if (points.recordset[i]['AccountType'] == 4) {
                fortune_credit = points.recordset[i]['DisplayBalance'];
            }
        }

        let map = {
            "status": status,
            "message": message,
            "data": {
                "PreferredName": name,
                "CustomerNumber": number,
                "Current_Point": current_point,
                "Comp_Point": comp_point,
                "Casshless_Credit": casshlet_credit,
                "Fortune_Credit": fortune_credit,
            }
        }
        return map;
    } catch (error) {
        console.log(`An error orcur getPointUser: ${error}`);
        let map = {
            "status": false,
            "message": 'an error orcur or input error',
            "data": null
        }
        return map;
    }
}

async function getPointsByDates(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
    try {
        let pool = await sql.connect(config)
        const querybyDates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Type]
      ,[PlayerTransactionID]
      ,[LastUpdatedByUserID]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]

  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID

  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID

  Where dbo.CustomerCard.TrackData=@input_id and dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;

        const queryAll = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Type]
      ,[PlayerTransactionID]
      ,[LastUpdatedByUserID]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]

  FROM [neoncmsprod].[dbo].[PointTransaction]

  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID

  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID

  Where dbo.CustomerCard.TrackData=@input_id`;

        const queryCurrentPoint = `SELECT dbo.customer.[CustomerID]
      ,dbo.customer.[Number]
     ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[Title]
      ,[PreferredName]
     ,dbo.CustomerAccount.DisplayBalance as 'Current_Point'

  FROM [neoncmsprod].[dbo].[Customer]

  Join dbo.CustomerAccount
  On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID

  Join dbo.CustomerCard
  On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID

  Where dbo.CustomerCard.TrackData=@input_id
  And dbo.CustomerAccount.AccountType=1`;

        console.log(`connection was established getPointsByDates`);


        const points = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querybyDates}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const points_week = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, startDateWeek)
            .input('input_endDate', sql.NVarChar, endDateWeek)
            .query(`${querybyDates}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const points_month = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, startDateMonth)
            .input('input_endDate', sql.NVarChar, endDateMonth)
            .query(`${querybyDates}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const pointAll = await pool.request()
            .input('input_id', sql.Int, id)
            .query(`${queryAll}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const point_current = await pool.request()
            .input('input_id', sql.Int, id)
            .query(`${queryCurrentPoint}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        let totalPoint_today = 0;
        let totalPoint_Week = 0;
        let totalPoint_Month = 0;
        let totalPoint_All = 0;
        let totalPoint_current = 0;

        let name = "";
        let number = 0;
        let dateTime = new Date();

        for (let i = 0; i < points.recordset.length; i++) {
            dateTime = new Date(points.recordset[i]['EntryDateTime'])
            //let d1 = new Date(`${dateToday}T06:00:00`);
            //let d2 = new Date(`${dateToday2}T06:00:00`);
            let dateData = ConvertDateFromClient(dateToday, dateToday2);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            // console.log(`${dateTime} ${d1} ${d2}`);
            if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                }
            }

        }
        for (let i = 0; i < points_week.recordset.length; i++) {

            dateTime = new Date(points_week.recordset[i]['EntryDateTime'])
            //let d1 = new Date(`${startDateWeek}T06:00:00`);
            //let d2 = new Date(`${endDateWeek}T06:00:00`);
            let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            //console.log(`${dateTime} ${d1} ${d2}`);
            if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
                }
            }

        }
        for (let i = 0; i < points_month.recordset.length; i++) {
            dateTime = new Date(points_month.recordset[i]['EntryDateTime'])
            // let d1 = new Date(`${startDateMonth}T06:00:00`);
            //let d2 = new Date(`${endDateMonth}T06:00:00`);
            let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            // console.log(`${dateTime} ${d1} ${d2}`);

            if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
                }
            }

        }
        for (let i = 0; i < pointAll.recordset.length; i++) {
            number = pointAll.recordset[0]['Number'];
            name = pointAll.recordset[0]['PreferredName'];
            if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
                totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
            }
        }
        totalPoint_current = point_current.recordset[0]['Current_Point'];
        // console.log(`current point: ${totalPoint_current}`);
        // console.log(`total point: ${totalPoint_today}  ${name} ${number}`);
        let status = false
        if (name != "" && number != 0) {
            status = true;
        }

        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints": totalPoint_All,
                "LoyaltyPoints_Current": totalPoint_current,
                "LoyaltyPoints_Today": totalPoint_today,
                "LoyaltyPoints_Week": totalPoint_Week,
                "LoyaltyPoints_Month": totalPoint_Month
            }
        }
        return map
        // return points.recordset;
    } catch (error) {
        console.log(`An error orcur getPointsByDates: ${error}`);
    }
}
async function getPointsByDatesRange(id, startDate, endDate) {
    try {
        let pool = await sql.connect(config)
        const querybyDates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.CustomerCardID as 'Customer Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Type]
      ,[PlayerTransactionID]
      ,[LastUpdatedByUserID]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]

  FROM ${DBNAME}.[dbo].[PointTransaction]

  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID

  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID

  Where dbo.CustomerCard.TrackData=@input_id
  And dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate  between @input_startDate and @input_endDate`;

        const points = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .query(`${querybyDates}`)

        let totalPoint_today = 0;
        let dateTime = new Date();
        let name = "";
        let number = 0;

        for (let i = 0; i < points.recordset.length; i++) {
            dateTime = new Date(points.recordset[i]['EntryDateTime'])
            //let d1 = new Date(`${startDate}T06:00:00`);
            //let d2 = new Date(`${endDate}T06:00:00`);
            let dateData = ConvertDateFromClient(startDate, endDate);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            // console.log(`${dateTime} ${d1} ${d2}`);
            if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                    name = points.recordset[0]['PreferredName'];
                    number = points.recordset[0]['Number'];
                }
            }

        }
        let status = false
        if (name != "" && number != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints_Frame": totalPoint_today,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointsByDatesRange: ${error}`);
    }
}
async function getPointByID(id) {
    try {
        let pool = await sql.connect(config)
        // console.log(`connection was established_getPointByID`);
        let points = await pool.request().query(`SELECT [PointTransactionID] ,dbo.Customer.PreferredName,dbo.Customer.Number,[GamingDate],[Type],[Comment] ,[LoyaltyPoints] FROM ${DBNAME}.[dbo].[PointTransaction] Join dbo.Customer On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID Where dbo.Customer.Number=${id}`)
        return points.recordset.reverse();
    } catch (error) {
        console.log(`An error orcur getPointByID: ${error}`);
    }
}
async function getCardNumberByID(id) {
    try {
        let pool = await sql.connect(config)
        // console.log(`connection was established_getPointByID`);
        let points = await pool.request().query(`SELECT TOP (1000)
        dbo.CustomerCard.CustomerID as CustomerID,[CustomerCardID],
        [Status]
        ,[IssueNumber]
        ,[TrackData]
        ,dbo.Customer.Number as Number

    FROM ${DBNAME}.[dbo].[CustomerCard]
    Join dbo.Customer
    on dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID
    where dbo.Customer.Number = ${id}`)
        for (let i = 0; i < points.recordset.length; i++) {
            if (points.recordset[i]['TrackData'].length >= 7) {
                // console.log(points.recordset[i]['TrackData'])
                return points.recordset;
            }
        }


    } catch (error) {
        console.log(`An error orcur getPointByID: ${error}`);
    }
}
//CARD TRACH DATA POINT CURRENT RL & TABLE


//CARD TRACK DATA
async function getPointCurrentByCardTrack(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
    try {
        let pool = await sql.connect(config)
        const queryC = `SELECT dbo.customer.[CustomerID]
 ,dbo.customer.[Number]
 ,dbo.CustomerCard.CustomerCardID as 'Customer_Card'
 ,[Title]
 ,[PreferredName]
 ,dbo.CustomerAccount.DisplayBalance as 'Current_Point'
  FROM ${DBNAME}.[dbo].[Customer]
  Join dbo.CustomerAccount
  On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID
  Join dbo.CustomerCard
  On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID
  Where dbo.CustomerCard.TrackData=@input_id
  And dbo.CustomerAccount.AccountType=1`;


        const querySlotDaily = `SELECT [PointTransactionID]
    ,dbo.PointTransaction.[CustomerID]
    ,dbo.Customer.Number
    ,dbo.CustomerCard.TrackData as 'Customer Card'
    ,dbo.PointTransaction.[GamingDate]
    ,dbo.PointTransaction.[EntryDateTime]
    ,dbo.PointTransaction.PlayerTransactionID
    ,dbo.GameType.GameTypeID
    ,dbo.Gametype.GameGroup
    ,dbo.GameType.Name
    ,[LoyaltyPoints]
FROM ${DBNAME}.[dbo].[PointTransaction]
join dbo.PlayerTransaction
on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
Join dbo.GameType
on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
join dbo.Customer
on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
join dbo.CustomerCard
on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
Where dbo.CustomerCard.TrackData=@input_id
And dbo.Gametype.GameGroup=2
And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
        const queryRLTBDaily = `SELECT [PointTransactionID]
        ,dbo.PointTransaction.[CustomerID]
        ,dbo.Customer.Number
        ,dbo.CustomerCard.TrackData as 'Customer Card'
        ,dbo.PointTransaction.[GamingDate]
        ,dbo.PointTransaction.[EntryDateTime]
         ,dbo.PointTransaction.PlayerTransactionID
         ,dbo.GameType.GameTypeID
        ,dbo.Gametype.GameGroup
        ,dbo.GameType.Name
        ,[LoyaltyPoints]
        FROM ${DBNAME}.[dbo].[PointTransaction]
        join dbo.PlayerTransaction
        on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
        Join dbo.GameType
        on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
        join dbo.Customer
        on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
        join dbo.CustomerCard
        on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
        Where dbo.CustomerCard.TrackData=@input_id
        And dbo.Gametype.GameGroup=3
        And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;

        const querybydates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
        FROM ${DBNAME}.[dbo].[PointTransaction]
        Join dbo.Customer
        On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
        Join dbo.CustomerCard
        on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
        Where dbo.CustomerCard.TrackData=@input_id
        and dbo.PointTransaction.Type=1
        and dbo.PointTransaction.GamingDate >= @input_startDate and dbo.PointTransaction.GamingDate <= @input_endDate`

        const queryall = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
      ,dbo.MembershipType.name as 'TierName'
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
      ,dbo.Customer.DateOfBirth
        FROM ${DBNAME}.[dbo].[PointTransaction]
        Join dbo.Customer
        On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
        Join dbo.MembershipType
        On dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID
        Join dbo.CustomerCard
        on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
        Where dbo.CustomerCard.TrackData=@input_id`
        const queryInfor = `SELECT TOP (1000)
dbo.customer.Number
,[PreferredName]
,[DateOfBirth]
,dbo.PlayerTier.Name as 'TierName'
FROM ${DBNAME}.[dbo].[Customer]
JOIN dbo.CustomerCard
on dbo.customer.CustomerID = dbo.CustomerCard.CustomerID
Join dbo.PlayerTier
on dbo.customer.PlayerTierID = dbo.PlayerTier.PlayerTierID WHERE dbo.CustomerCard.TrackData =@input_id`
        let totalPoint_today = 0;
        let totalPoint_Week = 0;
        let totalPoint_Month = 0;
        let totalPoint_All = 0;
        let totalPoint_current = 0;
        let totalPoint_today_slot = 0;
        let totalPoint_today_rl_tb = 0;
        let name = "";
        let tierName = '';
        let number = 0;
        let dateofbirth = '';
        let dateTime = new Date();
        const point_current = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryC}`)
        const points = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querybydates}`)
        const points_slot_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querySlotDaily}`)
        const points_rltb_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${queryRLTBDaily}`)
        const points_week = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateWeek)
            .input('input_endDate', sql.NVarChar, endDateWeek)
            .query(`${querybydates}`)
        const points_month = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateMonth)
            .input('input_endDate', sql.NVarChar, endDateMonth)
            .query(`${querybydates}`)
        const pointAll = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryall}`)

        const inforData = await pool.request().input('input_id', sql.NVarChar, id).query(queryInfor);
        if (points.rowsAffected > 0) {
            for (let i = 0; i < points.recordset.length; i++) {
                dateTime = ConverDateInDb(points.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                //console.log(d1,d2);
                if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_slot_daily.rowsAffected > 0) {
            for (let i = 0; i < points_slot_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_slot_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_slot_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_slot += points_slot_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_rltb_daily.rowsAffected > 0) {
            for (let i = 0; i < points_rltb_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_rltb_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_rltb_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_rl_tb += points_rltb_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_week.rowsAffected > 0) {
            for (let i = 0; i < points_week.recordset.length; i++) {
                dateTime = ConverDateInDb(points_week.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;

                //let d1 = new Date(`${startDateWeek}T06:00:00`);
                //let d2 = new Date(`${endDateWeek}T06:00:00`);
                if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
                    }
                }

            }
        }
        if (points_month.rowsAffected > 0) {
            for (let i = 0; i < points_month.recordset.length; i++) {
                dateTime = ConverDateInDb(points_month.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                //let d1 = new Date(`${startDateMonth}T06:00:00`);
                //let d2 = new Date(`${endDateMonth}T06:00:00`);
                if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (pointAll.rowsAffected > 0) {
            for (let i = 0; i < pointAll.recordset.length; i++) {
                number = pointAll.recordset[0]['Number'];
                name = pointAll.recordset[0]['PreferredName'];
                dateofbirth = pointAll.recordset[0]['DateOfBirth'];
                tierName = pointAll.recordset[0]['TierName'];
                if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
                    totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
                }
            }
        }

        if (point_current.rowsAffected > 0) {
            totalPoint_current = point_current.recordset[0]['Current_Point'];
        }
        // console.log('infor customer: ', inforData.recordset);
        // console.log('number: ', inforData.recordset[0]['Number']);

        let status = false
        if (name != "" && number != 0 && tierName != '') {
            status = true;
        } else if (inforData.recordset != null) {
            name = inforData.recordset[0]['PreferredName'];
            number = inforData.recordset[0]['Number'];
            dateofbirth = inforData.recordset[0]['DateOfBirth'];
            tierName = inforData.recordset[0]['TierName'];
            status = true;
        }

        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "TierName": tierName,
                "DateOfBirth": dateofbirth,
                "LoyaltyPoints": totalPoint_All,
                "LoyaltyPoints_Current": totalPoint_current,
                "LoyaltyPoints_Today": totalPoint_today,
                "LoyaltyPoints_Week": totalPoint_Week,
                "LoyaltyPoints_Month": totalPoint_Month,
                "LoyaltyPoints_Today_Slot": totalPoint_today_slot,
                "LoyaltyPoints_Today_RLTB": totalPoint_today_rl_tb,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByCardTrack local: ${error}`);
    }
}
//END CARD TRACK DATA


// //CARD TRACK DATA
// async function getPointCurrentByCardTrack(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
//     console.log(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth);
//     try {
//         let pool = await sql.connect(config)
//         const queryC = `SELECT dbo.customer.[CustomerID]
//       ,dbo.customer.[Number]
//       ,dbo.CustomerCard.CustomerCardID as 'Customer_Card'
//       ,[Title]
//       ,[PreferredName]
//       ,dbo.CustomerAccount.DisplayBalance as 'Current_Point'
//   FROM ${DBNAME}.[dbo].[Customer]
//   Join dbo.CustomerAccount
//   On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID

//   Join dbo.CustomerCard
//   On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID

//   Where dbo.CustomerCard.TrackData=@input_id
//   And dbo.CustomerAccount.AccountType=1`;

//         //SLOT daily
//         const querySlotDaily = `SELECT [PointTransactionID]
//         ,dbo.PointTransaction.[CustomerID]
//   ,dbo.Customer.Number
//   ,dbo.CustomerCard.TrackData as 'Customer Card'
//   ,dbo.PointTransaction.[GamingDate]
//         ,dbo.PointTransaction.[EntryDateTime]
//         ,dbo.PointTransaction.PlayerTransactionID
//         ,dbo.GameType.GameTypeID
//   ,dbo.Gametype.GameGroup
//   ,dbo.GameType.Name
//   ,[LoyaltyPoints]

// FROM ${DBNAME}.[dbo].[PointTransaction]

// join dbo.PlayerTransaction
// on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID

// Join dbo.GameType
// on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID

// join dbo.Customer
// on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID

// join dbo.CustomerCard
// on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID

// Where dbo.CustomerCard.TrackData=@input_id
// And dbo.Gametype.GameGroup=2
// And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
//         const queryRLTBDaily = `SELECT [PointTransactionID]
//         ,dbo.PointTransaction.[CustomerID]
//         ,dbo.Customer.Number
//         ,dbo.CustomerCard.TrackData as 'Customer Card'
//         ,dbo.PointTransaction.[GamingDate]
//         ,dbo.PointTransaction.[EntryDateTime]
//          ,dbo.PointTransaction.PlayerTransactionID
//          ,dbo.GameType.GameTypeID
//         ,dbo.Gametype.GameGroup
//         ,dbo.GameType.Name
//         ,[LoyaltyPoints]

//       FROM ${DBNAME}.[dbo].[PointTransaction]

//       join dbo.PlayerTransaction
//       on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID

//       Join dbo.GameType
//       on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID

//       join dbo.Customer
//       on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID

//       join dbo.CustomerCard
//       on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
//       Where dbo.CustomerCard.TrackData=@input_id
//       And dbo.Gametype.GameGroup=3
//       And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;

//         const querybydates = `SELECT [PointTransactionID]
//       ,dbo.Customer.PreferredName
//       ,dbo.Customer.Number
// 	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
//       ,[GamingDate]
//       ,[EntryDateTime]
//       ,[Comment]
//       ,[LoyaltyPoints]
//       ,[CompPoints]

//   FROM ${DBNAME}.[dbo].[PointTransaction]

//   Join dbo.Customer
//   On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID

//   Join dbo.CustomerCard
//   on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID

//   Where dbo.CustomerCard.TrackData=@input_id
//   and dbo.PointTransaction.Type=1
//   and dbo.PointTransaction.GamingDate >= @input_startDate and dbo.PointTransaction.GamingDate <= @input_endDate`

//         const queryall = `SELECT [PointTransactionID]
//       ,dbo.Customer.PreferredName
//       ,dbo.Customer.Number
//       ,dbo.MembershipType.name as 'TierName'
// 	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
//       ,[GamingDate]
//       ,[EntryDateTime]
//       ,[Comment]
//       ,[LoyaltyPoints]
//       ,[CompPoints]
//       ,dbo.Customer.DateOfBirth

//   FROM ${DBNAME}.[dbo].[PointTransaction]
//   Join dbo.Customer
//   On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
//   Join dbo.MembershipType
//   On dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID
//   Join dbo.CustomerCard
//   on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
//   Where dbo.CustomerCard.TrackData=@input_id`
//         //console.log(`connection was established getPointCurrentByCardTrack`);
//         let totalPoint_today = 0;
//         let totalPoint_Week = 0;
//         let totalPoint_Month = 0;
//         let totalPoint_All = 0;
//         let totalPoint_current = 0;
//         let totalPoint_today_slot = 0;
//         let totalPoint_today_rl_tb = 0;
//         let name = "";
//         let tierName = '';
//         let number = 0;
//         let dateofbirth = '';
//         let dateTime = new Date();
//         const point_current = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .query(`${queryC}`)
//         const points = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, dateToday)
//             .input('input_endDate', sql.NVarChar, dateToday2)
//             .query(`${querybydates}`)
//         const points_slot_daily = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, dateToday)
//             .input('input_endDate', sql.NVarChar, dateToday2)
//             .query(`${querySlotDaily}`)
//         const points_rltb_daily = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, dateToday)
//             .input('input_endDate', sql.NVarChar, dateToday2)
//             .query(`${queryRLTBDaily}`)
//         const points_week = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, startDateWeek)
//             .input('input_endDate', sql.NVarChar, endDateWeek)
//             .query(`${querybydates}`)
//         const points_month = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, startDateMonth)
//             .input('input_endDate', sql.NVarChar, endDateMonth)
//             .query(`${querybydates}`)
//         const pointAll = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .query(`${queryall}`)
//         if (points.rowsAffected > 0) {
//             for (let i = 0; i < points.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points.recordset[i]['EntryDateTime']);
//                 //console.log(1,points[i])
//                 //console.log(points.recordset[i]['EntryDateTime'].toLocaleString());
//                 //console.log("abc");
//                 //console.log(points.recordset[i]['EntryDateTime'].toString());
//                 //console.log("xyz");
//                 //console.log(dateTime);
//                 //let d1 = new Date(`${dateToday}T06:00:00`);
//                 //let d2 = new Date(`${dateToday2}T06:00:00`);
//                 let dateData = ConvertDateFromClient(dateToday, dateToday2);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 //console.log(d1,d2);
//                 if (points.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_today += points.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (points_slot_daily.rowsAffected > 0) {
//             for (let i = 0; i < points_slot_daily.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_slot_daily.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(dateToday, dateToday2);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 if (points_slot_daily.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_today_slot += points_slot_daily.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (points_rltb_daily.rowsAffected > 0) {
//             for (let i = 0; i < points_rltb_daily.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_rltb_daily.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(dateToday, dateToday2);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 if (points_rltb_daily.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_today_rl_tb += points_rltb_daily.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (points_week.rowsAffected > 0) {
//             for (let i = 0; i < points_week.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_week.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;

//                 //let d1 = new Date(`${startDateWeek}T06:00:00`);
//                 //let d2 = new Date(`${endDateWeek}T06:00:00`);
//                 if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
//                     }
//                 }

//             }
//         }
//         if (points_month.rowsAffected > 0) {
//             for (let i = 0; i < points_month.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_month.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 //let d1 = new Date(`${startDateMonth}T06:00:00`);
//                 //let d2 = new Date(`${endDateMonth}T06:00:00`);
//                 if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (pointAll.rowsAffected > 0) {
//             for (let i = 0; i < pointAll.recordset.length; i++) {
//                 number = pointAll.recordset[0]['Number'];
//                 name = pointAll.recordset[0]['PreferredName'];
//                 dateofbirth = pointAll.recordset[0]['DateOfBirth'];
//                 tierName = pointAll.recordset[0]['TierName'];
//                 if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
//                     totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
//                 }
//             }
//         }
//         if (point_current.rowsAffected > 0) {
//             totalPoint_current = point_current.recordset[0]['Current_Point'];
//         }
//         let status = false
//         if (name != "" && number != 0) {
//             status = true;
//         }
//         const map = {
//             "status": status,
//             "data": {
//                 "PreferredName": name,
//                 "Number": number,
//                 "TierName": tierName,
//                 "DateOfBirth": dateofbirth,
//                 "LoyaltyPoints": totalPoint_All,
//                 "LoyaltyPoints_Current": totalPoint_current,
//                 "LoyaltyPoints_Today": totalPoint_today,
//                 "LoyaltyPoints_Week": totalPoint_Week,
//                 "LoyaltyPoints_Month": totalPoint_Month,
//                 "LoyaltyPoints_Today_Slot": totalPoint_today_slot,
//                 "LoyaltyPoints_Today_RLTB": totalPoint_today_rl_tb,

//             }
//         }
//         return map
//     } catch (error) {
//         console.log(`An error orcur getPointCurrentByCardTrack: ${error}`);
//     }
// }
// //END CARD TRACK DATA



//CARD TRACK DATA FULL INFOR
async function getPointCurrentByCardTrackFullInfor(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
    try {
        let pool = await sql.connect(config)
        const queryC = `SELECT dbo.customer.[CustomerID]
        ,dbo.customer.[Number],dbo.Customer.MobilePhone,dbo.customer.EmailAddress
        ,dbo.CustomerCard.CustomerCardID as 'Customer_Card'
        ,[Title]
        ,[PreferredName]
        ,dbo.CustomerAccount.DisplayBalance as 'Current_Point',dbo.PlayerTier.Name as 'TierName'
    FROM ${DBNAME}.[dbo].[Customer]

    Join dbo.CustomerAccount
    On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID

    Join dbo.CustomerCard
    On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID

    Join dbo.PlayerTier
    on dbo.customer.PlayerTierID = dbo.PlayerTier.PlayerTierID

    Where dbo.CustomerCard.TrackData=@input_id
    And dbo.CustomerAccount.AccountType=1`;

        //SLOT daily
        const querySlotDaily = `SELECT [PointTransactionID] ,dbo.PointTransaction.[CustomerID]
  ,dbo.Customer.Number
  ,dbo.CustomerCard.TrackData as 'Customer Card'
  ,dbo.PointTransaction.[GamingDate]
        ,dbo.PointTransaction.[EntryDateTime]
        ,dbo.PointTransaction.PlayerTransactionID
        ,dbo.GameType.GameTypeID
  ,dbo.Gametype.GameGroup
  ,dbo.GameType.Name
  ,[LoyaltyPoints]
FROM ${DBNAME}.[dbo].[PointTransaction]
join dbo.PlayerTransaction
on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
Join dbo.GameType
on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
join dbo.Customer
on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
join dbo.CustomerCard
on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
Where dbo.CustomerCard.TrackData=@input_id
And dbo.Gametype.GameGroup=2
And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
        const queryRLTBDaily = `SELECT [PointTransactionID]
        ,dbo.PointTransaction.[CustomerID]
        ,dbo.Customer.Number
        ,dbo.CustomerCard.TrackData as 'Customer Card'
        ,dbo.PointTransaction.[GamingDate]
        ,dbo.PointTransaction.[EntryDateTime]
         ,dbo.PointTransaction.PlayerTransactionID
         ,dbo.GameType.GameTypeID
        ,dbo.Gametype.GameGroup
        ,dbo.GameType.Name
        ,[LoyaltyPoints]
      FROM ${DBNAME}.[dbo].[PointTransaction]
      join dbo.PlayerTransaction
      on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
      Join dbo.GameType
      on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
      join dbo.Customer
      on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
      join dbo.CustomerCard
      on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
      Where dbo.CustomerCard.TrackData=@input_id
      And dbo.Gametype.GameGroup=3
      And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
        const querybydates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  Where dbo.CustomerCard.TrackData=@input_id
  and dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate >= @input_startDate and dbo.PointTransaction.GamingDate <= @input_endDate`
        const queryall = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  Where dbo.CustomerCard.TrackData=@input_id`
        let totalPoint_today = 0;
        let totalPoint_Week = 0;
        let totalPoint_Month = 0;
        let totalPoint_All = 0;
        let totalPoint_current = 0;
        let totalPoint_today_slot = 0;
        let totalPoint_today_rl_tb = 0;
        let name = ""; let email = ''; let tiername = ''; let phone = '';
        let number = 0;
        let title = '';
        let dateTime = new Date();
        const point_current = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryC}`)
        const points = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querybydates}`)
        const points_slot_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querySlotDaily}`)
        const points_rltb_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${queryRLTBDaily}`)
        const points_week = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateWeek)
            .input('input_endDate', sql.NVarChar, endDateWeek)
            .query(`${querybydates}`)
        const points_month = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateMonth)
            .input('input_endDate', sql.NVarChar, endDateMonth)
            .query(`${querybydates}`)
        const pointAll = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryall}`)
        if (points.rowsAffected > 0) {
            for (let i = 0; i < points.recordset.length; i++) {
                dateTime = ConverDateInDb(points.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_slot_daily.rowsAffected > 0) {
            for (let i = 0; i < points_slot_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_slot_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_slot_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_slot += points_slot_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_rltb_daily.rowsAffected > 0) {
            for (let i = 0; i < points_rltb_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_rltb_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_rltb_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_rl_tb += points_rltb_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_week.rowsAffected > 0) {
            for (let i = 0; i < points_week.recordset.length; i++) {
                dateTime = ConverDateInDb(points_week.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
                    }
                }

            }
        }
        if (points_month.rowsAffected > 0) {
            for (let i = 0; i < points_month.recordset.length; i++) {
                dateTime = ConverDateInDb(points_month.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (pointAll.rowsAffected > 0) {
            for (let i = 0; i < pointAll.recordset.length; i++) {
                number = pointAll.recordset[0]['Number'];
                name = pointAll.recordset[0]['PreferredName'];
                if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
                    totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
                }
            }
        }
        if (point_current.rowsAffected > 0) {
            totalPoint_current = point_current.recordset[0]['Current_Point'];
            phone = point_current.recordset[0]['MobilePhone'];
            email = point_current.recordset[0]['EmailAddress'];
            title = point_current.recordset[0]['Title'];
            tiername = point_current.recordset[0]['TierName'];
        }
        let status = false
        if (name != "" && number != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints": totalPoint_All,
                "LoyaltyPoints_Current": totalPoint_current,
                "LoyaltyPoints_Today": totalPoint_today,
                "LoyaltyPoints_Week": totalPoint_Week,
                "LoyaltyPoints_Month": totalPoint_Month,
                "LoyaltyPoints_Today_Slot": totalPoint_today_slot,
                "LoyaltyPoints_Today_RLTB": totalPoint_today_rl_tb,
                "Phone": phone,
                "Email": email,
                "TierName": tiername,
                "Title": title,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByCardTrackFullInfor: ${error}`);
    }
}
//END CARD TRACK DATA FULL INFOR

//START GET POINT BY CARDTRACK RANGE
async function getPointCurrentByCardTrackRange(id, startDate, endDate) {
    try {
        let pool = await sql.connect(config)
        let querybydates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]

  FROM ${DBNAME}.[dbo].[PointTransaction]

  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID

  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID

  Where dbo.CustomerCard.TrackData=@input_id
  and dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate  between @input_startDate and @input_endDate`

        // console.log(`connection was established getPointCurrentByCardTrackRanges`);

        let totalPoint_Frame = 0;
        let name = "";
        let number = 0;
        let dateTime = new Date();

        const points_frame = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .query(`${querybydates}`)

        if (points_frame.rowsAffected > 0) {
            for (let i = 0; i < points_frame.recordset.length; i++) {
                name = points_frame.recordset[i]['PreferredName'];
                number = points_frame.recordset[i]['Number'];
                //console.log(1,points[i])
                //console.log(points.recordset[i]['EntryDateTime'].toLocaleString());
                //console.log("abc");
                //console.log(points.recordset[i]['EntryDateTime'].toString());
                //console.log("xyz");
                //console.log(dateTime);
                dateTime = new Date(points_frame.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDate, endDate);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_frame.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Frame += points_frame.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }

        let status = false
        if (name != "" && number != 0 && totalPoint_Frame != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints_Frame": totalPoint_Frame,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByCardTrackRanges: ${error}`);
    }
}
//END HERE
//GET POINT BY CUSTOMER NUMBER RANGE


async function getPointCurrentByNumberRange(id, startDate, endDate) {
    try {
        let pool = await sql.connect(config)
        let querybydates = `SELECT  dbo.Customer.PreferredName
      ,dbo.Customer.Number
      ,[EntryDateTime],[GamingDate]
      ,[LoyaltyPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  Where dbo.Customer.Number=@input_id
  and dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate  between @input_startDate and @input_endDate`
        // console.log(`connection was established getPointCurrentByNumberRanges`);
        let totalPoint_Frame = 0;
        let name = "";
        let number = 0;
        let dateTime = new Date();

        const points_frame = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .query(`${querybydates}`)

        if (points_frame.rowsAffected > 0) {
            for (let i = 0; i < points_frame.recordset.length; i++) {
                name = points_frame.recordset[i]['PreferredName'];
                number = points_frame.recordset[i]['Number'];
                dateTime = new Date(points_frame.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDate, endDate);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_frame.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Frame += points_frame.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        let status = false
        if (name != "" && number != 0 && totalPoint_Frame != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints_Frame": totalPoint_Frame,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByNumberRanges: ${error}`);
    }
}


//CUSTOMER FIND FRAME DATE

async function getDateFrameByNumber(number, callback) {
    // console.log('get dateframe by number');
    let query = `SELECT number,forename,frame_start_date,frame_end_date FROM vcms_dev.customers WHERE number = ${number}`;
    // let query = `SELECT number,forename, frame_start_date, frame_end_date FROM vcms_dev.customers WHERE number = ${number}`;
    try {
        connection.getConnection(function (err, conn) {
            if (err) {
                console.log(`getConnection error : ${err}`);
                return;
            }
            connection.query(query, function (err, result, fields) {
                if (err) {
                    console.log('error query');
                    return;
                };
                //USE CALLBACK FUNCTION TO GET RESULT
                callback(err, result)
            });
            // connection_end;
            conn.release()
            // Don't forget to release the connection when finished!
        })
    } catch (error) {
        console.log(`An error orcur getDateFrameByNumber: ${error}`);
        return;
    }
}

//FINd NEW USER
async function findFrameCustomer(date, callback) {
    let query = `SELECT number,forename,frame_start_date,frame_end_date FROM vcms_dev.customers
    WHERE frame_start_date >= ${date} ORDER BY frame_start_date DESC LIMIT 100`;
    try {
        connection.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log(`getConnection error : ${err}`)
            }
            connection.query(query, function (err, result, fields) {
                if (err) (
                    console.log(err)
                );
                // console.log(result);
                //USE CALLBACK FUNCTION TO GET RESULT
                callback(err, result)
            });
            // conn.getConnection()
            conn.release();
            // Don't forget to release the connection when finished!
        })

    } catch (error) {
        console.log(`An error orcur findFrameDateCustomer: ${error}`);
    }
}
//MYSQL FIND USER LOGIN STATUS
async function findUserLoginStatus(number, callback) {
    let query = `SELECT email,sign_in_count,current_sign_in_at,last_sign_in_at FROM vcms_dev.users where email = ${number} ;`;
    try {
        await connection.getConnection(function (err, conn) {
            if (err) {
                console.log(`getConnection error : ${err}`)
            }
            connection.query(query, function (err, result, fields) {
                if (err) (
                    console.log(err)
                );
                console.log(result);
                callback(err, result)
            });
            conn.release();

        })

    } catch (error) {
        console.log(`An error orcur findFrameDateCustomer: ${error}`);
    }
}

async function findGameThemeNumber(number) {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT dbo.Machine.Number,dbo.MachineGameTheme.MachineGameThemeID,dbo.MachineGameTheme.Name FROM ${DBNAME}.[dbo].[Machine] Join dbo.MachineGameTheme  On dbo.MachineGameTheme.MachineGameThemeID=dbo.Machine.MachineGameThemeID
      WHERE dbo.Machine.Number = @input_id`;

        const data_query = await pool.request()
            .input('input_id', sql.NVarChar, number)
            .query(`${query}`)
        return data_query.recordset[0];
    } catch (error) {
        console.log(`An error orcur findGameThemeNumber: ${error}`);
    }
}
async function getallGameTheme() {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT dbo.Machine.Number,dbo.MachineGameTheme.MachineGameThemeID,dbo.MachineGameTheme.GameTypeID,dbo.MachineGameTheme.Name FROM ${DBNAME}.[dbo].[Machine]
        Join dbo.MachineGameTheme  On dbo.MachineGameTheme.MachineGameThemeID=dbo.Machine.MachineGameThemeID where dbo.machine.status ='1'`;

        const data_query = await pool.request().query(`${query}`)
        return data_query;
    } catch (error) {
        console.log(`An error orcur findGameThemeNumber: ${error}`);
    }
}


//TOURNAMENT BY DATE
async function listTournamentByDate(date) {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT TOP 20 dbo.machine.Number as 'Machine_Number'
        ,[GamingDate]
        ,[NetTransactions]
        ,[ActualWinLoss]
    FROM  ${DBNAME}.[dbo].[MachineResult]
    Join dbo.Machine
    On dbo.machine.MachineID=dbo.MachineResult.MachineID
    Where GamingDate=@input_id`;

        const data_query = await pool.request()
            .input('input_id', sql.NVarChar, date)
            .query(`${query}`)
        return data_query.recordset;
    } catch (error) {
        console.log(`An error orcur tournament: ${error}`);
    }
}

//LIST CUSTOMER BY LEVEL W LIMIT
async function listCustomerByLevelLimit(level) {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT TOP (100)
        [CustomerID]
        ,[Number]
        ,[Title]
        ,[PreferredName]
        ,[DateOfBirth]
        ,dbo.MembershipType.name
    FROM ${DBNAME}.[dbo].[Customer]
    JOIN dbo.MembershipType
    On dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID

    WHERE dbo.MembershipType.name =@input_level`;
        const data_query = await pool.request()
            .input('input_level', sql.NVarChar, level)
            .query(`${query}`)
        // console.log(data_query.rowsAffected)
        return data_query.recordset;
    }
    catch (error) {
        console.log(`An error orcur listCustomerByLevelLimit: ${error}`);
    }
}


function ConverDateInDb(entryDate) {
    return new Date(entryDate.toUTCString());
}

function ConvertDateFromClient(startDate, endDate) {
    return {
        "startDate": new Date(`${startDate}T06:00:00.000+00:00`).getTime(),
        "endDate": new Date(`${endDate}T06:00:00.000+00:00`).getTime() + 86400000
    }
}

//GET POINT BY CUSTOMER NUMBER RANGE
async function getUserNameNumber(id) {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT TOP (5)[Number],[PreferredName] FROM ${DBNAME}.[dbo].[Customer] WHERE dbo.Customer.number = @input_id`;
        let name = "";
        let number = 0;
        const data = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${query}`)

        if (data.rowsAffected > 0) {
            for (let i = 0; i < data.recordset.length; i++) {
                name = data.recordset[i]['PreferredName'];
                number = data.recordset[i]['Number'];
            }
        }
        let status = false
        if (name != "" && number != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getUserNameNumber: ${error}`);
    }
}


//JACKPOT MACHINE
async function getJackPotMachine() {
    try {
        let pool = await sql.connect(config)
        console.log(`connection was established getJackPotMachine`);
        let query1 = await pool.request().query(`SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,[AlertConfigurationID]
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
        FROM ${DBNAME}.[dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Where AlertConfigurationID=64
        And Item between 'Machine Number 4001' and 'Machine Number 4010' ORDER BY dbo.alert.GamingDate DESC`);

        let query2 = await pool.request().query(`SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,[AlertConfigurationID]
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
        FROM ${DBNAME}.[dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Where Item between 'Machine Number 4001' and 'Machine Number 4010'
        And Detail like 'Progressive Jackpot%' ORDER BY dbo.alert.GamingDate DESC`);

        let query3 = await pool.request().query(`SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,[AlertConfigurationID]
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
        FROM ${DBNAME}.[dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Where AlertConfigurationID=61
        And Detail like 'Jackpot%' ORDER BY dbo.alert.GamingDate DESC`);

        const combinedResult = [
            ...query1.recordset,
            ...query2.recordset,
            ...query3.recordset
        ];

        return combinedResult;


    } catch (error) {
        console.log(`An error orcur getJackPotMachine: ${error}`);
    }
}


//JACKPOT MACHINE only JJBX
async function getJackPotMachineJJBX() {
    try {
        let pool = await sql.connect(config)
        console.log(`connection was established getJackPotMachineJJBX`);
        let query1 = await pool.request().query(`
        SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,dbo.alert.[AlertConfigurationID]
		,dbo.AlertConfiguration.Name  as 'AlertName'
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
		,dbo.AlertConfiguration.Colour
		,dbo.AlertConfiguration.AlertTypeID
        FROM [dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Join dbo.AlertConfiguration On dbo.AlertConfiguration.AlertConfigurationID=dbo.Alert.AlertConfigurationID
        Where
        Item IN ('Machine Number 4001','Machine Number 4002','Machine Number 4003','Machine Number 4005','Machine Number 4006','Machine Number 4007','Machine Number 4008','Machine Number 4009')
        And Detail like 'Amount%'
        ORDER BY dbo.alert.GamingDate DESC`);

        let query2 = await pool.request().query(`
         SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,dbo.alert.[AlertConfigurationID]
	    ,dbo.AlertConfiguration.Name  as 'Alert Name'
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
	    ,dbo.AlertConfiguration.Colour
	    ,dbo.AlertConfiguration.AlertTypeID
        FROM [dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Join dbo.AlertConfiguration On dbo.AlertConfiguration.AlertConfigurationID=dbo.Alert.AlertConfigurationID
        Where
        Item IN ('Machine Number 4001','Machine Number 4002','Machine Number 4003','Machine Number 4005','Machine Number 4006','Machine Number 4007','Machine Number 4008','Machine Number 4009')
        And Detail like 'Progressive%'
        ORDER BY dbo.alert.GamingDate DESC
        `);

        const combinedResult = [
            ...query1.recordset,
            ...query2.recordset,
        ];
        return combinedResult;


    } catch (error) {
        console.log(`An error orcur getJackPotMachineJJBX: ${error}`);
    }
}
//JACKPOT MACHINE only JJBX
async function getJackPotMachineJJBXByDate(date) {
    try {
        let pool = await sql.connect(config)
        console.log(`connection was established getJackPotMachineJJBXByDate`);
        let query1 = await pool.request().input('input_id', sql.NVarChar, date).query(`
        SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,dbo.alert.[AlertConfigurationID]
		,dbo.AlertConfiguration.Name  as 'AlertName'
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
		,dbo.AlertConfiguration.Colour
		,dbo.AlertConfiguration.AlertTypeID
        FROM [dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Join dbo.AlertConfiguration On dbo.AlertConfiguration.AlertConfigurationID=dbo.Alert.AlertConfigurationID
        Where
        Item IN ('Machine Number 4001','Machine Number 4002','Machine Number 4003','Machine Number 4005','Machine Number 4006','Machine Number 4007','Machine Number 4008','Machine Number 4009')
        And Detail like 'Amount%'
        And dbo.alert.GamingDate =@input_id
        ORDER BY dbo.alert.GamingDate DESC`);

        let query2 = await pool.request().input('input_id', sql.NVarChar, date).query(`
         SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,dbo.alert.[AlertConfigurationID]
	    ,dbo.AlertConfiguration.Name  as 'Alert Name'
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
	    ,dbo.AlertConfiguration.Colour
	    ,dbo.AlertConfiguration.AlertTypeID
        FROM [dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Join dbo.AlertConfiguration On dbo.AlertConfiguration.AlertConfigurationID=dbo.Alert.AlertConfigurationID
        Where
        Item IN ('Machine Number 4001','Machine Number 4002','Machine Number 4003','Machine Number 4005','Machine Number 4006','Machine Number 4007','Machine Number 4008','Machine Number 4009')
        And Detail like 'Progressive%'
        And  dbo.alert.GamingDate =@input_id
        ORDER BY dbo.alert.GamingDate DESC
        `);

        const combinedResult = [
            ...query1.recordset,
            ...query2.recordset,
        ];
        return combinedResult;


    } catch (error) {
        console.log(`An error orcur getJackPotMachineJJBXByDate: ${error}`);
    }
}




//END JACKPOT MACHINE
async function getJackPotMachineByDate(date) {
    try {
        let pool = await sql.connect(config)
        console.log(`connection was established getJackPotMachine`);
        let query1 = await pool.request().input('input_id', sql.NVarChar, date).query(`SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,[AlertConfigurationID]
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
        FROM ${DBNAME}.[dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Where AlertConfigurationID=64
        And Item between 'Machine Number 4001' and 'Machine Number 4010' and dbo.alert.GamingDate =@input_id ORDER BY dbo.alert.GamingDate DESC`);

        let query2 = await pool.request().input('input_id', sql.NVarChar, date).query(`SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,[AlertConfigurationID]
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
        FROM ${DBNAME}.[dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Where Item between 'Machine Number 4001' and 'Machine Number 4010'
        And Detail like 'Progressive Jackpot%' and dbo.alert.GamingDate =@input_id ORDER BY dbo.alert.GamingDate DESC`);

        let query3 = await pool.request().input('input_id', sql.NVarChar, date).query(`SELECT [AlertID]
        ,[GamingDate]
        ,[ActualDateTime]
        ,[AlertConfigurationID]
        ,[Item]
        ,dbo.MachineGameTheme.Name as 'GameTheme'
        ,[Detail]
        ,dbo.alert.[MachineID]
        FROM ${DBNAME}.[dbo].[Alert]
        Join dbo.Machine
        On dbo.machine.MachineID=dbo.alert.MachineID
        Join dbo.MachineGameTheme
        On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
        Where AlertConfigurationID=61
        And Detail like 'Jackpot%' and dbo.alert.GamingDate =@input_id ORDER BY dbo.alert.GamingDate DESC`);

        const combinedResult = [
            ...query1.recordset,
            ...query2.recordset,
            ...query3.recordset
        ];

        return combinedResult;


    } catch (error) {
        console.log(`An error orcur getJackPotMachine: ${error}`);
    }
}
// JACKPOT MACHINE PAST MONTH
async function getJackPotMachineForPastMonth(date) {
    try {
        // Parse the input date
        const currentDate = new Date(date);
        // console.log('current date',currentDate);

        // Calculate the start date (one month ago)
        const startDate = new Date(currentDate);
        startDate.setMonth(startDate.getMonth() - 1);
        // console.log('past month',startDate);

        // Format dates to SQL format (assuming your SQL Server expects YYYY-MM-DD)
        const formattedStartDate = startDate.toISOString().split('T')[0];
        // console.log('format startdate',formattedStartDate);
        const formattedEndDate = currentDate.toISOString().split('T')[0];
        // console.log('format enddate',formattedEndDate);

        let pool = await sql.connect(config);

        let query1 = await pool.request()
            .input('start_date', sql.Date, formattedStartDate)
            .input('end_date', sql.Date, formattedEndDate)
            .query(`
                SELECT [AlertID], [GamingDate], [ActualDateTime], [AlertConfigurationID],
                [Item], dbo.MachineGameTheme.Name as 'GameTheme', [Detail], dbo.alert.[MachineID]
                FROM ${DBNAME}.[dbo].[Alert]
                Join dbo.Machine On dbo.machine.MachineID=dbo.alert.MachineID
                Join dbo.MachineGameTheme On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                Where AlertConfigurationID=64
                And Item between 'Machine Number 5001' and 'Machine Number 5010'
                And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                ORDER BY dbo.alert.GamingDate DESC
            `);

        let query2 = await pool.request()
            .input('start_date', sql.Date, formattedStartDate)
            .input('end_date', sql.Date, formattedEndDate)
            .query(`
                SELECT [AlertID], [GamingDate], [ActualDateTime], [AlertConfigurationID],
                [Item], dbo.MachineGameTheme.Name as 'GameTheme', [Detail], dbo.alert.[MachineID]
                FROM ${DBNAME}.[dbo].[Alert]
                Join dbo.Machine On dbo.machine.MachineID=dbo.alert.MachineID
                Join dbo.MachineGameTheme On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                Where Item between 'Machine Number 5001' and 'Machine Number 5010'
                And Detail like 'Progressive Jackpot%'
                And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                ORDER BY dbo.alert.GamingDate DESC
            `);

        let query3 = await pool.request()
            .input('start_date', sql.Date, formattedStartDate)
            .input('end_date', sql.Date, formattedEndDate)
            .query(`
                SELECT [AlertID], [GamingDate], [ActualDateTime], [AlertConfigurationID],
                [Item], dbo.MachineGameTheme.Name as 'GameTheme', [Detail], dbo.alert.[MachineID]
                FROM ${DBNAME}.[dbo].[Alert]
                Join dbo.Machine On dbo.machine.MachineID=dbo.alert.MachineID
                Join dbo.MachineGameTheme On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                Where AlertConfigurationID=61
                And Detail like 'Jackpot%'
                And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                ORDER BY dbo.alert.GamingDate DESC
            `);
        // console.log('query 1 data',query1.recordset);
        // console.log('query 2 data',query2.recordset);
        // console.log('query 3 data',query3.recordset);
        // Combine results from all queries into a single array.
        const combinedResult = [
            ...query1.recordset,
            ...query2.recordset,
            ...query3.recordset
        ];

        return combinedResult;

    } catch (error) {
        console.log(`An error occurred in getJackPotMachineForPastMonth: ${error}`);
    }
}


//JACKPOT MACHINE JJPX  BY MONTH
async function getJackPotMachineJJBXPastMonth(date) {
    try {
        const currentDate = new Date(date);
        const startDate = new Date(currentDate);
        startDate.setMonth(startDate.getMonth() - 1);
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = currentDate.toISOString().split('T')[0];
        let pool = await sql.connect(config);
        let query1 = await pool.request()
            .input('start_date', sql.Date, formattedStartDate)
            .input('end_date', sql.Date, formattedEndDate)
            .query(`SELECT [AlertID], [GamingDate], [ActualDateTime], [AlertConfigurationID], Name  as 'AlertName',
                [Item], dbo.MachineGameTheme.Name as 'GameTheme',
                [Detail], dbo.alert.[MachineID]
                FROM ${DBNAME}.[dbo].[Alert]
                Join dbo.Machine On dbo.machine.MachineID=dbo.alert.MachineID
                Join dbo.MachineGameTheme On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                Where AlertConfigurationID=64
                And Item between 'Machine Number 5001' and 'Machine Number 5010'
                And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                ORDER BY dbo.alert.GamingDate DESC`);

        let query2 = await pool.request()
            .input('start_date', sql.Date, formattedStartDate)
            .input('end_date', sql.Date, formattedEndDate)
            .query(`SELECT [AlertID], [GamingDate], [ActualDateTime], [AlertConfigurationID], Name  as 'AlertName',
                [Item], dbo.MachineGameTheme.Name as 'GameTheme',
                [Detail], dbo.alert.[MachineID]
                FROM ${DBNAME}.[dbo].[Alert]
                Join dbo.Machine On dbo.machine.MachineID=dbo.alert.MachineID
                Join dbo.MachineGameTheme On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                Where Item between 'Machine Number 5001' and 'Machine Number 5010'
                And Detail like 'Progressive Jackpot%'
                And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                ORDER BY dbo.alert.GamingDate DESC`);

        let query3 = await pool.request()
            .input('start_date', sql.Date, formattedStartDate)
            .input('end_date', sql.Date, formattedEndDate)
            .query(`SELECT [AlertID], [GamingDate], [ActualDateTime], [AlertConfigurationID], Name  as 'AlertName',
                [Item], dbo.MachineGameTheme.Name as 'GameTheme',
                [Detail], dbo.alert.[MachineID]
                FROM ${DBNAME}.[dbo].[Alert]
                Join dbo.Machine On dbo.machine.MachineID=dbo.alert.MachineID
                Join dbo.MachineGameTheme On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                Where AlertConfigurationID=61
                And Detail like 'Jackpot%'
                And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                ORDER BY dbo.alert.GamingDate DESC`);
        let query_jpmachine1 = await pool.request().input('start_date', sql.Date, formattedStartDate).input('end_date', sql.Date, formattedEndDate).query(`
                    SELECT [AlertID]
                    ,[GamingDate]
                    ,[ActualDateTime]
                    ,dbo.alert.[AlertConfigurationID]
                    ,dbo.AlertConfiguration.Name  as 'AlertName'
                    ,[Item]
                    ,dbo.MachineGameTheme.Name as 'GameTheme'
                    ,[Detail]
                    ,dbo.alert.[MachineID]
                    FROM [dbo].[Alert]
                    Join dbo.Machine
                    On dbo.machine.MachineID=dbo.alert.MachineID
                    Join dbo.MachineGameTheme
                    On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                    Join dbo.AlertConfiguration On dbo.AlertConfiguration.AlertConfigurationID=dbo.Alert.AlertConfigurationID
                    Where
                    Item IN ('Machine Number 5001','Machine Number 5002','Machine Number 5003','Machine Number 5005','Machine Number 5006','Machine Number 5007','Machine Number 5008','Machine Number 5009','Machine Number 5010')
                    And Detail like 'Amount%'
                    And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                    ORDER BY dbo.alert.GamingDate DESC`);

        let query_jpmachine2 = await pool.request().input('start_date', sql.Date, formattedStartDate).input('end_date', sql.Date, formattedEndDate).query(`
                    SELECT [AlertID]
                    ,[GamingDate]
                    ,[ActualDateTime]
                    ,dbo.alert.[AlertConfigurationID]
                    ,dbo.AlertConfiguration.Name  as 'AlertName'
                    ,[Item]
                    ,dbo.MachineGameTheme.Name as 'GameTheme'
                    ,[Detail]
                    ,dbo.alert.[MachineID]
                    FROM [dbo].[Alert]
                    Join dbo.Machine
                    On dbo.machine.MachineID=dbo.alert.MachineID
                    Join dbo.MachineGameTheme
                    On dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
                    Join dbo.AlertConfiguration On dbo.AlertConfiguration.AlertConfigurationID=dbo.Alert.AlertConfigurationID
                    Where
                    Item IN ('Machine Number 5001','Machine Number 5002','Machine Number 5003','Machine Number 5005','Machine Number 5006','Machine Number 5007','Machine Number 5008','Machine Number 5009','Machine Number 5010')
                    And Detail like 'Progressive%'
                    And dbo.alert.GamingDate BETWEEN @start_date AND @end_date
                    ORDER BY dbo.alert.GamingDate DESC`);
        const validMachineNumbers = [
                        'Machine Number 5001',
                        'Machine Number 5002',
                        'Machine Number 5003',
                        'Machine Number 5004',
                        'Machine Number 5005',
                        'Machine Number 5006',
                        'Machine Number 5007',
                        'Machine Number 5008',
                        'Machine Number 5009',
                        'Machine Number 5010'
        ];

        const combinedResult = [
            ...query1.recordset,
            ...query2.recordset,
            ...query3.recordset,
        ];
        const combinedResultJPMachine = [
            ...query_jpmachine1.recordset,
            ...query_jpmachine2.recordset,
        ];

        // Process all records to ensure Detail has a Level
        const processedResults = [...combinedResult, ...combinedResultJPMachine].map(item => {
            if (!validMachineNumbers.includes(item.Item)) {
                return item; // Skip if Item is not in the valid list
            }
            const hasLevel = /Level [12]/.test(item.Detail);
            if (hasLevel) {
                return item; // Skip if Detail already contains Level 1 or Level 2
            }

            // Extract amount from Detail
            const amountMatch = item.Detail.match(/Amount\s*\$?([\d,]+\.?\d*)/i);
            const amountValue = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

            // Determine level based on amount
            const level = amountValue < 120000 ? 'Level 2' : 'Level 1';

            // Update Detail to include level
            const newDetail = `${item.Detail} - ${level}`;

            return {
                ...item,
                Detail: newDetail
            };
        });


        // Find duplicate items
        const duplicates = combinedResultJPMachine.filter(item1 =>
            combinedResult.some(item2 => item1.AlertID === item2.AlertID)
        );
        const updatedDuplicates = duplicates.map(item => {
            // Check for existing "Level" or "Group" values
            const hasLevelOrGroup = /Level [12]|Group [12]/.test(item.Detail);
            if (hasLevelOrGroup) {
                return item;
            }
            // Extract amount value from the detail
            const amountMatch = item.Detail.match(/Amount\s*\$?(\d+\.?\d*)/i);
            const amountValue = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

            // Determine group based on amount value
            const group = amountValue > 120000 ? 'Group 0, Level 1' : 'Group 1, Level 2';
            // Update detail with "Progressive Jackpot:-" and group
            const newDetail = `Progressive Jackpot:- ${group} - ${item.Detail}`;

            return {
                ...item,
                Detail: newDetail
            };
        });


        // Combine results and updated duplicates
        const finalResults = [...processedResults, ...updatedDuplicates];

        // Remove duplicates, prioritizing "Detail" with "Level"
        const uniqueResultsMap = new Map();

        for (const item of finalResults) {
            if (!uniqueResultsMap.has(item.AlertID)) {
                uniqueResultsMap.set(item.AlertID, item);
            } else {
                const existingItem = uniqueResultsMap.get(item.AlertID);
                if (/Level/.test(item.Detail)) {
                    uniqueResultsMap.set(item.AlertID, item);
                }
            }
        }

        const uniqueResults = Array.from(uniqueResultsMap.values());

        return uniqueResults;
    } catch (error) {
        console.log(`An error occurred in getJackPotMachineJJBXPastMonth: ${error}`);
    }
}
// WIN/LOSS
async function getWinLostByDate(date, number) {
    try {
        const currentDate = new Date(date);
        let pool = await sql.connect(config);
        let query = await pool.request()
            .input('start_date', sql.Date, currentDate)
            .input('number', sql.NVarChar, number)
            .query(`SELECT dbo.Customer.Number, [GamingDate], [EntryDateTime], [SessionStartDateTime], [SessionEndDateTime], dbo.machine.Number as MachineNumber, [WinLoss]
                    FROM ${DBNAME}.[dbo].[PlayerTransaction]
                    JOIN dbo.machine ON dbo.machine.MachineID = dbo.PlayerTransaction.MachineID
                    JOIN dbo.Customer ON dbo.Customer.CustomerID = dbo.PlayerTransaction.CustomerID
                    WHERE GamingDate = @start_date
                    AND dbo.Customer.Number = @number`);
        const finalResult = [
            ...query.recordset,
        ];
        return finalResult;
    } catch (error) {
        console.log(`An error occurred in getWinLostByDate: ${error}`);
    }
}

// WIN/LOSS
async function getWinLostByDateRange(startDate, endDate, number) {
    try {
        // const currentDate = new Date(date);
        let pool = await sql.connect(config);
        let query = await pool.request()
            .input('start_date', sql.Date, startDate)
            .input('end_date', sql.Date, endDate)
            .input('number', sql.NVarChar, number)
            .query(`SELECT dbo.Customer.Number, [GamingDate], [EntryDateTime], [SessionStartDateTime], [SessionEndDateTime], dbo.machine.Number as MachineNumber, [WinLoss]
                    FROM ${DBNAME}.[dbo].[PlayerTransaction]
                    JOIN dbo.machine ON dbo.machine.MachineID = dbo.PlayerTransaction.MachineID
                    JOIN dbo.Customer ON dbo.Customer.CustomerID = dbo.PlayerTransaction.CustomerID
                    WHERE GamingDate BETWEEN @start_date AND @end_date
                    AND dbo.Customer.Number = @number`);
        const finalResult = [
            ...query.recordset,
        ];
        return finalResult;
    } catch (error) {
        console.log(`An error occurred in getWinLostByDate: ${error}`);
    }
}


// // WIN/LOSS FIX with parallel queries for faster execution
// async function getWinLostByDateFix(date, number) {
//     try {
//         const timezone = 'Asia/Bangkok';
//         const startDay = moment.tz(date, timezone).add(0, 'days').startOf('day').add(6, 'hours').toDate();
//         const nextDay = moment.tz(date, timezone).add(1, 'days').startOf('day').add(0, 'hours').toDate();
//         const next2Day = moment.tz(date, timezone).add(2, 'days').startOf('day').add(6, 'hours').toDate();
//         // console.log('getWinLostByDate: start date:', moment(startDay).format('YYYY-MM-DD HH:mm'));
//         // console.log('getWinLostByDate: nextDay date:', moment(nextDay).format('YYYY-MM-DD HH:mm'));
//         // console.log('getWinLostByDate: next2Day date:', moment(next2Day).format('YYYY-MM-DD HH:mm'));

//         let pool = await sql.connect(config);

//         // Run both queries in parallel using Promise.all()
//         const [queryResult1, queryResult2] = await Promise.all([
//             pool.request()
//                 .input('start_date', sql.Date, nextDay)
//                 .input('number', sql.NVarChar, number)
//                 .query(`SELECT dbo.Customer.Number, [GamingDate], [EntryDateTime], [SessionStartDateTime], [SessionEndDateTime], dbo.machine.Number as MachineNumber, [WinLoss]
//                         FROM ${DBNAME}.[dbo].[PlayerTransaction]
//                         JOIN dbo.machine ON dbo.machine.MachineID = dbo.PlayerTransaction.MachineID
//                         JOIN dbo.Customer ON dbo.Customer.CustomerID = dbo.PlayerTransaction.CustomerID
//                         WHERE GamingDate = @start_date
//                         AND dbo.Customer.Number = @number`),

//             pool.request()
//                 .input('start_date', sql.Date, next2Day)
//                 .input('number', sql.NVarChar, number)
//                 .query(`SELECT dbo.Customer.Number, [GamingDate], [EntryDateTime], [SessionStartDateTime], [SessionEndDateTime], dbo.machine.Number as MachineNumber, [WinLoss]
//                         FROM ${DBNAME}.[dbo].[PlayerTransaction]
//                         JOIN dbo.machine ON dbo.machine.MachineID = dbo.PlayerTransaction.MachineID
//                         JOIN dbo.Customer ON dbo.Customer.CustomerID = dbo.PlayerTransaction.CustomerID
//                         WHERE GamingDate = @start_date
//                         AND dbo.Customer.Number = @number`)
//         ]);

//         // Merge results from both queries
//         const finalResult = [
//             ...queryResult1.recordset,
//             ...queryResult2.recordset,
//         ];


//         // Return the merged result
//         return finalResult;
//     } catch (error) {
//         console.log(`An error occurred in getWinLostByDate: ${error}`);
//     }
// }

// MACHINE PLAYING COMBINE WITH WIN/LOSS
async function getMachinePlayingStatusWinLoss(date, sortOrder = 'ASC',) {
    try {
        const currentDate = new Date(date);
        // const currentDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 6, 0, 0));
        console.log('current date local : ', currentDate);
        // Define the timezone (e.g., 'Asia/Bangkok')
        const timezone = 'Asia/Bangkok';
        // Create start and end date in local timezone
        const startDate = moment.tz(date, timezone).startOf('day').add(6, 'hours').toDate();
        const endDate = moment.tz(date, timezone).add(1, 'days').startOf('day').add(6, 'hours').toDate();

        // Log to verify date range
        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);

        let pool = await sql.connect(config);
        // let query = await pool.request()
        //     .input('start_date', sql.Date, currentDate)
        //     .query(`SELECT dbo.[MachinePlayerSession].CustomerID, dbo.customer.Number, dbo.Customer.PreferredName, dbo.Machine.Number as MachineNumber, [StartGamingDate], [EndDateTime], dbo.machineplayersession.[Status]
        //             FROM ${DBNAME}.[dbo].[MachinePlayerSession]
        //             JOIN dbo.Machine ON dbo.machine.MachineID = dbo.MachinePlayerSession.MachineID
        //             JOIN dbo.Customer ON dbo.customer.CustomerID = dbo.MachinePlayerSession.CustomerID
        //             WHERE dbo.machineplayersession.Status = '1'
        //             AND StartGamingDate = @start_date`);
        let query = await pool.request()
            .input('start_date', sql.DateTime, startDate)
            .input('end_date', sql.DateTime, endDate)
            .query(`SELECT dbo.[MachinePlayerSession].CustomerID, dbo.customer.Number, dbo.Customer.PreferredName, dbo.Machine.Number as MachineNumber, [StartGamingDate], [EndDateTime], dbo.machineplayersession.[Status]
                FROM ${DBNAME}.[dbo].[MachinePlayerSession]
                JOIN dbo.Machine ON dbo.machine.MachineID = dbo.MachinePlayerSession.MachineID
                JOIN dbo.Customer ON dbo.customer.CustomerID = dbo.MachinePlayerSession.CustomerID
                WHERE dbo.machineplayersession.Status = '1'
                AND StartGamingDate >= @start_date
                AND StartGamingDate < @end_date`);

        const machinePlayingStatus = query.recordset;
        // Fetch Win/Loss data concurrently for all customers
        const fetchWinLossPromises = machinePlayingStatus.map(async (status) => {
            try {
                console.log(status.MachineNumber)
                const winLostData = await getWinLostByDate(date, status.Number.toString());
                const totalWinLoss = winLostData.reduce((total, record) => total + (record.WinLoss || 0), 0);
                status.WinLoss = totalWinLoss;
                status.Detail = winLostData.map(record => ({
                    SessionStartDateTime: record.SessionStartDateTime,
                    SessionEndDateTime: record.SessionEndDateTime,
                    MachineNumber: record.MachineNumber,
                    WinLoss: record.WinLoss
                }));

            } catch (error) {
                console.log(`An error occurred while fetching win/loss data for customer number ${status.Number}: ${error}`);
            }
            return status;
        });

        let results = await Promise.all(fetchWinLossPromises);

        // Consolidate entries with the same "Number"
        const uniqueResultsMap = new Map();

        results.forEach(status => {
            if (uniqueResultsMap.has(status.Number)) {
                let existingEntry = uniqueResultsMap.get(status.Number);
                existingEntry.WinLoss += status.WinLoss;
                existingEntry.MachineNumber = Array.from(new Set(existingEntry.MachineNumber.concat(status.MachineNumber)));
                existingEntry.Detail = existingEntry.Detail.concat(status.Detail);
            } else {
                uniqueResultsMap.set(status.Number, {
                    ...status,
                    MachineNumber: [status.MachineNumber],
                });
            }
        });

        // Convert map to array
        const uniqueResults = Array.from(uniqueResultsMap.values());

        // Remove duplicate entries in "Detail" and recalculate "WinLoss"
        uniqueResults.forEach(status => {
            const uniqueDetailsMap = new Map();
            status.Detail.forEach(detail => {
                const key = `${detail.SessionStartDateTime}-${detail.SessionEndDateTime}-${detail.MachineNumber}`;
                if (!uniqueDetailsMap.has(key)) {
                    uniqueDetailsMap.set(key, detail);
                }
            });
            status.Detail = Array.from(uniqueDetailsMap.values());
            status.WinLoss = status.Detail.reduce((total, record) => total + (record.WinLoss || 0), 0);

            // Calculate unique MachineNumbers
            const uniqueMachineNumbers = new Set(status.Detail.map(detail => detail.MachineNumber));
            status.MachineNumber = Array.from(uniqueMachineNumbers);
        });

        // Sort the data by "Number"
        uniqueResults.sort((a, b) => {
            if (sortOrder === 'DESC') {
                return b.Number - a.Number;
            } else {
                return a.Number - b.Number;
            }
        });

        return uniqueResults;
    } catch (error) {
        console.log(`An error occurred in getMachinePlayingStatusWinLoss: ${error}`);
        throw error; // Rethrow error for further handling
    }
}



// MACHINE PLAYING COMBINE WITH WIN/LOSS
async function getMachinePlayingStatusWinLossFix(date, sortOrder = 'ASC',) {
    try {
        // Define the timezone (e.g., 'Asia/Bangkok')
        const timezone = 'Asia/Bangkok';
        // Create start and end date in local timezone
        const startDate = moment.tz(date, timezone).startOf('day').add(6, 'hours').toDate();
        const middleDate = moment.tz(date, timezone).add(2, 'days').startOf('day').add(6, 'hours').toDate();

        let now = new Date();
        let startDay = new Date(now.toLocaleDateString('sv'));
        startDay.setHours(6, 0, 0, 0);
        let nextDay = new Date();
        nextDay.setDate(startDay.getDate() + 1);

        // console.log('Start Date:', startDay);
        // console.log('End Date:', nextDay);

        let pool = await sql.connect(config);
        let query = await pool.request()
            .input('start_date', sql.DateTime, startDay)
            .input('end_date', sql.DateTime, nextDay)
            .query(`SELECT dbo.[MachinePlayerSession].CustomerID, dbo.customer.Number, dbo.Customer.PreferredName, dbo.Machine.Number as MachineNumber, [StartGamingDate], [EndDateTime], dbo.machineplayersession.[Status]
                FROM ${DBNAME}.[dbo].[MachinePlayerSession]
                JOIN dbo.Machine ON dbo.machine.MachineID = dbo.MachinePlayerSession.MachineID
                JOIN dbo.Customer ON dbo.customer.CustomerID = dbo.MachinePlayerSession.CustomerID
                WHERE dbo.machineplayersession.Status = '1'
                AND StartDateTime >= @start_date
                AND StartDateTime < @end_date`);

        const machinePlayingStatus = query.recordset;
        // Fetch Win/Loss data concurrently for all customers
        const fetchWinLossPromises = machinePlayingStatus.map(async (status) => {
            try {
                const winLostData = await getWinLostByDateFix(date, status.Number.toString());
                const totalWinLoss = winLostData.reduce((total, record) => total + (record.WinLoss || 0), 0);
                status.WinLoss = totalWinLoss;
                status.Detail = winLostData.map(record => ({
                    SessionStartDateTime: record.SessionStartDateTime,
                    SessionEndDateTime: record.SessionEndDateTime,
                    MachineNumber: record.MachineNumber || null, // Ensure we handle null values
                    WinLoss: record.WinLoss
                }));
                // console.log(`status.MachineNumber: ${status.MachineNumber}`);
            } catch (error) {
                console.log(`An error occurred while fetching win/loss data for customer number ${status.Number}: ${error}`);
            }
            return status;
        });

        let results = await Promise.all(fetchWinLossPromises);

        // Consolidate entries with the same "Number"
        const uniqueResultsMap = new Map();

        results.forEach(status => {
            if (uniqueResultsMap.has(status.Number)) {
                let existingEntry = uniqueResultsMap.get(status.Number);
                existingEntry.WinLoss += status.WinLoss;
                const newMachineNumbers = status.MachineNumber.length > 0 ? status.MachineNumber : [record?.MachineNumber || 'Unknown'];
                existingEntry.MachineNumber = Array.from(new Set(existingEntry.MachineNumber.concat(newMachineNumbers)));
                // Concatenate details
                existingEntry.Detail = existingEntry.Detail.concat(status.Detail);
            } else {
                uniqueResultsMap.set(status.Number, {
                    ...status,
                    MachineNumber: status.MachineNumber.length > 0 ? status.MachineNumber : [record?.MachineNumber || 'Unknown'],
                });
            }
        });

        // Convert map to array
        const uniqueResults = Array.from(uniqueResultsMap.values());

        // Remove duplicate entries in "Detail" and recalculate "WinLoss"
        uniqueResults.forEach(status => {
            const uniqueDetailsMap = new Map();
            status.Detail.forEach(detail => {
                const key = `${detail.SessionStartDateTime}-${detail.SessionEndDateTime}-${detail.MachineNumber}`;
                if (!uniqueDetailsMap.has(key)) {
                    uniqueDetailsMap.set(key, detail);
                }
            });
            status.Detail = Array.from(uniqueDetailsMap.values());
            status.WinLoss = status.Detail.reduce((total, record) => total + (record.WinLoss || 0), 0);

            // Calculate unique MachineNumbers
            let uniqueMachineNumbers = new Set(status.Detail.map(detail => detail.MachineNumber));
            // If the set is empty, assign it a default array
            if (uniqueMachineNumbers.size === 0) {
                uniqueMachineNumbers = new Set([status.MachineNumber]);
            }
            status.MachineNumber = Array.from(uniqueMachineNumbers);
            // console.log(`number: ${status.Number} | machine arr : ${status.MachineNumber} | machine ${Array.from(uniqueMachineNumbers)}`);

        });

        // Sort the data by "Number"
        uniqueResults.sort((a, b) => {
            if (sortOrder === 'DESC') {
                return b.Number - a.Number;
            } else {
                return a.Number - b.Number;
            }
        });



        return uniqueResults;
    } catch (error) {
        console.log(`An error occurred in getMachinePlayingStatusWinLoss: ${error}`);
        throw error; // Rethrow error for further handling
    }
}



async function getMachinePlayingStatusWinLossRange(sortOrder = 'ASC') {
    try {
        const today = new Date();
        const startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 6, 0, 0));
        // Create tomorrow's date in UTC at 6:00 AM
        const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 6, 0, 0));

        // console.log('Start Date:', startDate); // 2024-08-19T06:00:00.000Z
        // console.log('End Date:', endDate); // 2024-08-20T06:00:00.000Z
        let pool = await sql.connect(config);
        let query = await pool.request()
            .input('start_date', sql.Date, startDate)
            .input('end_date', sql.Date, endDate)
            .query(`SELECT dbo.[MachinePlayerSession].CustomerID, dbo.customer.Number, dbo.Customer.PreferredName, dbo.Machine.Number as MachineNumber, [StartGamingDate], [EndDateTime], dbo.machineplayersession.[Status]
                    FROM ${DBNAME}.[dbo].[MachinePlayerSession]
                    JOIN dbo.Machine ON dbo.machine.MachineID = dbo.MachinePlayerSession.MachineID
                    JOIN dbo.Customer ON dbo.customer.CustomerID = dbo.MachinePlayerSession.CustomerID
                    WHERE dbo.machineplayersession.Status = '1'
                    AND StartGamingDate BETWEEN @start_date AND  @end_date`);

        const machinePlayingStatus = query.recordset;

        // Fetch Win/Loss data concurrently for all customers
        const fetchWinLossPromises = machinePlayingStatus.map(async (status) => {
            try {
                const winLostData = await getWinLostByDateRange(startDate, endDate, status.Number.toString());
                const totalWinLoss = winLostData.reduce((total, record) => total + (record.WinLoss || 0), 0);
                status.WinLoss = totalWinLoss;
                status.Detail = winLostData.map(record => ({
                    SessionStartDateTime: record.SessionStartDateTime,
                    SessionEndDateTime: record.SessionEndDateTime,
                    MachineNumber: record.MachineNumber,
                    WinLoss: record.WinLoss
                }));
                // Ensure MachineNumber is correctly set
                status.MachineNumber = winLostData.length > 0
                    ? winLostData.map(record => record.MachineNumber)
                    : [status.MachineNumber] || [];

            } catch (error) {
                console.log(`An error occurred while fetching win/loss data for customer number ${status.Number}: ${error}`);
                status.WinLoss = 0;
                status.Detail = [];
                status.MachineNumber = [status.MachineNumber] || [];
            }
            return status;
        });

        let results = await Promise.all(fetchWinLossPromises);

        // Consolidate entries with the same "Number"
        const uniqueResultsMap = new Map();

        results.forEach(status => {
            if (uniqueResultsMap.has(status.Number)) {
                let existingEntry = uniqueResultsMap.get(status.Number);
                existingEntry.WinLoss += status.WinLoss;
                existingEntry.MachineNumber = Array.from(new Set(existingEntry.MachineNumber.concat(status.MachineNumber)));
                existingEntry.Detail = existingEntry.Detail.concat(status.Detail);
            } else {
                uniqueResultsMap.set(status.Number, {
                    ...status,
                    MachineNumber: [...new Set(status.MachineNumber)],
                });
            }
        });

        // Convert map to array
        const uniqueResults = Array.from(uniqueResultsMap.values());

        // Remove duplicate entries in "Detail" and recalculate "WinLoss"
        uniqueResults.forEach(status => {
            const uniqueDetailsMap = new Map();
            status.Detail.forEach(detail => {
                const key = `${detail.SessionStartDateTime}-${detail.SessionEndDateTime}-${detail.MachineNumber}`;
                if (!uniqueDetailsMap.has(key)) {
                    uniqueDetailsMap.set(key, detail);
                }
            });
            status.Detail = Array.from(uniqueDetailsMap.values());
            status.WinLoss = status.Detail.reduce((total, record) => total + (record.WinLoss || 0), 0);

            // Calculate unique MachineNumbers from the Detail array
            const uniqueMachineNumbers = new Set(status.Detail.map(detail => detail.MachineNumber));
            status.MachineNumber = Array.from(uniqueMachineNumbers);

            // If MachineNumber is empty but there was data originally, set it
            if (status.MachineNumber.length === 0) {
                status.MachineNumber = [...new Set(results.find(r => r.Number === status.Number).MachineNumber)];
            }
        });

        // Sort the data by "Number"
        uniqueResults.sort((a, b) => {
            if (sortOrder === 'DESC') {
                return b.Number - a.Number;
            } else {
                return a.Number - b.Number;
            }
        });

        return uniqueResults;
    } catch (error) {
        console.log(`An error occurred in getMachinePlayingStatusWinLoss: ${error}`);
        throw error; // Rethrow error for further handling
    }
}





//GET CUSTOMER NATIONALITY
async function getUserNationality(number) {
    const query = `SELECT [Number] ,[Title],[PreferredName],[ISOCode],[ISOCode2],[Nationality] ,dbo.Country.Nationality FROM ${DBNAME}.[dbo].[Customer] Join dbo.Country on dbo.country.CountryID=dbo.Customer.CountryID Where number=@input_number`;
    let messageError = "not found user nationality";
    try {
        let pool = await sql.connect(config);
        let nationality = await pool.request().input('input_number', sql.NVarChar, number).query(query)
        if (nationality.recordset) {
            return {
                "status": true,
                "message": 'found user nationality',
                "data": nationality.recordset,
            }
        } else {
            console.log('no rows affected ');
            return {
                "status": false,
                "message": messageError,
                "data": null,
            }
        }
    } catch (error) {
        console.log(`An error orcur get user nationality: ${error}`)
        return {
            "status": false,
            "message": messageError,
            "data": null,
        }
    }
}



module.exports = {
    //tournament
    listTournamentByDate: listTournamentByDate,
    //list customer by level
    listCustomerByLevelLimit: listCustomerByLevelLimit,
    getUserNationality: getUserNationality,
    getPointByID: getPointByID,
    getPointsByDates: getPointsByDates,
    getPointsByDatesRange: getPointsByDatesRange,
    getCardNumberByID: getCardNumberByID,
    getPointCurrentByCardTrack: getPointCurrentByCardTrack,
    getPointCurrentByCardTrackFullInfor: getPointCurrentByCardTrackFullInfor,
    getPointCurrentByCardTrackRange: getPointCurrentByCardTrackRange,
    getPointCurrentByNumberRange: getPointCurrentByNumberRange,
    getPointUser: getPointUser,
    getJackPotHistory: getJackPotHistory,
    getJackPotHistoryFloor:getJackPotHistoryFloor, //JP history floor
    getJackPotHistoryID: getJackPotHistoryID,
    getMachinePlayer: getMachinePlayer,
    getUserRegisterDate: getUserRegisterDate,
    getUserRegisterDates: getUserRegisterDates,
    searchCustomerName: searchCustomerName,
    getMachinePlayerByMachineNum: getMachinePlayerByMachineNum,



    findGameThemeNumber: findGameThemeNumber,
    findUserLoginStatus: findUserLoginStatus,
    findFrameCustomer: findFrameCustomer,
    getDateFrameByNumber: getDateFrameByNumber,
    getallGameTheme: getallGameTheme,
    getUserNameNumber: getUserNameNumber,

    getJackPotMachineByDate: getJackPotMachineByDate,
    getJackPotMachine: getJackPotMachine,
    getJackPotMachineJJBX: getJackPotMachineJJBX,
    getJackPotMachineJJBXPastMonth: getJackPotMachineJJBXPastMonth,
    getJackPotMachineJJBXByDate: getJackPotMachineJJBXByDate,
    getJackPotMachineForPastMonth: getJackPotMachineForPastMonth,
    //Win/Loss
    getMachinePlayingStatusWinLoss: getMachinePlayingStatusWinLoss,
    getWinLostByDate: getWinLostByDate,


    // getWinLostByDateFix:getWinLostByDateFix,
    getWinLostByDateRange: getWinLostByDateRange,
    getMachinePlayingStatusWinLossFix: getMachinePlayingStatusWinLossFix,
    getMachinePlayingStatusWinLossRange: getMachinePlayingStatusWinLossRange,
    //face recognize
    getFaceRecognizeToday:getFaceRecognizeToday,
    getFaceRecognizeFull:getFaceRecognizeFull ,
    //gaming session today
    getGamingSessionToday:getGamingSessionToday,
    //gaming playing status: floor 2
    getMachineOnlineStatusFloor2:getMachineOnlineStatusFloor2,
    //get customer info with HOST
    getCustomerWHost: getCustomerWHost,
}
