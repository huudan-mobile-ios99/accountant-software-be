const e = require('express');
const connection = require('./dbconfig_mysql');
const moment = require('moment-timezone');
const DBNAME = '[neoncmsprod]';

const sql = require("mssql");
const config = require("./dbconfig");


async function getListCustomerForAccountantSoftware(page = 1, limit = 100) {
    console.log(`getListCustomerForAccountantSoftware | page=${page}, limit=${limit}`);
    const offset = (page - 1) * limit;

    const query = `
        SELECT [Number],
                c.Surname,
                c.[Forename],
                c.MiddleName,
                c.SurnameSoundsLike,
                c.[Title],
                c.[PreferredName],
               CASE [Gender]
                    WHEN 1 THEN 'Male'
                    WHEN 2 THEN 'Female'
                    ELSE 'Not Specified'
               END AS Gender,
               [DateOfBirth],
               co.Name AS [National],
               co.Nationality,
               ci.Reference AS [Passport],
               ci.ExpiryDate AS PassportExpiryDate
        FROM [neoncmsprod].[dbo].[Customer] AS c
        JOIN dbo.CustomerIdentification AS ci
          ON ci.CustomerID = c.CustomerID
        JOIN dbo.Country AS co
          ON co.CountryID = c.CountryID
        ORDER BY c.CustomerID
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS totalCount
        FROM [neoncmsprod].[dbo].[Customer];
    `;

    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        request.input("offset", sql.Int, offset);
        request.input("limit", sql.Int, limit);

        const result = await request.query(query);
        await pool.close();

        const data = result.recordsets[0];
        const totalCount = result.recordsets[1][0].totalCount;
        const hasData = data.length > 0;

        return {
            status: hasData,
            message: hasData
                ? `Found ${data.length} customers (page ${page} of ${Math.ceil(totalCount / limit)})`
                : "No customer data found",
            data: {
                page,
                limit,
                totalCount: hasData ? totalCount : 0,
                totalPages: hasData ? Math.ceil(totalCount / limit) : 0,
                customers: data
            }
        };
    } catch (error) {
        console.error("SQL error:", error);

        return {
            status: false,
            message: "server error",
            data: {
                page,
                limit,
                totalCount: 0,
                totalPages: 0,
                customers: []
            }
        };
    }
}




// ✅ Get customers by gaming date
async function getCustomersByGamingDate(date) {
    console.log(`getCustomersByGamingDate `);
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input("GamingDate", sql.Date, date)
            .query(`
                SELECT
                    [Number],
                    [PreferredName],
                    dbo.Country.Name AS [National],
                    dbo.Country.Nationality,
                    dbo.CustomerIdentification.Reference AS Passport,
                    dbo.Visit.GamingDate
                FROM [neoncmsprod].[dbo].[Customer]
                JOIN dbo.CustomerIdentification
                    ON dbo.CustomerIdentification.CustomerID = dbo.Customer.CustomerID
                JOIN dbo.Country
                    ON dbo.Country.CountryID = dbo.Customer.CountryID
                JOIN dbo.Visit
                    ON dbo.Visit.CustomerID = dbo.Customer.CustomerID
                WHERE dbo.Visit.GamingDate = @GamingDate
                ORDER BY dbo.Customer.Number
            `);

        const customers = result.recordset;

        if (customers.length === 0) {
            return {
                status: false,
                message: `No customers found for date ${date}`,
                data: []
            };
        }

        return {
            status: true,
            message: `Found ${customers.length} customers for date ${date}`,
            data: customers
        };

    } catch (error) {
        console.error("Error fetching customers by gaming date:", error);
        return {
            status: false,
            message: "error",
            data: []
        };
    }
}

async function getAlertBillByDate(date, page = 1, limit = 50) {
  try {
    const pool = await sql.connect(config);

    const offset = (page - 1) * limit;

    // ⭐ 1. Get total count
    const countResult = await pool.request()
      .input("date", sql.Date, date)
      .query(`
          SELECT COUNT(*) AS total
          FROM dbo.Alert A
          JOIN dbo.Machine M ON M.MachineID = A.MachineID
          JOIN dbo.Customer C ON C.CustomerID = A.CustomerID
          WHERE CAST(A.GamingDate AS DATE) = @date
            AND A.AlertConfigurationID BETWEEN 51 AND 56
      `);

    const total = countResult.recordset[0].total;

    // ⭐ 2. Get paginated rows
    const dataResult = await pool.request()
      .input("date", sql.Date, date)
      .input("limit", sql.Int, limit)
      .input("offset", sql.Int, offset)
      .query(`
          SELECT
            A.GamingDate,
            A.ActualDateTime,
            C.Number AS CustomerNumber,
            C.PreferredName,
            A.Item AS MachineNumber,
            A.Detail
          FROM dbo.Alert A
          JOIN dbo.Machine M ON M.MachineID = A.MachineID
          JOIN dbo.Customer C ON C.CustomerID = A.CustomerID
          WHERE CAST(A.GamingDate AS DATE) = @date
            AND A.AlertConfigurationID BETWEEN 51 AND 56
          ORDER BY C.Number ASC, A.ActualDateTime ASC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    return {
      total,
      page,
      limit,
      data: dataResult.recordset
    };

  } catch (err) {
    console.error("DB Error getAlertBillByDate:", err);
    throw err;
  }
}



//GET TICKET TRANSACTION BY DATE
// Get ticket transactions by gaming date (with pagination)
async function getTicketTransactionByGamingDate(gamingDate, page = 1, limit = 100) {
    console.log(`getTicketTransactionByGamingDate | date=${gamingDate}, page=${page}, limit=${limit}`);
    const offset = (page - 1) * limit;

    const query = `
        SELECT
              c.Number AS CustomerNumber
            , c.Forename
            , c.MiddleName
            , c.Surname
            , c.PreferredName
            , t.GamingDate
            , tit.Number AS TicketNumber
            , tk.Amount
            , t.TransactionDateTime
            , t.TransactionNumber
            , t.SystemComment
        FROM [neoncmsprod].[dbo].[Transaction] t
        JOIN dbo.TicketingIssueTransaction tit
            ON t.TransactionID = tit.TransactionID
        JOIN dbo.Ticket tk
            ON tk.Number = tit.Number
        JOIN dbo.Customer c
            ON c.CustomerID = t.CustomerID
        WHERE t.GamingDate = @gamingDate
        ORDER BY t.TransactionDateTime
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS totalCount
        FROM [neoncmsprod].[dbo].[Transaction] t
        WHERE t.GamingDate = @gamingDate;
    `;

    try {
        const pool = await sql.connect(config);
        const request = pool.request();

        request.input("gamingDate", sql.Date, gamingDate);
        request.input("offset", sql.Int, offset);
        request.input("limit", sql.Int, limit);

        const result = await request.query(query);
        await pool.close();

        const data = result.recordsets[0];
        const totalCount = result.recordsets[1][0].totalCount;
        const hasData = data.length > 0;

        return {
            status: hasData,
            message: hasData
                ? `Found ${data.length} ticket transactions (page ${page} of ${Math.ceil(totalCount / limit)})`
                : "No ticket transactions found",
            data: {
                gamingDate,
                page,
                limit,
                totalCount: hasData ? totalCount : 0,
                totalPages: hasData ? Math.ceil(totalCount / limit) : 0,
                transactions: data
            }
        };
    } catch (error) {
        console.error("SQL error:", error);

        return {
            status: false,
            message: "server error",
            data: {
                gamingDate,
                page,
                limit,
                totalCount: 0,
                totalPages: 0,
                transactions: []
            }
        };
    }
}





module.exports = {
    //get customer list
    getListCustomerForAccountantSoftware:getListCustomerForAccountantSoftware,
    getCustomersByGamingDate:getCustomersByGamingDate,
    //alert bill
    getAlertBillByDate:getAlertBillByDate,
    getTicketTransactionByGamingDate:getTicketTransactionByGamingDate,
}
