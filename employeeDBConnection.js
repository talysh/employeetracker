const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require('util');

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_db"
});

// Promisifying connection query
const query = util.promisify(connection.query).bind(connection);

connection.connect(function (err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    afterConnection();
});

// Getting list of employees and returning it as an array
const getListOfEmployees = async () => {
    var listOfEmployees = [];
    try {
        const result = await query("SELECT id, first_name, last_name FROM employee");
        result.forEach(object => {
            let employee = Object.values(object).join(" ");
            listOfEmployees.push(employee);
        });
    } catch (error) {
        throw error;
    }
    return listOfEmployees;
}


// Removing employee from database

const removeEmployee = async () => {
    const employeeList = await getListOfEmployees();
    inquirer.prompt([{
        name: "employee",
        type: "list",
        choices: employeeList,
        message: "Which employee would you like to remove?"

    }]).then((answers) => {
        const removeId = answers.employee.split(" ")[0];
        console.log(removeId);
        connection.query("DELETE FROM employee WHERE id = ?", removeId, (err, result) => {
            if (err) throw err;
        });
        selectAction();
    });
}


// Adding employee to database
const addEmployee = () => {
    inquirer.prompt([{
        name: "first_name",
        type: "input",
        message: "What is the employee's first name?"
    }, {
        name: "last_name",
        type: "input",
        message: "What is the employee's last name?"
    }, {
        name: "role",
        type: "list",
        message: "What is the employee's role?",
        choices: [
            "Sales Lead",
            "Salesperson",
            "Lead Engineer",
            "Software Engineer",
            "Account Manager",
            "Accountant",
            "Legal Team Lead",
        ]
    }, {
        name: "manager",
        type: "input",
        message: "Who is the employee's manager?"
    }
    ]).then((answers) => {
        const role_id = getRoleId(answers.role);
        const manager_id = getManagerId();
        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)", [answers.first_name, answers.last_name, role_id, manager_id], (err, result) => {
            console.log(result);
            selectAction();
        });
    });
}


// Return role ID given the role 
const getRoleId = (role) => {
    let roleId;
    switch (role) {
        case "Sales Lead":
            roleId = 1;
            break;
        case "Salesperson":
            roleId = 2;
            break;
        case "Lead Engineer":
            roleId = 3;
            break;
        case "Software Engineer":
            roleId = 4;
            break;
        case "Account Manager":
            roleId = 5;
            break;;
        case "Accountant":
            roleId = 6;
            break;
        case "Legal Team Lead":
            roleId = 7;
            break;
        default:
            roleId = 0;
    }
    return roleId;
}


const getManagerId = () => {
    return 2;
}

const selectAction = () => {
    inquirer.prompt([{
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees By Department",
            "View All Employees By Manager",
            "Add Employee",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager",
            "Exit"
        ]
    }]).then((answers) => {
        switch (answers.action) {
            case "View All Employees":
                break;
            case "View All Employees By Department":
                break;
            case "View All Employees By Manager":
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee Role":
                break;
            case "Update Employee Manager":
                break;
            case "Exit":
                connection.end();
                break;
        }
    });
}

const afterConnection = () => {
    selectAction();

    // connection.query("SELECT * FROM employee", (err, res) => {
    //     if (err) throw err;
    //     console.log(res);
    //     connection.end();
    // });
}